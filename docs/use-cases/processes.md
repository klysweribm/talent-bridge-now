# Casos de uso — Oportunidades (PROC-1)

> Contrato: `packages/shared-types/src/processes.ts` (`IProcess`, `ICreateProcessRequest`, `IUpdateProcessRequest`, `IProcessListItem`, `IProcessDetail`, `IProcessTechnicalRef`, `IUserOption`), `users.ts` (`IUserProfile`) y `ICandidate.processId`.
> Consistencia con candidatos: ADR-013 (llamada en memoria entre servicios, sin transacciones).
> Alcance actual: crear, listar (con búsqueda), ver el detalle, editar, cambiar estado y reclutador, asociar o quitar candidatos y asignar hasta 2 referentes técnicos. Sin etapas, historial de estados, transferencia de dueño, reapertura ni entrevistas.

## Reglas de negocio

- **R5:** la asignación de candidatos ocurre solo en el formulario de la oportunidad (crear o editar). La lista de candidatos es de solo lectura.
- **R6:** asignan y quitan candidatos **únicamente** el PM dueño (`ownerPmId`) y el reclutador de la oportunidad (`recruiterId`, uno solo). Quién cargó al candidato (`ICandidate.createdBy`) es auditoría y no da permisos. Cualquier otro usuario → 403.
- **R7:** el límite `MAX_CANDIDATES_PER_PROCESS` (defecto 5) vive solo en el backend. Superarlo → 400 con mensaje claro. El frontend lo lee de `maxCandidates` en la respuesta, nunca de una variable `VITE_`.
- **R8:** toda regla se aplica en el backend. Ocultar un botón no cuenta como control.
- **R9:** los listados (`/processes`, `/users`) son siempre paginados.
- **R1–R3 (fase siguiente, no se implementan):** visibilidad `public/protected` de candidatos y filtrado por dueño en la query. Mientras tanto `GET /processes` lista todos y los candidatos sin `createdBy` son públicos.
- **P1:** un candidato no puede estar en más de una oportunidad. «Disponible» = sin `processId`.
- Un solo PM y un solo reclutador por oportunidad; nunca dos reclutadores.
- **R10 (estado):** la oportunidad tiene `status`: `open` (Abierto), `in_progress` (Avanzando), `interviewing` (Entrevista), `closed` (Cerrado) y `cancelled` (Cancelado). Defecto al crear: `open`; un documento sin `status` se trata como `open`. Entre `open`, `in_progress` e `interviewing` se mueve libremente. `closed` y `cancelled` son **terminales**: ningún `PATCH`, ni agregar o quitar candidatos ni cambiar referentes → 400 `PROCESS_TERMINAL_STATE`. Reabrir queda fuera del MVP.
- **R11 (cancelar y cerrar):** «Eliminar» en la UI no borra: pasa la oportunidad a `cancelled`, tras confirmación. Cancelar **libera** a los candidatos (`processId` → `null`, vacía `candidateIds`; primero libera y luego cambia el estado, y si falla responde 503 `PROCESS_RELEASE_FAILED` sin cambiar nada). Cerrar **conserva** a los candidatos asociados. Los referentes técnicos asignados se conservan en ambos casos.
- **R12 (editar):** editan, cambian el estado y gestionan candidatos y referentes solo el PM dueño y el reclutador asignado. **Cambiar el reclutador** (`recruiterId`) es exclusivo del PM dueño y el nuevo debe ser un usuario `recruiter`.
- **R13 (referentes técnicos):** hasta 2 por oportunidad (`technicalRefIds`), cada uno un usuario existente, activo y con rol `technical_ref`, sin repetir. El `PATCH` **reemplaza** el conjunto (`[]` lo limpia). Inválido → 400 `PROCESS_INVALID_TECHNICAL_REF`.
- **R14 (oportunidad):** la oportunidad se describe con `opportunityRole`, `skills` (1 a 15), `roleDescription` y `band` (entero de 6 a 10), obligatorios al crear. Las oportunidades anteriores sin estos campos se leen vacíos (`''`, `[]`, `null`) y se pueden completar con `PATCH`. Además admite `startDate` **opcional** (fecha de inicio, formato `YYYY-MM-DD` y fecha de calendario real): si no se indica, se lee `null`; una fecha con formato o calendario inválido (mes 13, día 32, `2026-02-30`) → 400. `null` y vacío también → 400, así que **el `PATCH` no puede borrar `startDate`** (DT-052); en la UI vaciar el campo al editar no envía nada. Se usa en el match de la banca (R5 de `opportunities-ai.md`).
- **R15 (errores con código):** los errores de reglas de la oportunidad llevan un `code` estable en el cuerpo (`{ statusCode, code, message }`): `PROCESS_TERMINAL_STATE`, `PROCESS_CANDIDATE_LIMIT`, `CANDIDATE_ALREADY_ASSIGNED`, `PROCESS_RELEASE_FAILED`, `PROCESS_INVALID_TECHNICAL_REF`. El frontend traduce por `code`, nunca por el texto del mensaje.

