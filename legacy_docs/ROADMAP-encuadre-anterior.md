# ROADMAP — encuadre anterior (procesos → candidatos → entrevistas → feedback → reportes)

> Archivado el 2026-10-28 al adelgazar `ROADMAP.md` para el replanning Bench First.
> Es una **copia** del texto íntegro de PROC-2, CAND-1, INT-1, FEED-1, REP-1 y CV-1
> tal como estaba en `ROADMAP.md` antes de la limpieza. Fuera de alcance para
> agentes; el historial completo sigue en git.

## Equivalencias con el encuadre Bench First

| ID anterior | Reemplazo Bench First |
| --- | --- |
| PROC-2 | Oportunidades + box mágico |
| CAND-1 | BENCH (mock) + Talent Pool + carga de perfil |
| INT-1 | Disponibilidad + booking top 5 + entrevistas por etapa |
| FEED-1 | Feedback en 3 etapas asistido por IA |
| REP-1 | Dashboard ejecutivo (PDF pasa a LOW) |
| CV-1 | Acción del asistente "analizar perfil" vía ICA (`AiProviderPort`) |

## Criterios de éxito abiertos que se MOVIERON aquí (no se cerraron)

- [ ] Se puede crear un proceso completo end-to-end (los 4 pasos del wizard persisten en backend).
- [ ] Cargar un candidato con email duplicado devuelve error claro, no crea registro.
- [ ] Dashboard muestra datos reales de `GET /processes`, no `MOCK_PROCESSES`.
- [ ] Banco de perfiles lista candidatos con paginación real.
- [ ] Detalle de candidato muestra su historial de procesos.
- [ ] Sigue el golden path de `good-practices/examples/frontend/` (mock-first → luego backend real, sin tocar componentes).
- [ ] Reclutador agenda → referente recibe email → confirma o reprograma.
- [ ] `.ics` descargado abre correctamente en un cliente de calendario real.
- [ ] Sin disponibilidad cargada, el webhook de Slack se dispara (fallback documentado aquí).
- [ ] Timezone del referente visible en todos los componentes de horario.
- [ ] `/feedback` (el formulario) sigue siendo exclusivo de `technical_ref`, verificado con backend real — `recruiter`/`pm` no pueden escribir feedback.
- [ ] `recruiter`/`pm` pueden leer el feedback guardado de un proceso desde su detalle, verificado con backend real.
- [ ] Intentar crear un segundo feedback para la misma entrevista falla (índice único en `interviewId`), no solo por validación de aplicación.
- [ ] Feedback enviado por email al candidato usa `packages/email-templates` (HTML plano, sin scripts).
- [ ] Reclutador ve resultados agregados por proceso.
- [ ] PDF generado contiene datos reales del proceso, no placeholder.
- [ ] Envío al cliente deja registro (auditable) de cuándo y a quién se envió.
- [ ] Subir un CV real (PDF) pre-llena nombre/email/skills con precisión razonable (validar con muestra manual, no 100% automático).
- [ ] El reclutador puede corregir cualquier campo pre-llenado antes de guardar.
- [ ] Archivo original queda accesible en COS, no solo el texto extraído.

---

## PROC-2 — Backend de procesos + wizard

**Estado:** 📌 sin arrancar · **Complejidad:** 🔴 Alta

### Motivación

El wizard de creación de proceso (Etapa 3 del plan FE) y el dashboard
(Etapa 2) hoy corren sobre mocks. Este feature es el dominio central:
crear proceso, asignar referente técnico, cargar candidato con validación
de duplicado por email.

### Alcance

- Casos de uso detallados: [`docs/use-cases/processes.md`](./docs/use-cases/processes.md).
- `capability/processes`: `POST /processes`, `PATCH /processes/:id`, `GET /processes`, `GET /processes/:id`.
- `GET /users/referents?specialty=...` — listar referentes filtrables por especialidad (consumido por el paso 2 del wizard).
- `POST /candidates` con validación de duplicado por email (índice único ya definido en `PROJECT_CONTEXT.md`).
- Modelo de datos: ver ADR-013 en `docs/architecture/README.md` — `technicalRefs` embebido con rol (`principal`/`validador`, mínimo 1 de cada uno, validado en el DTO), sincronización `Candidate.processIds` ↔ `Process.candidateIds` por llamada en memoria entre servicios (nunca adapter cruzado ni transacción Mongo — Mongo corre standalone).
- Frontend: `processes.infra.ts` y `wizard.store.ts` (Etapa 3) pasan de mock a `fetch` real.

**Abierto (resolver al implementar, ver ADR-013):** taxonomía de `User.specialty` (texto libre vs. catálogo controlado); manejo explícito del fallo parcial al sincronizar `Candidate.processIds` (loguear + excepción tipada, nunca `catch {}` silencioso).

### Dependencias

AUTH-2 (endpoints protegidos por rol) · FE Etapas 2-3 (UI y `infrastructure/` mock-first ya existentes).

