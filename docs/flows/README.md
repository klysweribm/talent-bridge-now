# Flujos de Usuario — IBM Talent Bridge

## Flujo 1: Reclutador crea un proceso de selección

```
Reclutador
    │
    ├─→ Login (/login)
    │       └─→ Validar correo @ibm.com + password
    │           └─→ Redirigir a Dashboard (/dashboard)
    │
    ├─→ Dashboard (/dashboard)
    │       └─→ Click "Nuevo Proceso de Selección"
    │           └─→ Ir a /processes/new
    │
    └─→ Wizard Crear Proceso (/processes/new)
            │
            ├─→ Paso 1: Información del Rol
            │       • Nombre del proceso [Rol — Cliente]
            │       • Cliente / Cuenta IBM (select)
            │       • Nivel de seniority (Junior/Mid/Senior/Lead/Architect)
            │       • Descripción del perfil
            │       • Expectativas del cliente
            │       • Duración de entrevistas (30/45/60/90 min)
            │       • Tecnologías requeridas (tags)
            │       └─→ Click "Continuar"
            │
            ├─→ Paso 2: Asignar Referentes Técnicos
            │       • Buscador por nombre/correo/especialidad
            │       • Filtros por stack (Frontend, Backend, Cloud, Data, QA)
            │       • Cards de referentes con disponibilidad y tasa de éxito
            │       • Asignar: Técnico Principal (obligatorio) + Validador
            │       • REGLA: Mínimo 2 referentes antes de continuar
            │       └─→ Click "Continuar"
            │
            ├─→ Paso 3: Cargar Candidatos
            │       • Upload CV (PDF/DOCX → IBM COS)
            │       • watsonx.ai sugiere skills desde el CV (acción explícita)
            │       • Validación: no duplicar candidato por email
            │       • Si duplicado → modal de alerta con proceso existente
            │       └─→ Click "Continuar"
            │
            └─→ Paso 4: Confirmar y Publicar
                    • Resumen completo del proceso
                    • Preview del primer correo de invitación
                    • Click "Publicar Proceso"
                    └─→ Notificación Slack al equipo
                        └─→ Redirigir a /processes/:id
```

---

## Flujo 2: Referente Técnico confirma disponibilidad y aprueba entrevista

```
Referente Técnico
    │
    ├─→ Login (/login)
    │       └─→ Redirigir a /my-interviews
    │
    ├─→ Mis Entrevistas (/my-interviews)
    │       └─→ Ver entrevistas pendientes de confirmación
    │           └─→ Click en entrevista pendiente
    │
    └─→ Detalle de Entrevista (/interviews/:id)
            │
            ├─→ Ver datos: candidato, proceso, fecha, duración, timezone
            ├─→ Click "Confirmar Entrevista"
            │       └─→ Backend actualiza status → 'confirmed'
            │           └─→ Email automático al candidato (vía EmailSenderPort / SMTP)
            │               └─→ .ics adjunto para agregar al calendario
            │
            └─→ Post-entrevista: Click "Cargar Feedback"
                    └─→ Formulario de Feedback (/feedback/new?interviewId=:id)
                            • Score técnico (1-5)
                            • Score soft skills (1-5)
                            • Recomendación (advance/hold/reject)
                            • Comentarios libres
                            • Sugerencia de template por IA (Watson)
                            └─→ Click "Guardar Feedback"
                                └─→ Visible solo para Reclutador y PM
```

---

## Flujo 3: PM descarga reporte ejecutivo

```
PM
    │
    ├─→ Login (/login)
    │       └─→ Redirigir a /reports (vista ejecutiva, solo lectura)
    │
    └─→ Reportes (/reports)
            │
            ├─→ Ver procesos con reportes disponibles
            ├─→ Click en proceso → Ver resumen del pipeline
            │
            └─→ Click "Descargar PDF"
                    └─→ Backend genera PDF con:
                            • Resumen del proceso
                            • Candidatos evaluados con scores
                            • Recomendaciones finales
                            • Línea de tiempo de etapas
                    └─→ Opción "Enviar por correo al cliente"
                            └─→ EmailSenderPort (SMTP) → correo al cliente
```

---

## Flujo 4: Agendamiento de entrevista por Reclutador

```
Reclutador
    │
    └─→ Proceso activo (/processes/:id)
            │
            └─→ Click "Agendar Entrevista" para candidato X
                    │
                    └─→ Modal / Página de agendamiento
                            │
                            ├─→ Seleccionar referente técnico asignado
                            ├─→ Ver disponibilidad del referente
                            │       • Bloque mañana: 9am-1pm
                            │       • Bloque tarde: 2pm-6pm
                            │       • Timezone del referente siempre visible
                            │
                            ├─→ Seleccionar fecha y hora
                            ├─→ Confirmar duración (heredada del proceso)
                            │
                            └─→ Click "Agendar"
                                    └─→ Email al referente: "Tienes una entrevista pendiente"
                                        └─→ Referente confirma desde /my-interviews
                                            └─→ Email al candidato con .ics
```

---

## Reglas de Negocio Críticas

| Regla | Detalle |
|-------|---------|
| Mínimo 2 referentes | Todo proceso necesita Técnico Principal + Validador |
| Email único por candidato | Validación antes de crear en BD |
| Un candidato en N procesos | Sin restricción, procesos independientes |
| Feedback solo interno | Reclutador y PM — no el candidato ni el referente |
| Timezone siempre visible | En todo componente de calendario o agenda |
| Correos HTML plano | Sin scripts ni estilos externos |
