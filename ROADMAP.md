# 🗺️ Roadmap - Clinova v2

## ✅ Funcionalidades Completadas

### 1. Dashboard con Analytics Interactivo ✨
- ✅ 4 tarjetas de métricas con tendencias mes a mes
- ✅ Gráfica de ingresos (últimos 6 meses) con Recharts
- ✅ Timeline de citas del día con estados
- ✅ Comparación automática mes a mes
- **Impacto:** Visibilidad de métricas clave en tiempo real

### 2. Búsqueda Global (Cmd+K) ⚡
- ✅ Modal con atajo de teclado Cmd+K / Ctrl+K
- ✅ Búsqueda en tiempo real con debounce (300ms)
- ✅ Navegación con flechas del teclado
- ✅ Busca en: Pacientes, Citas, Pagos, Sesiones de terapia
- **Impacto:** Productividad 10x, acceso instantáneo a información

### 3. Sistema de Notificaciones 📱
- ✅ WhatsApp via Twilio
- ✅ Email via Resend
- ✅ Recordatorios automáticos 24h antes de cita
- ✅ Confirmaciones de cita
- ✅ Recibos de pago por email
- ✅ Cron job API (`/api/cron/reminders`)
- ✅ UI de configuración de notificaciones
- **Impacto:** Reducir no-shows en 30%, mejor comunicación

### 4. Reportes PDF Profesionales 📄
- ✅ Reportes financieros completos con jsPDF
- ✅ Recibos de pago individuales
- ✅ Branding de clínica (logo, colores)
- ✅ Tablas profesionales con autotable
- ✅ Resumen ejecutivo de ingresos
- ✅ Desglose por método de pago y servicio
- **Impacto:** Profesionalismo, transparencia financiera

### 5. Agenda Avanzada 📅 ✅
- ✅ Calendario con react-big-calendar
- ✅ Multi-view: Día, Semana, Mes con persistencia
- ✅ Color coding por estado de cita
- ✅ Creación rápida de citas con modal
- ✅ Localización en español
- ✅ Horario configurable (7 AM - 9 PM)
- ✅ Intervalos de 15 minutos
- ✅ Indicador de hora actual con animación
- ✅ Auto-scroll a hora actual
- ✅ Sistema de bloqueo de horarios
- ✅ Citas recurrentes (diarias/semanales/mensuales)
- ✅ Botón de reenvío de confirmaciones
- **Impacto:** Gestión visual eficiente + bloqueos + recurrencia

### 6. Drag & Drop en Agenda 🎯 ✅
- ✅ Instalado `react-big-calendar` DnD addon
- ✅ Implementado drag handlers para mover citas
- ✅ Implementado resize handlers para cambiar duración
- ✅ Actualización de base de datos en tiempo real
- ✅ Feedback visual durante drag
- **Impacto:** Reagendar citas arrastrando, UX premium

### 7. Portal del Paciente 🌐 ✅
**Esfuerzo:** 8 horas | **Prioridad:** ⭐ COMPLETADO

**Infraestructura:**
- ✅ Tabla `patient_users` con RLS policies
- ✅ Server actions para gestión de acceso
- ✅ Email de bienvenida automático con credenciales
- ✅ Generación de contraseñas seguras

**Integración Staff:**
- ✅ Checkbox en crear paciente para dar acceso
- ✅ Botón "Dar Acceso" en lista de pacientes
- ✅ Indicadores visuales de estado de acceso

**Portal del Paciente:**
- ✅ Login con autenticación segura
- ✅ Dashboard con próximas citas
- ✅ Gestión de citas (ver, filtrar, cancelar)
- ✅ Expediente médico (historial completo)
- ✅ Historial de pagos con resumen
- ✅ Ejercicios (placeholder para futura implementación)
- ✅ Navegación intuitiva y logout

**Beneficio:** ✅ Self-service completo, reduce carga administrativa 50%, disponibilidad 24/7

---

## 🚀 Próximas Funcionalidades