### Criterios de éxito

- [ ] Se puede crear un proceso completo end-to-end (los 4 pasos del wizard persisten en backend).
- [ ] Cargar un candidato con email duplicado devuelve error claro, no crea registro.
- [ ] Dashboard muestra datos reales de `GET /processes`, no `MOCK_PROCESSES`.

---

## CAND-1 — Feature Candidatos

**Estado:** 📌 sin arrancar · **Complejidad:** 🟡 Media

### Motivación

`features/candidates/` existe como scaffold vacío (`infrastructure/` ya
renombrado en Etapa 0). Es el banco de perfiles que consumen reclutador y PM.

### Alcance

- Casos de uso detallados: [`docs/use-cases/candidates.md`](./docs/use-cases/candidates.md).
- Frontend: estructura completa `components/{atoms,molecules,organisms,pages}`, banco de perfiles + detalle de candidato, filtros de UI (client-state en `store/` solo si aplica).
- Backend: `GET /candidates` (paginado, nunca query sin límite — regla de `.clinerules`), `GET /candidates/:id`, `PATCH /candidates/:id`.

### Dependencias

PROC-2 (los candidatos nacen asociados a un proceso vía `POST /candidates` del wizard) — este feature completa el CRUD y la vista de banco de perfiles standalone.

### Criterios de éxito

- [ ] Banco de perfiles lista candidatos con paginación real.
- [ ] Detalle de candidato muestra su historial de procesos.
- [ ] Sigue el golden path de `good-practices/examples/frontend/` (mock-first → luego backend real, sin tocar componentes).

---

## INT-1 — Feature Entrevistas (calendario + notificaciones)

**Estado:** 📌 sin arrancar · **Complejidad:** 🔴 Alta

### Motivación

Agendamiento de entrevistas con disponibilidad del referente técnico,
confirmación, reprogramación, export `.ics`, y notificación por email/Slack.
Es el flujo más transversal (3 roles interactúan: reclutador agenda,
referente confirma, PM observa).

### Alcance

- Casos de uso detallados: [`docs/use-cases/interviews.md`](./docs/use-cases/interviews.md).
- Backend `capability/interviews`: `POST /availability`, `GET /availability/:referentId`, `POST /interviews`, `PATCH /interviews/:id/confirm`, `PATCH /interviews/:id/reschedule`, `GET /interviews/:id/ics`.
- Backend `capability/notifications`: email al referente al agendar (`EmailSenderPort` + adapter SMTP), email de confirmación al reclutador, webhook Slack si el referente no tiene disponibilidad.
- Sin cache de disponibilidad (sin Redis en el MVP — ADR-008); la disponibilidad se lee directo de MongoDB. Si el volumen lo justifica más adelante, se revisita con un store compartido, no antes.
- `reschedule` apenda a `Interview.rescheduleHistory` (embebido) y repone `status` a `pending` (ver ADR-013 — limitación conocida: no distingue "nunca confirmada" de "reprogramada"). Índices a crear: `processId`, compuesto `{referentId, scheduledAt}`.
- Frontend (Etapa 5 del plan FE): calendario reclutador, dashboard de disponibilidad del referente (vista matriz + lista), export `.ics` con `ical.js` (ya instalado).

### Dependencias

PROC-2 · CAND-1 (no se agenda una entrevista sin proceso ni candidato existentes) · AUTH-2 (email del referente sale del JWT/perfil).

### Criterios de éxito

- [ ] Reclutador agenda → referente recibe email → confirma o reprograma.
- [ ] `.ics` descargado abre correctamente en un cliente de calendario real.
- [ ] Sin disponibilidad cargada, el webhook de Slack se dispara (fallback documentado aquí).
- [ ] Timezone del referente visible en todos los componentes de horario.

---

## FEED-1 — Feature Feedback técnico

**Estado:** 📌 sin arrancar · **Complejidad:** 🟡 Media

### Motivación

Formulario de feedback post-entrevista. **Quién escribe vs. quién lee** (aclarado
2026-10-15, ver ADR-013 — antes había una contradicción real entre este documento,
`docs/flows/README.md` y `navigation.ts` sobre esto):
- **Escribe** el `technical_ref` que hizo la entrevista — es el único con acceso a
  `/feedback` (el formulario), regla ya correcta en `navigation.ts`/`AppRouter.tsx`
  desde Etapa 0. No se toca.
- **Leen** `recruiter` y `pm` los resultados ya guardados, desde el detalle del
  proceso (`/processes/:id`, tab "Feedback"), nunca desde `/feedback`.

Template sugerido por IA según el perfil del rol, score por dimensión.

### Alcance

