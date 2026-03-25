# Clinova v2 — Plan de Mejoras

> Última revisión: 2026-03-25
> Alcance: seguridad, integridad de datos, performance, UX, deuda técnica

---

## Criterios de Priorización

Cada mejora se evalúa en tres dimensiones:

- **Impacto** — consecuencia real si no se arregla (datos corruptos, brecha de seguridad, UX rota)
- **Esfuerzo** — tiempo estimado de implementación
- **Urgencia** — ¿puede afectar a usuarios/datos en producción hoy?

---

## Fase 1 — Crítico (hacer antes de siguiente release)

### 1.1 · Agregar scope de clínica en todas las mutaciones

**Por qué primero:**
Es el riesgo de seguridad más severo. Un staff de la Clínica A puede hoy modificar o eliminar datos de la Clínica B solo conociendo un `id`. En un sistema médico esto es una brecha HIPAA/GDPR.

**Archivos afectados:**

| Acción | Archivo | Vulnerabilidad |
|--------|---------|---------------|
| `updateUser` / `deleteUser` | `lib/actions/users.ts:131,155` | Cualquier staff puede borrar perfiles ajenos |
| `updatePhysiotherapist` / `deletePhysiotherapist` | `lib/actions/physiotherapists.ts:165,201` | Idem para fisioterapeutas |
| `updateAppointmentTime` | `lib/actions/appointments-calendar.ts:63` | Modificar citas de otras clínicas |
| `togglePatientReminders` | `lib/actions/reminders.ts:118` | Desactivar recordatorios de pacientes ajenos |

**Solución:**
Agregar `.eq('clinic_id', profile.clinic_id)` a cada query de mutación, después del `.eq('id', id)`. Si el registro no pertenece a la clínica, Supabase retorna 0 filas y se lanza un error controlado.

```ts
// Patrón correcto
const { error } = await supabase
  .from('profiles')
  .update(data)
  .eq('id', id)
  .eq('clinic_id', profile.clinic_id) // ← esto falta hoy
```

---

### 1.2 · Validar estado de acceso portal en el middleware

**Por qué segundo:**
Al revocar acceso de un paciente al portal, hoy solo se marca `is_active=false` en DB pero el usuario de Supabase Auth queda activo. El paciente puede seguir autenticándose indefinidamente.

**Archivo afectado:** `lib/actions/patient-portal-access.ts:145`

**Solución:**
Dos cambios complementarios:

1. Al revocar: llamar `supabase.auth.admin.deleteUser(patientUser.user_id)` (la línea comentada).
2. En el middleware del portal (`middleware.ts`): después de validar el JWT, verificar que `patient_portal_access.is_active = true` antes de permitir el acceso. Así incluso si el Auth user sobrevive, la sesión se rechaza en la capa de aplicación.

---

### 1.3 · Corregir CSRF en OAuth de Google Calendar

**Por qué tercero:**
El callback de Google Calendar no valida parámetro `state`. Un atacante podría hacer que un usuario de Clinova linkee su cuenta al Google Calendar del atacante (OAuth CSRF clásico).

**Archivo afectado:** `app/api/calendar/callback/route.ts`

**Solución:**
1. Al iniciar el flujo OAuth: generar un token aleatorio, guardarlo en la sesión del usuario y pasarlo como parámetro `state` en la URL de autorización de Google.
2. En el callback: comparar el `state` recibido con el guardado en sesión. Rechazar si no coinciden.

```ts
// En el inicio del flujo
const state = crypto.randomUUID()
await setSessionValue('oauth_state', state)
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?...&state=${state}`

// En el callback
const { state } = searchParams
const savedState = await getSessionValue('oauth_state')
if (state !== savedState) return NextResponse.json({ error: 'Invalid state' }, { status: 403 })
```

---

### 1.4 · Envolver el registro de pagos en una transacción

**Por qué cuarto:**
`recordPayment` hace dos operaciones: insert en `payments` + update en `treatment_plans.paid_amount`. Si la segunda falla (timeout, constraint), el pago queda registrado pero el saldo del plan no se actualiza. Inconsistencia financiera difícil de detectar.

**Archivo afectado:** `lib/actions/finance.ts:188-216`

**Solución:**
Mover la lógica a una función RPC (stored procedure) en Supabase que ejecute ambas operaciones en una sola transacción atómica. Si cualquiera falla, se hace rollback completo.

```sql
-- supabase/migrations/xxxx_record_payment_transaction.sql
CREATE OR REPLACE FUNCTION record_payment(
  p_clinic_id uuid, p_plan_id uuid, p_amount numeric, ...
) RETURNS void AS $$
BEGIN
  INSERT INTO payments (...) VALUES (...);
  UPDATE treatment_plans SET paid_amount = paid_amount + p_amount WHERE id = p_plan_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Fase 2 — Alta Prioridad (próximo sprint)