## Resumen de permisos

| Acción | Reclutador | Referente técnico | PM |
| --- | --- | --- | --- |
| Crear oportunidad (`POST /processes`) | ✅ (debe elegir PM) | ❌ 403 | ✅ (queda como dueño) |
| Listar (`GET /processes`) y detalle (`GET /processes/:id`) | ✅ | ❌ 403 | ✅ |
| Asociar o quitar candidatos | ✅ solo si es el `recruiterId` | ❌ 403 | ✅ solo si es el `ownerPmId` |
| Editar, cambiar estado y asignar referentes (`PATCH /processes/:id`) | ✅ solo si es el `recruiterId` | ❌ 403 | ✅ solo si es el `ownerPmId` |
| Cambiar el reclutador (`recruiterId`) | ❌ 403 | ❌ 403 | ✅ solo si es el `ownerPmId` |
| Listar usuarios para selectores (`GET /users?role=pm\|recruiter\|technical_ref`) | ✅ | ❌ 403 | ✅ |

Sin token → 401 en todos los endpoints.

## UC-PROC-1: Crear una oportunidad

**Rol:** reclutador o PM.
**Flujo principal:** `POST /processes` con `title`, `clientName`, `opportunityRole`, `skills`, `roleDescription`, `band` y, opcionalmente, `startDate` y `candidateIds`. Nace en estado `open` y sin referentes técnicos.
- **Crea un PM:** `ownerPmId` se toma del JWT (el del cuerpo se ignora). `recruiterId` es el que elija de `GET /users?role=recruiter`, o `null` si no elige a nadie.
- **Crea un reclutador:** `ownerPmId` es obligatorio (se elige de `GET /users?role=pm`) y `recruiterId` es el suyo (el del cuerpo se ignora).
**Reglas de borde / negativas:**
- Reclutador sin `ownerPmId` → 400.
- `ownerPmId` que no es un usuario `pm`, o `recruiterId` que no es un usuario `recruiter`, o cualquiera inexistente → 400.
- Con `recruiterId: null`, solo el PM dueño asocia y quita candidatos.
- `candidateIds` por encima del límite → 400; alguno ya asignado a otra oportunidad → 400/409; alguno inexistente → 404.
- El autor (`createdBy`) sale siempre del JWT, nunca del cuerpo.
- Faltar un campo de la oportunidad, o `band` fuera de 6 a 10 o no entero, o `startDate` presente pero inválida, o `skills` vacía, repetida (sin distinguir mayúsculas) o con más de 15 → 400.
- Cambiar el reclutador después lo hace el PM dueño con `PATCH` (ver UC-PROC-5).

## UC-PROC-2: Listar oportunidades y ver el detalle