- Casos de uso detallados: [`docs/use-cases/feedback.md`](./docs/use-cases/feedback.md).
- Backend `capability/feedback`: `POST /feedback` (solo el `referentId` autor de la entrevista puede crear/editar su propio feedback), `GET /feedback/:processId` (reclutador/PM del proceso, o el propio referente autor para su registro), `POST /feedback/:id/send-email`.
- Modelo de datos: ver ADR-013 — `Feedback` sin campo `visibleTo` (la visibilidad se aplica en código, no se persiste); índice único en `interviewId` para forzar 1 feedback por entrevista a nivel de base.
- Frontend (Etapa 6 del plan FE): formulario con dimensiones técnicas + soft skills, score 1-5, recomendación final (avanza / no avanza / hold). Especificación de UX: `docs/design/UX-GUIDELINES.md` (manda sobre los mockups).

### Dependencias

INT-1 (el feedback se dispara post-entrevista) · AUTH-2 (guard de rol real, hoy solo mockeado en Zustand).

### Criterios de éxito

- [ ] `/feedback` (el formulario) sigue siendo exclusivo de `technical_ref`, verificado con backend real — `recruiter`/`pm` no pueden escribir feedback.
- [ ] `recruiter`/`pm` pueden leer el feedback guardado de un proceso desde su detalle, verificado con backend real.
- [ ] Intentar crear un segundo feedback para la misma entrevista falla (índice único en `interviewId`), no solo por validación de aplicación.
- [ ] Feedback enviado por email al candidato usa `packages/email-templates` (HTML plano, sin scripts).
- [ ] Reclutador ve resultados agregados por proceso.

---

## REP-1 — Feature Reportes

**Estado:** 📌 sin arrancar · **Complejidad:** 🟡 Media

### Motivación

Historial de reportes por proceso/candidato y generación de PDF para
enviar al cliente — el punto de salida del flujo completo.

### Alcance

- Casos de uso detallados: [`docs/use-cases/reports.md`](./docs/use-cases/reports.md).
- Backend `capability/reports`: `GET /reports/:processId/candidate/:id` (genera PDF), `POST /reports/:id/send` (envía por correo al cliente).
- Modelo de datos: entidad `Report` (ver ADR-013 en `docs/architecture/README.md`) con `sentHistory` embebido (append-only) como registro auditable de envíos. Índice `processId`.
- IBM COS: bucket de reportes/CVs configurado.
- Frontend (Etapa 7 del plan FE): botón "Generar PDF" + "Enviar al cliente", historial de reportes.

### Dependencias

FEED-1 (el reporte consolida feedback + entrevistas + datos del candidato).

### Criterios de éxito

- [ ] PDF generado contiene datos reales del proceso, no placeholder.
- [ ] Envío al cliente deja registro (auditable) de cuándo y a quién se envió.

**Abierto (resolver al implementar, ver ADR-013):** cardinalidad de `ReportSendEvent.sentTo` — ¿un evento por destinatario, o un array por evento si un envío tiene varios destinatarios a la vez?

---

## CV-1 — Análisis de CV asistido (watsonx.ai + IBM COS)

**Estado:** 📌 sin arrancar · **Complejidad:** 🔴 Alta

### Motivación

Idea capturada del plan original (semana 4): al cargar el CV de
un candidato, pre-llenar el perfil automáticamente en vez de captura manual
completa. No es bloqueante para el flujo — CAND-1 funciona con carga manual
— pero mejora significativamente la experiencia del reclutador, y es el
momento IA de la demo (ver ADR-009 en `docs/architecture/README.md`).

### Alcance

- Backend `capability/cv-analysis`: `POST /cv/upload` (PDF/WORD a IBM COS), `POST /cv/analyze` detrás de un `CvAnalysisPort` con adapter para watsonx.ai (prompt + `WATSONX_MODEL_ID` configurable) que extrae datos estructurados.
- **Antes de implementar:** verificar si watsonx.ai está disponible en `br-sao` (ver "Abierto" en `docs/architecture/README.md`). Si no, el adapter envía el texto del CV de forma transitoria a la región más cercana disponible, **sin email ni teléfono** (enmascarados antes de enviar) y sin persistir nada fuera de `br-sao` — validar con sponsor/compliance antes de habilitarlo.
- Frontend: en el wizard paso 3, un único elemento "Sugerir skills desde el CV" (ver `docs/design/UX-GUIDELINES.md` §4), spinner de análisis, pre-llenado del formulario con los datos extraídos (editable, nunca autocompletado silencioso).

### Dependencias

CAND-1 (se integra en el flujo de carga de candidato existente, no lo reemplaza).

### Complejidad y tamaño

**Alta** — integración con dos servicios de IBM Cloud (COS + watsonx.ai) más el manejo de archivos binarios, hoy sin ningún wiring existente en el proyecto, más la verificación de disponibilidad regional pendiente.

### Criterios de éxito

- [ ] Subir un CV real (PDF) pre-llena nombre/email/skills con precisión razonable (validar con muestra manual, no 100% automático).
- [ ] El reclutador puede corregir cualquier campo pre-llenado antes de guardar.
- [ ] Archivo original queda accesible en COS, no solo el texto extraído.

---