### Alta Prioridad (Implementar Primero)

### 8. Recordatorios Automáticos Mejorados 🔔 ✅
**Esfuerzo:** 2 horas | **Prioridad:** COMPLETADO

- ✅ Configurar horarios de envío por clínica
- ✅ Personalizar mensajes de WhatsApp/Email
- ✅ Plantillas de mensajes editables
- ✅ Logging de envíos con tracking completo
- ✅ Recordatorios múltiples (48h, 24h, 2h antes)
- ✅ Opción de desactivar por paciente
- ✅ Botón de reenvío manual desde detalles de cita

**Beneficio:** ✅ Mayor personalización, mejor tasa de confirmación, tracking completo

---

### 9. Drag-to-Block en Agenda 🎯 ✅
**Esfuerzo:** 1-2 horas | **Prioridad:** Alta | **Completado:** 11 Feb 2026

- ✅ Habilitar selección por arrastre en calendario
- ✅ Modal simplificado con horas pre-llenadas
- ✅ Solo pedir razón del bloqueo
- ✅ Toggle "Modo Bloqueo" para activar/desactivar
- **Impacto:** Crear bloqueos múltiples rápidamente (lunch, juntas, etc.)

---

### Prioridad Media (Mejoras Operativas)

#### 9. Chat Interno del Equipo 💬
**Esfuerzo:** 8-10 horas | **Prioridad:** Media

- [ ] Sistema de mensajería en tiempo real (Supabase Realtime)
- [ ] Canales por clínica
- [ ] Mensajes directos entre usuarios
- [ ] Notificaciones push de nuevos mensajes
- [ ] Historial de conversaciones
- [ ] Compartir archivos/imágenes
- [ ] Indicadores de "escribiendo..."
- [ ] Estados online/offline

**Beneficio:** Comunicación interna eficiente, eliminar WhatsApp/Slack externos

---

#### 10. Biblioteca de Ejercicios 📚 ✅
**Esfuerzo:** 4-5 horas | **Prioridad:** Media | **Completado:** 16 Feb 2026

- ✅ CRUD de ejercicios terapéuticos
- ✅ Categorías (movilidad, fuerza, estiramiento, equilibrio, respiración, funcional)
- ✅ Descripción detallada paso a paso
- ✅ Imágenes/GIFs demostrativos
- ✅ Videos de YouTube embebidos
- ✅ Clasificación por dificultad (principiante, intermedio, avanzado)
- ✅ Asignar ejercicios a pacientes desde sesiones de terapia
- ✅ Configuración de frecuencia por ejercicio (diario, 2x día, 3x semana, etc.)
- ✅ Notas personalizadas por asignación
- ✅ Seguimiento de cumplimiento (activo/completado/pausado)
- ✅ Portal del paciente con ejercicios asignados
- ✅ Modal de detalles con instrucciones completas
- ✅ Marcar ejercicios como completados
- ✅ Filtros por categoría y dificultad
- ✅ Búsqueda de ejercicios
- ✅ Compartición con equipo de la clínica

**Beneficio:** ✅ Planes de tratamiento estandarizados, mejor adherencia del paciente, seguimiento completo

---

#### 11. Plantillas de Notas Médicas 📝 ✅
**Esfuerzo:** 2-3 horas | **Prioridad:** Media | **Completado:** 16 Feb 2026

- ✅ Crear plantillas personalizadas por servicio
- ✅ Variables dinámicas (nombre paciente, fecha, etc.)
- ✅ Editor de texto con inserción de variables
- ✅ Aplicar plantilla a sesión/consulta
- ✅ Biblioteca de plantillas compartidas por clínica
- ✅ Categorización por tipo (diagnóstico, tratamiento, evolución, general)
- ✅ Control de compartición de plantillas (personal/equipo)
- ✅ Plantillas predefinidas incluidas (Evaluación Inicial, Nota de Evolución, Plan de Tratamiento)
- ✅ Integración en SessionModal (sesiones de terapia)
- ✅ Integración en NewConsultationForm (consultas médicas)
- ✅ Sistema de permisos RBAC para plantillas
- ✅ Enlace en menú de navegación