### 2.1 · Extraer helper `getAuthContext()` para eliminar boilerplate

**Por qué:**
El patrón "obtener user → obtener clinic_id" está copiado literalmente en los 24 archivos de actions (~120 líneas duplicadas). Cada copia es un punto de falla potencial y hace difícil agregar lógica transversal (logging, auditoría, caché).

**Propuesta:**

```ts
// lib/actions/_auth.ts (nuevo archivo)
export async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id, role, permissions')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) throw new Error('No clinic assigned')

  return { supabase, user, profile, clinicId: profile.clinic_id }
}
```

Impacto: reducción de ~120 líneas, un solo lugar para agregar auditoría o rate limiting en el futuro.

---

### 2.2 · Agregar filtro de rango de fechas al calendario

**Por qué:**
`getAppointmentsForCalendar` trae **todas las citas de la clínica sin límite de fecha**. Una clínica con 2 años de operación puede tener miles de registros enviados al cliente en cada render del calendario.

**Archivo afectado:** `lib/actions/appointments-calendar.ts:7`

**Solución:**
Recibir `startDate` y `endDate` como parámetros y agregar filtros `.gte('date', startDate).lte('date', endDate)`. El componente de calendario debe pasar el rango visible actual (mes/semana/día).

```ts
// Patrón: solo cargar el mes visible + 1 semana buffer
const start = startOfMonth(currentDate)
const end = endOfMonth(currentDate)
await getAppointmentsForCalendar(clinicId, start, endOfWeek(add(end, { weeks: 1 })))
```

---

### 2.3 · Paralelizar queries del dashboard

**Por qué:**
`getDashboardMetrics` ejecuta 8 queries de forma secuencial. `getRevenueChartData` ejecuta 6 queries en un loop (una por mes). El tiempo de carga del dashboard es la suma de todos los tiempos individuales.

**Archivo afectado:** `lib/actions/dashboard.ts`

**Solución:**

```ts
// En lugar de await query1; await query2; await query3...
const [metrics, revenue, alerts] = await Promise.all([
  supabase.from('appointments').select(...),
  supabase.from('payments').select(...),
  supabase.from('...').select(...)
])

// Para el gráfico de ingresos: una sola query con GROUP BY mes
// en lugar de 6 queries individuales
```

---

### 2.4 · Bajar el filtrado de búsqueda a la base de datos

**Por qué:**
`searchGlobal` trae hasta N filas de citas, pagos y sesiones sin filtro y los filtra en JavaScript. Para clínicas con historial grande, esto trae datos innecesarios por red y es O(n) en memoria del servidor.

**Archivo afectado:** `lib/actions/search.ts:67-134`

**Solución:**
Usar `.or('field.ilike.%query%,other_field.ilike.%query%')` en cada query, igual que ya se hace para pacientes. El filtro en JS se elimina.

---

### 2.5 · Usar `upsert` en configuración de recordatorios

**Por qué:**
`updateReminderSettings` usa `.update()` pero las clínicas nuevas no tienen fila en `reminder_settings`. La operación retorna `{ success: true }` sin guardar nada. El staff de una clínica nueva configura sus recordatorios y la configuración desaparece silenciosamente.

**Archivo afectado:** `lib/actions/reminders.ts:35,84`

**Solución:**

```ts
// Cambiar .update() por .upsert() con conflict resolution
await supabase
  .from('reminder_settings')
  .upsert({ clinic_id: clinicId, ...settings }, { onConflict: 'clinic_id' })
```

---

### 2.6 · Optimizar el cron job de recordatorios

**Por qué:**
Para 20 clínicas × 3 ventanas de tiempo = 60+ queries por ejecución del cron. A medida que la plataforma escale, esto se vuelve un cuello de botella y puede exceder los límites de rate de Supabase.

**Archivo afectado:** `app/api/cron/reminders/route.ts:40`

**Solución:**
Consolidar en una sola query que traiga todas las citas próximas de todas las clínicas con sus configuraciones de recordatorio en un JOIN, y procesar el resultado en memoria una sola vez.

---

## Fase 3 — Mejoras de UX y Funcionalidades Pendientes

### 3.1 · PDF de recibos en portal del paciente

**Estado actual:** La función `generatePaymentReceipt` está importada pero hay un `alert()` de placeholder.
**Archivo:** `app/portal/payments/page.tsx:100`
**Esfuerzo:** Bajo (la lógica PDF ya existe, solo conectar).

---

### 3.2 · Nombre de clínica dinámico en reportes PDF

**Estado actual:** `clinicName: 'AxoMed'` hardcodeado en el reporte de finanzas.
**Archivo:** `app/dashboard/finance/page.tsx:228`
**Esfuerzo:** Bajo (agregar fetch del perfil de clínica a `fetchData`).

---

### 3.3 · Sincronización bidireccional con Google Calendar

