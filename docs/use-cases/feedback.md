# Casos de uso — Feedback (FEED-1)

> Este es el feature donde se encontró y resolvió una contradicción real
> entre `navigation.ts`, el roadmap de entonces y `docs/flows/README.md` (sesión
> 2026-10-15, ver ADR-013). Este documento es la versión definitiva de esa
> resolución — si algo en otro doc contradice esto, **gana este archivo**.

## Resumen de permisos

| Acción | Reclutador | Referente Técnico | PM |
| --- | --- | --- | --- |
| Crear feedback (`POST /feedback`) | ❌ | ✅ (solo el autor de la entrevista) | ❌ |
| Editar feedback propio | ❌ | ✅ (solo mientras siga siendo el autor) | ❌ |
| Leer feedback de un proceso (`GET /feedback/:processId`) | ✅ (procesos propios) | ✅ (solo su propio registro) | ✅ |
| Enviar feedback por email al candidato (`POST /feedback/:id/send-email`) | ✅ | ❌ | ❌ |
| Acceder al formulario `/feedback` (ruta frontend) | ❌ | ✅ | ❌ |

## UC-FEED-1: Referente escribe el feedback post-entrevista

**Rol:** Referente Técnico.
**Precondición:** la entrevista existe, está `confirmed` o `completed`, y
`referentId` de la entrevista coincide con el usuario autenticado. **No
existe todavía** un `Feedback` para ese `interviewId` (relación 1:1
forzada por índice único — ADR-013).
**Flujo principal:** desde el detalle de la entrevista, "Cargar Feedback"
→ `/feedback` → score técnico (1-5) + soft skills (1-5) + recomendación
(`advance`/`reject`/`hold`) + comentarios + template sugerido por watsonx.ai
→ `POST /feedback`.
**Reglas de borde / negativas:**
- `reclutador`/`pm` navegando a `/feedback` → bloqueado por el guard de
  rol de `AppRouter.tsx` (ya correcto, no se toca) — ni siquiera ven el
  formulario, no es solo un 403 de API.
- Referente que **no** es el autor de esa entrevista intentando `POST
  /feedback` para ella → 403, aunque tenga rol `technical_ref` válido.
- Segundo intento de `POST /feedback` para el mismo `interviewId` → falla
  por el índice único en `interviewId` **a nivel de base de datos**, no
  solo por una validación de aplicación (criterio de éxito explícito de
  FEED-1, hoy fuera del roadmap hasta el replanning — debe fallar incluso si la validación de
  aplicación tuviera un bug).
- Entrevista todavía `pending`/`cancelled` (nunca ocurrió) → 400, no se
  puede cargar feedback de una entrevista que no sucedió.

## UC-FEED-2: Referente edita su propio feedback

**Rol:** Referente Técnico (autor).
**Precondición:** el `Feedback` existe y `referentId` coincide con el
usuario autenticado.
**Flujo principal:** editar el mismo registro (no crea uno nuevo — el
índice único en `interviewId` lo impide de todos modos).
**Reglas de borde / negativas:**
- Cualquier otro rol o cualquier otro referente → 403.
- **No hay endpoint `PATCH /feedback/:id` listado todavía en el alcance
  de FEED-1** (solo `POST`, `GET`, `send-email`) — a definir en
  FEED-1 si la edición reutiliza `POST` de forma idempotente sobre el
  mismo `interviewId` o si se agrega un `PATCH` explícito.

## UC-FEED-3: Reclutador y PM leen el feedback guardado

**Rol:** Reclutador, PM.
**Precondición:** el proceso existe; para el reclutador, es uno de sus
procesos (mismo criterio de acceso que `UC-PROC-3`); el PM lee cualquier
proceso (vista ejecutiva).
**Flujo principal:** desde `/processes/:id`, tab "Feedback" — **nunca**
desde `/feedback` (esa ruta ni siquiera aparece en su `navigation.ts`
para estos roles). `GET /feedback/:processId` devuelve los feedbacks
guardados de ese proceso.
**Reglas de borde / negativas:**
- Esta es la regla que estaba en contradicción y ya se resolvió: el
  campo `Feedback.visibleTo` **no existe** (ADR-013) — la visibilidad es
  una regla de autorización estática aplicada en código del lado del
  servicio de `feedback`, nunca un dato persistido por documento. No
  reintroducir ese campo en ninguna implementación futura.
- Reclutador consultando el feedback de un proceso que no es suyo → 403
  (mismo criterio que `UC-PROC-3`, pendiente de decisión sobre
  visibilidad de equipo).
- Proceso sin ningún feedback cargado todavía (entrevistas aún no
  completadas) → respuesta vacía, no es un error.

## UC-FEED-4: Enviar feedback por email al candidato

**Rol:** Reclutador.
**Precondición:** existe al menos un `Feedback` para el proceso/candidato.
**Flujo principal:** `POST /feedback/:id/send-email` → usa
`packages/email-templates` (HTML plano, sin scripts) → `EmailSenderPort`.
**Reglas de borde / negativas:**
- `technical_ref`/`pm` → 403 (el envío al candidato es acción exclusiva
  del reclutador — es quien tiene la relación con el candidato, ver
  `PROJECT_CONTEXT.md` → "El Candidato NO tiene acceso... el reclutador
  envía feedback manual por correo").
- El candidato nunca tiene acceso directo a ningún endpoint de feedback
  (no tiene login en el MVP) — el envío es siempre push por email, nunca
  un link que el candidato consulte en la app.
