# Casos de uso — Reportes (REP-1)

> Modelo de dominio: `Report`, `ReportSendEvent` en `packages/shared-types`
> (ADR-013, entidad nueva). Flujo narrativo base: `docs/flows/README.md` →
> Flujo 3. Es el punto de salida del proceso: consolida candidatos +
> entrevistas + feedback.

## Resumen de permisos

| Acción | Reclutador | Referente Técnico | PM |
| --- | --- | --- | --- |
| Generar PDF (`GET /reports/:processId/candidate/:id`) | ✅ | ❌ | ✅ |
| Enviar reporte al cliente (`POST /reports/:id/send`) | ✅ | ❌ | ❌ |
| Ver historial de reportes de un proceso | ✅ | ❌ | ✅ |

## UC-REP-1: Generar reporte PDF de un candidato en un proceso

**Rol:** Reclutador, PM.
**Precondición:** el proceso y el candidato existen; hay al menos un
feedback cargado para ese candidato en ese proceso (un reporte sin
feedback no tiene datos reales que consolidar — ver criterio de éxito de
REP-1: "PDF generado contiene datos reales... no placeholder").
**Flujo principal:** `GET /reports/:processId/candidate/:id` genera PDF
con resumen del proceso, candidatos evaluados con scores, recomendaciones
finales, línea de tiempo de etapas.
**Reglas de borde / negativas:**
- `technical_ref` → 403 (no genera ni ve reportes — su participación
  termina en `feedback`).
- Candidato sin ningún feedback cargado todavía → 400 explícito, no se
  genera un PDF con secciones vacías o placeholder.
- El `Report` resultante queda en colección propia, con `generatedBy`
  (el `recruiterId` o `pm` que lo generó, ver `shared-types`) — un PM
  generando el PDF también queda registrado como `generatedBy`, no solo
  el reclutador.

## UC-REP-2: Enviar reporte al cliente

**Rol:** Reclutador.
**Precondición:** el `Report` ya fue generado (`UC-REP-1`).
**Flujo principal:** `POST /reports/:id/send` → `EmailSenderPort` (SMTP)
→ se apenda un `ReportSendEvent` a `sentHistory` (append-only, auditable).
**Reglas de borde / negativas:**
- PM o `technical_ref` → 403. Aunque el PM puede *generar* el reporte
  (`UC-REP-1`), el *envío al cliente* es exclusivo del reclutador — es
  quien tiene la relación comercial con el cliente (mismo criterio que
  `UC-FEED-4`: el reclutador es el punto de contacto externo).
- Cardinalidad de `sentTo` en cada `ReportSendEvent`: **pendiente**, ver
  ADR-013 "Abierto" — un evento por destinatario vs. un array de
  destinatarios por evento, a decidir al implementar REP-1. Hasta
  entonces, no asumir ninguna de las dos formas en código nuevo.
- Reenviar el mismo reporte una segunda vez → permitido (no es un error;
  `sentHistory` es append-only y acumula cada envío, no reemplaza el
  anterior).

## UC-REP-3: Ver historial de reportes de un proceso

**Rol:** Reclutador, PM.
**Precondición:** el proceso existe.
**Flujo principal:** desde `/reports`, listado de procesos con reportes
disponibles → detalle con `sentHistory`.
**Reglas de borde / negativas:**
- `technical_ref` → 403 (no tiene esta ruta en `navigation.ts`:
  `/reports` es `['recruiter', 'pm']`).
- Proceso sin ningún reporte generado todavía → aparece en el listado sin
  reportes disponibles para descargar (no se oculta el proceso, se
  deshabilita la acción).
