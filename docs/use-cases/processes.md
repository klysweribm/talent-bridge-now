# Casos de uso — Procesos (PROC-2)

> Modelo de dominio: `Process`, `ProcessTechnicalRef`, `StageHistoryEntry`
> en `packages/shared-types` (ver ADR-013 en `docs/architecture/README.md`).
> Flujo narrativo base: `docs/flows/README.md` → Flujo 1 y Flujo 4.

## Resumen de permisos

| Acción | Reclutador | Referente Técnico | PM |
| --- | --- | --- | --- |
| Crear proceso (`POST /processes`) | ✅ | ❌ | ❌ |
| Editar proceso (`PATCH /processes/:id`) | ✅ (si es su proceso) | ❌ | ❌ |
| Ver listado de procesos (`GET /processes`) | ✅ | ❌ (ve solo sus asignados, vía `/interviews`) | ✅ (solo lectura) |
| Ver detalle de un proceso (`GET /processes/:id`) | ✅ (sus procesos) | ✅ (solo si es `technicalRefs` del proceso) | ✅ (todos, lectura) |
| Buscar referentes por especialidad (`GET /users/referents`) | ✅ | ❌ | ❌ |
| Cargar candidato con duplicado de email (`POST /candidates`) | ✅ (bloqueado por validación) | — | — |

> ⚠️ **Discrepancia detectada (sin resolver, señalada para PROC-2):**
> `AppRouter.tsx` da acceso a las rutas `/processes/new` y `/processes/:id`
> también a `pm` (`roles: ['recruiter', 'pm']`, ver `COMING_SOON_ROUTES`),
> pero este documento y `docs/flows/README.md` asumen que crear/editar un
> proceso es exclusivo de `recruiter` — PM es "vista ejecutiva de solo
> lectura" según `PROJECT_CONTEXT.md` → "Roles del MVP". No se corrige el
> código en este catálogo (solo se escribe en modo documentación); al
> implementar PROC-2 hay que decidir cuál de los dos es correcto: ¿el
> acceso de PM a esas rutas es solo para que `ComingSoon` no le dé 404
> mientras no hay pantalla real (plausible, dado que `/processes/new` y
> `/processes/:id` hoy renderizan `ComingSoon` para todos), o PM debería
> tener de verdad acceso de lectura al detalle/wizard? Los casos de uso de
> abajo asumen la segunda lectura de `PROJECT_CONTEXT.md` (PM = solo
> lectura, nunca crea/edita) hasta que se resuelva explícitamente.

## UC-PROC-1: Crear proceso completo (wizard de 4 pasos)

**Rol:** Reclutador.
**Precondición:** sesión válida con rol `recruiter`.
**Flujo principal:** paso 1 (info del rol) → paso 2 (asignar referentes) →
paso 3 (cargar candidatos) → paso 4 (confirmar y publicar) → `POST
/processes` persiste el proceso completo.
**Reglas de borde / negativas:**
- Paso 2 exige **mínimo 1 `principal` + 1 `validador`** en
  `technicalRefs` — validado por `class-validator` en el DTO (ADR-013), no
  solo en la UI. Intentar publicar con 0 referentes de alguno de los dos
  roles → 400.
- `technical_ref` o `pm` intentando `POST /processes` → 403.
- Paso 3: cargar un candidato con email ya existente → 400 con mensaje
  claro (modal de alerta con el proceso existente, no crea un registro
  nuevo) — ver `UC-CAND-*` en `candidates.md` para el detalle de esa regla,
  que vive en la capability de candidatos, no en processes.

## UC-PROC-2: Editar un proceso existente

**Rol:** Reclutador.
**Precondición:** el proceso existe y `recruiterId` coincide con el
usuario autenticado (un reclutador no edita el proceso de otro
reclutador en el MVP — no hay noción de "equipo" todavía).
**Flujo principal:** `PATCH /processes/:id`.
**Reglas de borde / negativas:**
- Reclutador distinto al `recruiterId` del proceso → 403.
- `technical_ref`/`pm` → 403 (son siempre lectura sobre `Process`).
- Proceso con `status: 'closed'` → rechazar la edición de campos que
  afectan el flujo activo (ej. `technicalRefs`, `currentStage`); permitir
  solo lo que no afecta el histórico ya cerrado — **a definir en PROC-2**
  qué campos son editables post-cierre (no hay precedente en flows/README.md).

## UC-PROC-3: Ver listado/detalle de procesos (lectura por rol)

**Rol:** Reclutador, Referente Técnico, PM.
**Precondición:** sesión válida.
**Flujo principal:**
- Reclutador: `GET /processes` lista los suyos (dashboard, Flujo 1).
- PM: `GET /processes` lista todos, vista ejecutiva de solo lectura
  (Flujo 3) — PM nunca ve un botón de editar/crear en esta vista.
- Referente Técnico: no tiene una vista de "todos los procesos" en
  `navigation.ts` (no está en `roles` de `/processes`) — accede al detalle
  de un proceso específico solo indirectamente, a través de sus
  entrevistas asignadas (`/interviews` → detalle de entrevista → datos del
  proceso asociados a esa entrevista).
**Reglas de borde / negativas:**
- `GET /processes/:id` para un proceso donde el referente **no** está en
  `technicalRefs` → 403 (un referente no puede ver procesos ajenos aunque
  conozca el ID).
- Reclutador consultando `GET /processes/:id` de un proceso de otro
  reclutador → **a definir**: ¿puede leerlo (visibilidad de equipo) aunque
  no pueda editarlo? `docs/flows/README.md` no lo cubre. Hasta que se
  decida, tratar como 403 (más restrictivo, se puede relajar después sin
  romper contrato).

## UC-PROC-4: Buscar y asignar referentes técnicos (paso 2 del wizard)

**Rol:** Reclutador.
**Precondición:** está en el paso 2 del wizard (proceso en borrador, no
publicado todavía).
**Flujo principal:** `GET /users/referents?specialty=...` filtra por
stack/especialidad → reclutador asigna `principal` + `validador`.
**Reglas de borde / negativas:**
- `specialty` es texto libre hoy (taxonomía controlada es decisión
  **pendiente**, ver ADR-013 "Abierto") — el filtro puede no encontrar
  coincidencias si el dato no está normalizado (`"React"` vs `"ReactJS"`).
  No es un bug a corregir en PROC-2; es la limitación conocida que ADR-013
  deferió.
- Asignar al mismo `userId` como `principal` y `validador` del mismo
  proceso → 400 (un referente no puede validar su propio trabajo).
- `technical_ref`/`pm` llamando `GET /users/referents` → 403 (es un
  endpoint de soporte al wizard, exclusivo de `recruiter`).
