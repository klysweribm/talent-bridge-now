# Casos de uso — Entrevistas (INT-1)

> Modelo de dominio: `Interview`, `InterviewRescheduleEvent`,
> `TechnicalRefAvailability` en `packages/shared-types` (ADR-013). Flujo
> narrativo base: `docs/flows/README.md` → Flujo 2 y Flujo 4. Es el flujo
> más transversal: los 3 roles interactúan, aunque PM solo observa (no
> tiene acceso directo listado en `navigation.ts` → `/interviews` es
> `['recruiter', 'technical_ref']`, PM ve el resultado vía `/reports`).

## Resumen de permisos

| Acción | Reclutador | Referente Técnico | PM |
| --- | --- | --- | --- |
| Cargar/editar disponibilidad propia (`POST /availability`) | ❌ | ✅ (solo la propia) | ❌ |
| Ver disponibilidad de un referente (`GET /availability/:referentId`) | ✅ | ✅ (solo la propia) | ❌ |
| Agendar entrevista (`POST /interviews`) | ✅ | ❌ | ❌ |
| Confirmar entrevista (`PATCH /interviews/:id/confirm`) | ❌ | ✅ (solo si es el `referentId` asignado) | ❌ |
| Reprogramar entrevista (`PATCH /interviews/:id/reschedule`) | ✅ | ✅ (solo la propia, ver nota) | ❌ |
| Exportar `.ics` (`GET /interviews/:id/ics`) | ✅ | ✅ (solo la propia) | ❌ |
| Ver agenda/listado de entrevistas (`/interviews`) | ✅ (todas las que agendó) | ✅ (solo las propias) | ❌ (no tiene esta ruta) |

## UC-INT-1: Referente carga su disponibilidad

**Rol:** Referente Técnico.
**Precondición:** sesión válida con rol `technical_ref`.
**Flujo principal:** `POST /availability` (upsert, un documento por
`userId` — ADR-013) con bloques mañana/tarde + timezone.
**Reglas de borde / negativas:**
- `reclutador`/`pm` → 403 (no cargan disponibilidad ajena).
- Un referente no puede cargar disponibilidad **a nombre de otro**
  `userId` → 403 si el `userId` del body no coincide con el del JWT.

## UC-INT-2: Reclutador agenda entrevista (Flujo 4)

**Rol:** Reclutador.
**Precondición:** el candidato y el proceso existen; el referente elegido
está en `Process.technicalRefs` de ese proceso.
**Flujo principal:** desde `/processes/:id`, elegir referente asignado →
ver su disponibilidad → `POST /interviews` → status inicial `pending` →
email al referente ("tienes una entrevista pendiente").
**Reglas de borde / negativas:**
- Agendar con un referente que **no** está en `technicalRefs` del proceso
  → 400 (no se puede asignar una entrevista a un referente ajeno al
  proceso, aunque exista en el sistema).
- Agendar en un slot que el referente marcó como no disponible → 400.
- Sin disponibilidad cargada para ese referente → el webhook de Slack se
  dispara como fallback (criterio de éxito ya definido en `ROADMAP.md` →
  INT-1), la entrevista no se bloquea pero queda señalizada.
- `technical_ref`/`pm` llamando `POST /interviews` → 403.
- Duración de la entrevista se hereda del proceso (`Process.interviewDuration`),
  no es editable por entrevista individual en el MVP.

## UC-INT-3: Referente confirma entrevista (Flujo 2)

**Rol:** Referente Técnico.
**Precondición:** la entrevista existe, está en status `pending`, y
`referentId` coincide con el usuario autenticado.
**Flujo principal:** `PATCH /interviews/:id/confirm` → status →
`confirmed` → email automático al candidato con `.ics` adjunto (vía
`EmailSenderPort`).
**Reglas de borde / negativas:**
- Reclutador o PM intentando confirmar → 403 (solo el referente asignado
  confirma — es su propia agenda).
- Otro referente (no el `referentId` de esa entrevista) intentando
  confirmar → 403, aunque tenga rol `technical_ref` válido.
- Confirmar una entrevista que ya está `confirmed`/`completed`/`cancelled`
  → 400 (no es una operación idempotente; confirmar dos veces no es un
  no-op silencioso, es un error de estado).

## UC-INT-4: Reprogramar entrevista

**Rol:** Reclutador o Referente Técnico (el asignado).
**Precondición:** la entrevista existe y no está `cancelled`.
**Flujo principal:** `PATCH /interviews/:id/reschedule` → se apenda un
`InterviewRescheduleEvent` a `rescheduleHistory` (append-only) → `status`
vuelve a `pending`.
**Reglas de borde / negativas:**
- Limitación conocida y aceptada (ADR-013): tras reprogramar, `status`
  vuelve a `pending` igual que una entrevista nunca confirmada — no hay
  un estado distinto para "reprogramada, pendiente de reconfirmar". La UI
  diferencia revisando si `rescheduleHistory` tiene elementos. No se
  resuelve en este catálogo.
- Referente distinto al asignado → 403 (misma regla que confirmar: solo
  puede tocar su propia agenda).
- PM → 403 (no interactúa con el agendamiento en ningún caso).
- Reprogramar una entrevista `cancelled` → 400 (hay que agendar una
  entrevista nueva, no reabrir una cancelada).

## UC-INT-5: Exportar `.ics`

**Rol:** Reclutador, Referente Técnico (el asignado).
**Precondición:** la entrevista existe (cualquier status; no se exige
`confirmed` para descargar, aunque en la práctica el flujo normal es
exportar después de confirmar).
**Flujo principal:** `GET /interviews/:id/ics` descarga el archivo.
**Reglas de borde / negativas:**
- Referente ajeno a la entrevista → 403.
- `.ics` debe incluir el timezone del referente siempre (regla de negocio
  explícita, `docs/flows/README.md` → "Reglas de Negocio Críticas").