**Rol:** reclutador o PM.
**Flujo principal:** `GET /processes?page&limit&q` devuelve título, cliente, `status`, los campos de la oportunidad, `candidateCount`, `maxCandidates`, fecha y `technicalRefs` (`id`, `fullName`, `avatarUrl?`, en el orden asignado; incluye inactivos, omite los que ya no existen y es `[]` si no hay; sin email, banda ni descripción). `GET /processes/:id` devuelve además los candidatos resumidos (`id`, `fullName`, `primaryRole`) y `technicalRefs` con la ficha completa (`email`, `role`, `band`, `description`, `status`, `avatarUrl?`).
**Búsqueda:** `q` (opcional, recortado, hasta 100 caracteres) filtra por coincidencia parcial, sin distinguir mayúsculas, en título, cliente y rol de la oportunidad; los caracteres especiales se tratan como texto. Vacío o en blanco equivale a no filtrar. `q` repetido o de más de 100 caracteres → 400. `total` y `totalPages` reflejan el filtro. El filtro solo reduce: no cambia lo que cada rol puede ver.
**Reglas de borde / negativas:**
- Lista vacía → la UI muestra «Sin oportunidades abiertas» y el botón «+ Nueva oportunidad». Una búsqueda sin coincidencias muestra «Sin resultados» con «Limpiar filtro».
- `:id` inexistente → 404.
- `page` y `limit` fuera de rango → 400 (mismo patrón que bench: `DEFAULT_LIMIT 20`, `MAX_LIMIT 50`).

## UC-PROC-3: Asociar y quitar candidatos

**Rol:** PM dueño o reclutador de la oportunidad.
**Flujo principal:** `POST /processes/:id/candidates` con `{ candidateId }` y `DELETE /processes/:id/candidates/:candidateId`. La oportunidad y el candidato se actualizan por llamada en memoria entre servicios (ADR-013).
**Reglas de borde / negativas:**
- Oportunidad `closed` o `cancelled` → 400 `PROCESS_TERMINAL_STATE` al asociar y al quitar.
- Candidato disponible → queda con `processId`. Quitarlo lo libera.
- Candidato ya en otra oportunidad → 400/409.
- Superar el límite → 400 con mensaje claro.
- Candidato u oportunidad inexistente → 404.
- Un reclutador que no es el de la oportunidad → 403, aunque él haya cargado al candidato.
- Si la segunda escritura falla, se registra en el log (solo ids) y se propaga una excepción tipada; nunca se traga el error.

## UC-PROC-4: Selectores de usuarios

**Rol:** reclutador o PM.
**Flujo principal:** `GET /users?role=pm|recruiter|technical_ref&page&limit` devuelve `{ id, fullName }`. Para `technical_ref` devuelve solo usuarios activos y añade `band` cuando el usuario la tiene; para `pm` y `recruiter` la respuesta sigue siendo solo `{ id, fullName }`.
**Reglas de borde / negativas:**
- `role` solo admite `pm`, `recruiter` y `technical_ref`. Cualquier otro valor, o su ausencia → 400.
- Un usuario `technical_ref` que llame al endpoint → 403.

## UC-PROC-5: Editar, cambiar estado y asignar referentes

**Rol:** PM dueño o reclutador asignado (el cambio de reclutador, solo el PM dueño).
**Flujo principal:** `PATCH /processes/:id` con cualquier subconjunto de `title`, `clientName`, `opportunityRole`, `skills`, `roleDescription`, `band`, `startDate`, `recruiterId`, `status` y `technicalRefIds`. Responde con el detalle actualizado. En la UI, «Eliminar» es pasar a `cancelled` con confirmación.
**Reglas de borde / negativas:**
- Otro usuario, `createdBy` sin ser dueño ni asignado, o `technical_ref` → 403; sin token → 401; oportunidad inexistente → 404 (antes que 403).
- `null` en cualquier campo (incluido `startDate`, que por eso no se puede borrar), campo desconocido, `status` fuera de los 5 valores o validaciones de la oportunidad → 400.
- `recruiterId` enviado por el reclutador asignado → 403; que no sea un usuario `recruiter` → 400.
- Oportunidad `closed` o `cancelled` → 400 `PROCESS_TERMINAL_STATE` (un cierre concurrente tampoco se pisa: la actualización es condicional).
- `status: 'cancelled'` libera a los candidatos (R11); `closed` los conserva.
- `technicalRefIds` con más de 2, repetidos, inexistentes, inactivos o de otro rol → 400 `PROCESS_INVALID_TECHNICAL_REF`.

## Escenarios Gherkin

