# Portal del Paciente — Plan de Mejoras

> Revisión: 2026-03-25
> Estado actual: ~60% completo · Funciona como visor de datos, faltan acciones de autoservicio

---

## Criterios de Priorización

- **Bloqueante** — la app está rota o el paciente queda en un callejón sin salida
- **Alta** — funcionalidad esperada en cualquier portal médico moderno
- **Media** — mejora significativa de experiencia sin ser crítica
- **Baja** — nice-to-have, agregar cuando haya tiempo

---

## Fase 1 — Bloqueante (antes de lanzar a pacientes reales)

### 1.1 · Página de recuperación de contraseña (`/portal/forgot-password`)

**Por qué primero:**
El login tiene un link activo a `/portal/forgot-password`. La página no existe. Un paciente que olvide su contraseña queda completamente bloqueado sin ninguna vía de recuperación.

**Qué construir:**
1. Formulario con campo de email
2. Llamar `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/portal/reset-password' })`
3. Página de confirmación: "Te enviamos un email con el enlace de recuperación"
4. Página `/portal/reset-password` que recibe el token de Supabase y permite ingresar nueva contraseña

**Archivos nuevos:**
- `app/portal/forgot-password/page.tsx`
- `app/portal/reset-password/page.tsx`

---

### 1.2 · Página de agendado de cita (`/portal/appointments/new`)

**Por qué segundo:**
El dashboard tiene dos botones que apuntan a esta ruta ("Agendar Cita" en quick actions + el CTA de empty state). Ambos dan 404. Es la acción principal del portal.

**Qué construir:**
- Paso 1: Seleccionar servicio (listar servicios de la clínica)
- Paso 2: Seleccionar fisioterapeuta disponible (opcional)
- Paso 3: Seleccionar fecha y hora (usando la lógica de `lib/actions/availability.ts` que ya existe)
- Paso 4: Confirmar → crear la cita y mandar notificación

**Archivos nuevos:**
- `app/portal/appointments/new/page.tsx`

**Acciones a agregar en `lib/actions/portal.ts`:**
- `getClinicServices()` — servicios disponibles de la clínica
- `getAvailableSlots(serviceId, physiotherapistId, date)` — reutiliza `availability.ts`
- `bookAppointment(data)` — crea la cita con `patient_id` del paciente autenticado

---

### 1.3 · Reemplazar `alert()` nativos

**Por qué:**
`appointments/page.tsx` y `exercises/page.tsx` usan `alert()` del navegador para errores. Se ve amateur y no funciona bien en móvil.

**Archivos afectados:**
- `app/portal/appointments/page.tsx` — en el catch del `cancelAppointment`
- `app/portal/exercises/page.tsx` — en el catch del `updateExerciseStatus`

**Solución:** Importar `toast` de `sonner` (ya está instalado) y reemplazar.

---

## Fase 2 — Alta prioridad

### 2.1 · Plan de tratamiento activo en el dashboard

**Por qué:**
El paciente no puede ver cuántas sesiones le quedan, cuál es su diagnóstico, ni cuánto ha pagado de su plan. Es información central para su seguimiento.

**Qué agregar en `app/portal/dashboard/page.tsx`:**
- Card "Tu Plan de Tratamiento": título del plan, sesiones completadas vs total, barra de progreso
- Saldo pendiente si `package_price > paid_amount`

**Acción a agregar en `lib/actions/portal.ts`:**
- `getPatientActivePlan()` — retorna el plan activo con `title, total_sessions, completed_sessions, package_price, paid_amount, diagnosis`

---

### 2.2 · Medidas clínicas en expediente

**Por qué:**
Las escalas EVA, ROM y fuerza se registran en cada sesión pero el paciente no las ve en ningún lado. Son el indicador más directo de su evolución.

**Qué agregar en `app/portal/medical-records/page.tsx`:**
- Sección "Mi evolución" con gráficas de línea (dolor, movilidad, fuerza a lo largo del tiempo)
- Reutilizar `Recharts` que ya está instalado

**Acción a agregar en `lib/actions/portal.ts`:**
- `getPatientMeasurements()` — retorna mediciones de `clinical_measurements` del paciente, ordenadas por fecha

---

### 2.3 · Perfil y configuración de cuenta (`/portal/settings`)