**Estado actual:** Solo se hace push al crear una cita. Updates y cancelaciones en Clinova no se reflejan en Google Calendar.
**Esfuerzo:** Medio. Requiere guardar el `google_event_id` por cita y llamar a `calendar.events.patch`/`delete` en los actions correspondientes.

---

### 3.4 · Agregar estados de error en páginas cliente

**Estado actual:** Si cualquier Server Action falla, las páginas muestran vacío sin feedback al usuario.

**Páginas afectadas:**

| Página | Comportamiento actual | Comportamiento correcto |
|--------|-----------------------|------------------------|
| `app/dashboard/agenda/page.tsx` | Lista vacía sin mensaje | Toast de error + botón reintentar |
| `app/dashboard/finance/page.tsx` | Tabla vacía | Estado de error con retry |
| `app/dashboard/emr/page.tsx` | Sin sesiones | Indicador de error |
| `app/portal/payments/page.tsx` | `<p>Cargando...</p>` perpetuo | Skeleton + error state |

---

### 3.5 · Permitir agendar citas desde el portal del paciente

**Estado actual:** El portal solo lista y cancela citas.
**Propuesta:** Agregar flujo de booking en `/portal/appointments/new` con selector de fisioterapeuta, fecha disponible y tipo de servicio. Reutilizar la lógica de disponibilidad existente en `lib/actions/availability.ts`.

---

## Fase 4 — Deuda Técnica

### 4.1 · Eliminar usos de `: any` en actions

26 ocurrencias en 12 archivos. La mayoría son joins de Supabase que devuelven tipos `unknown`. Resolver con tipos genéricos o casting tipado desde `lib/database.types.ts`.

---

### 4.2 · Usar `createAdminClient()` centralizado

`lib/actions/physiotherapists.ts` y `lib/actions/admin.ts` construyen el cliente admin inline leyendo directamente `process.env.SUPABASE_SERVICE_ROLE_KEY`. Existe `lib/supabase/admin.ts` para esto.

---

### 4.3 · Corregir typo `hoursBefor` en cron job

`app/api/cron/reminders/route.ts:60` — usado en 12 lugares del mismo archivo. Renombrar a `hoursBefore`.

---

### 4.4 · Dividir componentes grandes

| Componente | Líneas | Propuesta |
|---|---|---|
| `components/patients/IntakeEvaluationForm.tsx` | 785 | Separar en secciones: `PersonalDataSection`, `MedicalHistorySection`, `MeasurementsSection` |
| `components/emr/InitialEvaluationWizard.tsx` | 504 | Extraer estado del wizard a un custom hook `useEvaluationWizard` |
| `components/emr/SessionModal.tsx` | 404 | Separar formulario de modal wrapper |

---

### 4.5 · Validar `CRON_SECRET` contra `undefined`

`app/api/cron/reminders/route.ts:15` — Si `CRON_SECRET` no está definido en env, la comparación acepta `'Bearer undefined'`.

```ts
// Agregar al inicio del handler
if (!process.env.CRON_SECRET) {
  console.error('CRON_SECRET is not configured')
  return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
}
```

---

## Resumen Visual

```
FASE 1 — Crítico          FASE 2 — Alta prioridad     FASE 3 — UX              FASE 4 — Deuda
─────────────────         ───────────────────────     ────────────────         ──────────────
[1.1] IDOR clinic scope   [2.1] getAuthContext()       [3.1] PDF recibos        [4.1] Eliminar :any
[1.2] Portal middleware   [2.2] Date range calendar    [3.2] Nombre clínica PDF [4.2] createAdminClient
[1.3] OAuth CSRF state    [2.3] Promise.all dashboard  [3.3] GCal bidireccional [4.3] Typo hoursBefor
[1.4] DB transaction      [2.4] Search en DB           [3.4] Error states UI    [4.4] Split components
                          [2.5] Upsert reminders       [3.5] Booking portal     [4.5] CRON_SECRET check
                          [2.6] Optimizar cron
```

---

## Orden de Implementación Recomendado

1. **1.1** → seguridad crítica, cambio quirúrgico de una línea por acción
2. **1.4** → integridad financiera, migración SQL + refactor action
3. **1.2** → seguridad portal, dos cambios independientes
4. **1.3** → seguridad OAuth, antes de habilitar Google Calendar a más clínicas
5. **2.1** → base para todo lo demás (helper reutilizable)
6. **2.5** → bug silencioso que afecta clínicas nuevas
7. **2.2 + 2.3** → performance visible en clínicas con historial
8. **2.4** → mejora search sin riesgo de regresión
9. **2.6** → solo relevante cuando escale a >10 clínicas
10. **Fase 3 y 4** → en orden de valor percibido por el usuario

---

*Documento generado por análisis estático del codebase. Prioridades ajustadas para contexto de sistema médico multi-tenant.*