```gherkin
Feature: Oportunidades con varios candidatos

  Scenario: un PM crea una oportunidad
    Given un PM autenticado
    When envía POST /processes con título y cliente
    Then recibe 201 y ownerPmId es su id

  Scenario: un reclutador crea una oportunidad sin elegir PM
    Given un reclutador autenticado
    When envía POST /processes sin ownerPmId
    Then recibe 400

  Scenario: un reclutador crea una oportunidad eligiendo PM
    Given un reclutador autenticado y un usuario con rol pm
    When envía POST /processes con ese ownerPmId
    Then recibe 201 y recruiterId es el id del reclutador

  Scenario: un PM elige un reclutador de la lista
    Given un PM autenticado y un usuario con rol recruiter
    When envía POST /processes con ese recruiterId
    Then recibe 201 y ese reclutador puede asociar y quitar candidatos

  Scenario: un PM no elige reclutador
    Given un PM autenticado
    When envía POST /processes sin recruiterId
    Then recruiterId es null y solo el PM dueño puede asociar o quitar candidatos

  Scenario: ownerPmId o recruiterId con otro rol o inexistente
    When se envía un ownerPmId que no es pm, o un recruiterId que no es recruiter, o un id inexistente
    Then recibe 400

  Scenario: asociar un candidato disponible
    Given un candidato sin processId
    When el PM dueño lo asocia a la oportunidad
    Then el candidato queda con processId

  Scenario: asociar un candidato ya asignado
    Given un candidato con processId de otra oportunidad
    When se intenta asociar
    Then recibe 400 o 409

  Scenario: superar el límite
    Given una oportunidad con MAX_CANDIDATES_PER_PROCESS candidatos
    When se asocia uno más
    Then recibe 400 con un mensaje que indica el límite

  Scenario: un reclutador ajeno asocia o quita
    Given un reclutador que no es el recruiterId de la oportunidad, aunque haya cargado al candidato
    When asocia o quita un candidato
    Then recibe 403

  Scenario: GET /users con un rol no permitido
    When se pide GET /users?role=admin
    Then recibe 400

  Scenario: GET /users de referentes técnicos
    Given referentes activos e inactivos
    When un PM o reclutador pide GET /users?role=technical_ref
    Then recibe solo los activos, con su band si la tienen

  Scenario: cancelar libera a los candidatos
    Given una oportunidad con candidatos asociados
    When el PM dueño envía PATCH con status cancelled
    Then los candidatos quedan sin processId y la oportunidad queda cancelled

  Scenario: cerrar conserva a los candidatos
    Given una oportunidad con candidatos asociados
    When el PM dueño envía PATCH con status closed
    Then los candidatos siguen asociados

  Scenario: una oportunidad terminal no se modifica
    Given una oportunidad closed o cancelled
    When se intenta PATCH, asociar o quitar un candidato, o cambiar referentes
    Then recibe 400 con code PROCESS_TERMINAL_STATE

  Scenario: solo el PM dueño cambia el reclutador
    Given un reclutador asignado
    When envía PATCH con recruiterId
    Then recibe 403

  Scenario: asignar referentes técnicos
    Given dos usuarios technical_ref activos
    When el PM dueño envía PATCH con technicalRefIds de ambos
    Then el detalle devuelve technicalRefs con su ficha completa
    And enviar un tercero, uno repetido o uno inactivo recibe 400 con code PROCESS_INVALID_TECHNICAL_REF

  Scenario: buscar oportunidades
    Given oportunidades de distintos clientes y roles
    When se pide GET /processes?q=santander
    Then solo aparecen los que coinciden y total refleja el filtro

  Scenario: technical_ref o sin token
    When un technical_ref llama a /processes, /candidates o /users
    Then recibe 403
    And sin token recibe 401

  Scenario: lista vacía en la UI
    Given que no hay oportunidades
    When se abre /processes
    Then se ve «Sin oportunidades abiertas» y el botón «+ Nueva oportunidad»

  Scenario: sin candidatos disponibles en el formulario
    Given que no hay candidatos sin processId
    When se abre «Nueva oportunidad»
    Then la caja Candidatos se ve deshabilitada y solo queda «Agregar candidato»
```

## Diferido (no es PROC-1)

Etapas e historial de estados, reapertura de oportunidades, transferencia de dueño, disponibilidad de los referentes (agenda «w3») y los roles `principal`/`validador` de los referentes. Dependen de los tipos legados `Process`, `ProcessTechnicalRef` y `StageHistoryEntry` (DT-029/DT-037), que no se tocan.