**Por qué:**
El paciente no puede cambiar su número de teléfono ni su contraseña una vez dentro. No hay ninguna pantalla de configuración de cuenta.

**Qué construir:**
- Formulario para actualizar `phone` en `patient_users` / `patients`
- Cambio de contraseña: campo "contraseña actual" + "nueva contraseña" usando `supabase.auth.updateUser`
- Preferencias de notificación (email / WhatsApp)

**Archivos nuevos:**
- `app/portal/settings/page.tsx`

---

### 2.4 · PDF del expediente médico

**Por qué:**
En Pagos ya funciona el PDF de recibos. El expediente es la otra área donde los pacientes necesitan poder exportar su información (para otro médico, para seguros, etc.).

**Qué agregar en `app/portal/medical-records/page.tsx`:**
- Botón "Descargar expediente" que genere un PDF con todas las sesiones del paciente

**Acción a agregar en `lib/pdf/`:**
- `generateMedicalSummary(sessions, patientName, clinicName)` — PDF con lista de sesiones, diagnósticos y notas (similar a `generateFinanceReport`)

---

## Fase 3 — Media prioridad

### 3.1 · Reagendar citas

**Estado actual:** Solo se puede cancelar. No se puede mover la fecha.
**Propuesta:** Botón "Reagendar" en citas próximas que abre el mismo flujo de selección de slot de 1.2, pero haciendo `update` en lugar de `insert`.

---

### 3.2 · Estadísticas en el dashboard

**Estado actual:** Solo lista de próximas citas, sin números.
**Propuesta:** Agregar 3 KPI cards encima de "Próximas Citas":

| KPI | Dato |
|-----|------|
| Próxima cita | Fecha y hora formateada |
| Sesiones completadas | De `therapy_sessions` |
| Saldo pendiente | De plan activo |

---

### 3.3 · Progreso de ejercicios

**Estado actual:** Se puede marcar como completado pero no hay historial ni porcentaje.
**Propuesta:**
- Mostrar `X de Y ejercicios completados hoy`
- Historial: "Completado el 22 mar" debajo de cada ejercicio activo
- Barra de progreso semanal

---

### 3.4 · Filtro / búsqueda en expediente

**Estado actual:** Lista plana sin filtros.
**Propuesta:** Filtro por rango de fechas (selector de mes/año) y por fisioterapeuta.

---

## Fase 4 — Baja prioridad

### 4.1 · Centro de notificaciones

Historial de recordatorios recibidos (WhatsApp/email). Tabla simple con fecha, tipo y mensaje.

---

### 4.2 · Chat con la clínica

Mensajería básica usando Supabase Realtime. El paciente inicia, el staff responde desde el dashboard.

---

### 4.3 · Historial de login / seguridad

Tabla con últimos accesos: fecha, dispositivo, IP. Útil para que el paciente detecte accesos no autorizados.

---

## Resumen de Páginas Faltantes

```
RUTAS FALTANTES
────────────────────────────────────────────────────
/portal/forgot-password       [1.1] — link roto desde login
/portal/reset-password        [1.1] — necesario para el flujo OAuth
/portal/appointments/new      [1.2] — link roto desde dashboard (×2)
/portal/settings              [2.3] — sin gestión de cuenta
```

## Resumen de Acciones Faltantes (`lib/actions/portal.ts`)

```
FUNCIONES A AGREGAR
────────────────────────────────────────────────────
getPatientActivePlan()        [2.1]
getPatientMeasurements()      [2.2]
getClinicServices()           [1.2]
getAvailableSlots()           [1.2] — wrapper de availability.ts
bookAppointment()             [1.2]
rescheduleAppointment()       [3.1]
updatePatientProfile()        [2.3]
```

## Orden de Implementación Recomendado

1. **1.3** → 20 min, riesgo cero (solo reemplazar `alert()`)
2. **1.1** → forgot/reset password, desbloquea usuarios atrapados
3. **2.1** → plan de tratamiento en dashboard (acción + UI)
4. **1.2** → booking de citas (más complejo, requiere `availability.ts`)
5. **2.2** → gráfica de evolución clínica
6. **2.3** → configuración de cuenta
7. **2.4** → PDF expediente
8. **Fase 3** → en orden de valor percibido
9. **Fase 4** → cuando la base esté sólida

---

*Documento generado en 2026-03-25. Basado en auditoría de `app/portal/**` y `lib/actions/portal.ts`.*