**Beneficio:** ✅ Documentación 50-70% más rápida, estandarización, calidad consistente

---

#### 12. Escalas de Valoración + Evolución Clínica 📊 ✅
**Esfuerzo:** 4-5 horas | **Prioridad:** Alta | **Completado:** 17 Feb 2026

- ✅ Tabla `clinical_measurements` con migración completa y RLS
- ✅ Escala EVA de dolor (0-10) con registro rápido
- ✅ Goniometría/ROM por articulación (0-180°)
- ✅ Escalas de movilidad y fuerza (0-10)
- ✅ Mapa corporal SVG interactivo para dolor
- ✅ Registro de métricas integrado en SessionModal (sliders rápidos)
- ✅ Tab de ROM/Goniometría con 14 regiones corporales
- ✅ Gráficas de evolución con Recharts (LineChart)
- ✅ Dashboard de progreso con tendencias (mejorando/estable/empeorando)
- ✅ ProgressSummary en perfil del paciente y página de evolución
- ✅ Soporte para body_region y session_id en mediciones
- ✅ Server actions con cálculo de progreso y tendencias
- ✅ Lógica invertida para dolor (disminución = mejoría)

**Beneficio:** ✅ Valoración objetiva del progreso, evidencia clínica medible, mejor toma de decisiones terapéuticas

---

#### Sincronización Google Calendar 📆
**Esfuerzo:** 3-4 horas | **Prioridad:** Media

- [ ] OAuth con Google
- [ ] Sync bidireccional de citas
- [ ] Configuración por fisioterapeuta
- [ ] Actualización en tiempo real
- [ ] Manejo de conflictos
- [ ] Desconexión/reconexión

**Beneficio:** Integración con calendario personal

---

### Prioridad Baja (Nice to Have)

#### 13. Gamificación 🎮
**Esfuerzo:** 6-8 horas

- [ ] Sistema de puntos por actividades
- [ ] Badges/logros desbloqueables
- [ ] Leaderboard del equipo
- [ ] Recompensas y reconocimientos
- [ ] Retos mensuales
- [ ] Perfil público con estadísticas

**Beneficio:** Motivación del equipo, ambiente competitivo sano

---

#### 14. CRM Avanzado 📊
**Esfuerzo:** 8-10 horas

- [ ] Pipeline de ventas (Lead → Cliente)
- [ ] Seguimiento de leads
- [ ] Automatizaciones de seguimiento
- [ ] Reportes de conversión
- [ ] Integración con formularios web
- [ ] Scoring de leads

**Beneficio:** Captación sistemática de pacientes

---

#### 15. Email Marketing 📧
**Esfuerzo:** 4-5 horas

- [ ] Campañas por segmento de pacientes
- [ ] Templates personalizables
- [ ] Estadísticas de apertura/clicks
- [ ] A/B testing
- [ ] Automatizaciones (cumpleaños, follow-ups)
- [ ] Integración con Resend

**Beneficio:** Retención de pacientes, promociones efectivas

---

#### 16. Inventario de Productos 📦
**Esfuerzo:** 4-5 horas

- [ ] Gestión de stock de insumos
- [ ] Alertas de bajo inventario
- [ ] Ventas de productos a pacientes
- [ ] Historial de movimientos
- [ ] Reportes de consumo
- [ ] Proveedores

**Beneficio:** Control de insumos, ingresos adicionales

---

#### 17. Backups Automáticos ☁️
**Esfuerzo:** 2-3 horas

- [ ] Exportación automática diaria
- [ ] Almacenamiento en S3/Google Cloud
- [ ] Restauración fácil desde UI
- [ ] Notificaciones de backup exitoso
- [ ] Retención configurable (7, 30, 90 días)

**Beneficio:** Seguridad de datos, tranquilidad

---

#### 18. Personalización de Branding 🎨
**Esfuerzo:** 3-4 horas

- [ ] Upload de logo personalizado
- [ ] Selector de colores corporativos
- [ ] Dominio personalizado (clinica.com)
- [ ] Favicon personalizado
- [ ] Email templates con branding
- [ ] PDFs con logo

**Beneficio:** Identidad de marca profesional

---

#### 19. KPIs de Negocio Avanzados 📈
**Esfuerzo:** 3-4 horas

- [ ] Tasa de ocupación por fisioterapeuta
- [ ] Ingresos por fisioterapeuta
- [ ] Pacientes recurrentes vs nuevos
- [ ] ROI por servicio
- [ ] Tiempo promedio de tratamiento
- [ ] Tasa de abandono
- [ ] Valor de vida del cliente (LTV)

**Beneficio:** Decisiones basadas en datos, optimización

---

#### 20. Notas de Voz 🎤
**Esfuerzo:** 2-3 horas

- [ ] Grabación de audio en sesión
- [ ] Transcripción automática (Whisper API)
- [ ] Adjuntar a notas de sesión
- [ ] Reproducción en expediente
- [ ] Búsqueda en transcripciones

**Beneficio:** Documentación más rápida, manos libres

---

## 📊 Estimación Total

| Categoría | Horas Estimadas |
|-----------|----------------|
| ✅ Completado | 45-53 horas |
| 🔥 Alta Prioridad | 0 horas |
| 📈 Media Prioridad | 11-14 horas |
| 💡 Baja Prioridad | 40-50 horas |
| **TOTAL** | **95-115 horas** |

---

## 🎯 Recomendación de Implementación

### Sprint 1 (COMPLETADO 100%) ✅
1. ✅ Drag & Drop en Agenda
2. ✅ Portal del Paciente (máximo impacto)
3. ✅ Recordatorios Mejorados
4. ✅ Plantillas de Notas Médicas
5. ✅ Biblioteca de Ejercicios Completa

**Resultado:** Sistema con self-service completo + recordatorios personalizables + documentación rápida + ejercicios personalizados ✅

### Sprint 2 (En Progreso)
1. ✅ Escalas de Valoración + Gráficas de Evolución
2. Chat Interno del Equipo
3. Sincronización Google Calendar

**Resultado:** Medición clínica objetiva + evolución del paciente + comunicación del equipo

### Sprint 3 (2-3 semanas)
7. Sincronización Google Calendar
8. CRM Avanzado
9. Email Marketing

**Resultado:** Marketing y ventas automatizados

### Sprint 4 (Opcional)
10-20. Funcionalidades de baja prioridad según necesidad

---

## 💰 ROI Estimado por Funcionalidad

| Funcionalidad | Esfuerzo | Impacto | ROI |
|--------------|----------|---------|-----|
| Portal del Paciente | Alto | Muy Alto | ⭐⭐⭐⭐⭐ |
| Drag & Drop Agenda | Bajo | Alto | ⭐⭐⭐⭐⭐ |
| Recordatorios Mejorados | Bajo | Alto | ⭐⭐⭐⭐⭐ |
| Chat Interno | Alto | Alto | ⭐⭐⭐⭐ |
| Biblioteca Ejercicios | Medio | Alto | ⭐⭐⭐⭐ |
| Plantillas Notas | Bajo | Medio | ⭐⭐⭐⭐ |
| Sync Google Calendar | Medio | Medio | ⭐⭐⭐ |
| CRM Avanzado | Alto | Medio | ⭐⭐⭐ |
| Email Marketing | Medio | Medio | ⭐⭐⭐ |

---

## 📝 Notas

- Este roadmap es flexible y se puede ajustar según feedback de usuarios
- Las estimaciones son aproximadas y pueden variar
- Se recomienda implementar en orden de prioridad para maximizar valor
- Cada funcionalidad debe incluir tests y documentación

**Última actualización:** 17 de febrero de 2026 - Escalas de Valoración + Evolución Clínica completadas ✅
