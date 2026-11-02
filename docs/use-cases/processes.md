# Casos de uso — Procesos (PROC-1)

> Contrato: `packages/shared-types/src/processes.ts` (`IProcess`, `ICreateProcessRequest`, `IProcessListItem`, `IProcessDetail`, `IUserOption`) y `ICandidate.processId`.
> Consistencia con candidatos: ADR-013 (llamada en memoria entre servicios, sin transacciones).
> Alcance del MVP: crear, listar y asociar o quitar candidatos. Sin etapas, estados, historial de dueño, transferencia ni entrevistas.

## Reglas de negocio

- **R5:** la asignación de candidatos ocurre solo en el formulario del proceso (crear o editar). La lista de candidatos es de solo lectura.
- **R6:** asignan y quitan candidatos **únicamente** el PM dueño (`ownerPmId`) y el reclutador del proceso (`recruiterId`, uno solo). Quién cargó al candidato (`ICandidate.createdBy`) es auditoría y no da permisos. Cualquier otro usuario → 403.
- **R7:** el límite `MAX_CANDIDATES_PER_PROCESS` (defecto 5) vive solo en el backend. Superarlo → 400 con mensaje claro. El frontend lo lee de `maxCandidates` en la respuesta, nunca de una variable `VITE_`.
- **R8:** toda regla se aplica en el backend. Ocultar un botón no cuenta como control.
- **R9:** los listados (`/processes`, `/users`) son siempre paginados.
- **R1–R3 (fase siguiente, no se implementan):** visibilidad `public/protected` de candidatos y filtrado por dueño en la query. Mientras tanto `GET /processes` lista todos y los candidatos sin `createdBy` son públicos.
- **P1:** un candidato no puede estar en más de un proceso. «Disponible» = sin `processId`.
- Un solo PM y un solo reclutador por proceso; nunca dos reclutadores.

## Resumen de permisos

| Acción | Reclutador | Referente técnico | PM |
| --- | --- | --- | --- |
| Crear proceso (`POST /processes`) | ✅ (debe elegir PM) | ❌ 403 | ✅ (queda como dueño) |
| Listar (`GET /processes`) y detalle (`GET /processes/:id`) | ✅ | ❌ 403 | ✅ |
| Asociar o quitar candidatos | ✅ solo si es el `recruiterId` | ❌ 403 | ✅ solo si es el `ownerPmId` |
| Listar usuarios para selectores (`GET /users?role=pm\|recruiter`) | ✅ | ❌ 403 | ✅ |

Sin token → 401 en todos los endpoints.

## UC-PROC-1: Crear un proceso

**Rol:** reclutador o PM.
**Flujo principal:** `POST /processes` con `title`, `clientName` y, opcionalmente, `candidateIds`.
- **Crea un PM:** `ownerPmId` se toma del JWT (el del cuerpo se ignora). `recruiterId` es el que elija de `GET /users?role=recruiter`, o `null` si no elige a nadie.
- **Crea un reclutador:** `ownerPmId` es obligatorio (se elige de `GET /users?role=pm`) y `recruiterId` es el suyo (el del cuerpo se ignora).
**Reglas de borde / negativas:**
- Reclutador sin `ownerPmId` → 400.
- `ownerPmId` que no es un usuario `pm`, o `recruiterId` que no es un usuario `recruiter`, o cualquiera inexistente → 400.
- Con `recruiterId: null`, solo el PM dueño asocia y quita candidatos.
- `candidateIds` por encima del límite → 400; alguno ya asignado a otro proceso → 400/409; alguno inexistente → 404.
- El autor (`createdBy`) sale siempre del JWT, nunca del cuerpo.
- Cambiar el reclutador después (que el PM quite al actual y asigne a otro) queda **fuera del MVP**.

## UC-PROC-2: Listar procesos y ver el detalle

**Rol:** reclutador o PM.
**Flujo principal:** `GET /processes?page&limit` devuelve título, cliente, `candidateCount`, `maxCandidates` y fecha. `GET /processes/:id` devuelve además los candidatos resumidos (`id`, `fullName`, `primaryRole`).
**Reglas de borde / negativas:**
- Lista vacía → la UI muestra «Sin procesos abiertos» y el botón «+ Nuevo proceso».
- `:id` inexistente → 404.
- `page` y `limit` fuera de rango → 400 (mismo patrón que bench: `DEFAULT_LIMIT 20`, `MAX_LIMIT 50`).

## UC-PROC-3: Asociar y quitar candidatos

**Rol:** PM dueño o reclutador del proceso.
**Flujo principal:** `POST /processes/:id/candidates` con `{ candidateId }` y `DELETE /processes/:id/candidates/:candidateId`. El proceso y el candidato se actualizan por llamada en memoria entre servicios (ADR-013).
**Reglas de borde / negativas:**
- Candidato disponible → queda con `processId`. Quitarlo lo libera.
- Candidato ya en otro proceso → 400/409.
- Superar el límite → 400 con mensaje claro.
- Candidato o proceso inexistente → 404.
- Un reclutador que no es el del proceso → 403, aunque él haya cargado al candidato.
- Si la segunda escritura falla, se registra en el log (solo ids) y se propaga una excepción tipada; nunca se traga el error.

## UC-PROC-4: Selectores de usuarios

**Rol:** reclutador o PM.
**Flujo principal:** `GET /users?role=pm|recruiter&page&limit` devuelve solo `{ id, fullName }`.
**Reglas de borde / negativas:**
- `role` solo admite `pm` y `recruiter`. Cualquier otro valor, incluido `technical_ref`, o su ausencia → 400.
- `technical_ref` → 403.

## Escenarios Gherkin

```gherkin
Feature: Procesos con varios candidatos

  Scenario: un PM crea un proceso
    Given un PM autenticado
    When envía POST /processes con título y cliente
    Then recibe 201 y ownerPmId es su id

  Scenario: un reclutador crea un proceso sin elegir PM
    Given un reclutador autenticado
    When envía POST /processes sin ownerPmId
    Then recibe 400

  Scenario: un reclutador crea un proceso eligiendo PM
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
    When el PM dueño lo asocia al proceso
    Then el candidato queda con processId

  Scenario: asociar un candidato ya asignado
    Given un candidato con processId de otro proceso
    When se intenta asociar
    Then recibe 400 o 409

  Scenario: superar el límite
    Given un proceso con MAX_CANDIDATES_PER_PROCESS candidatos
    When se asocia uno más
    Then recibe 400 con un mensaje que indica el límite

  Scenario: un reclutador ajeno asocia o quita
    Given un reclutador que no es el recruiterId del proceso, aunque haya cargado al candidato
    When asocia o quita un candidato
    Then recibe 403

  Scenario: GET /users con un rol no permitido
    When se pide GET /users?role=technical_ref
    Then recibe 400

  Scenario: technical_ref o sin token
    When un technical_ref llama a /processes, /candidates o /users
    Then recibe 403
    And sin token recibe 401

  Scenario: lista vacía en la UI
    Given que no hay procesos
    When se abre /processes
    Then se ve «Sin procesos abiertos» y el botón «+ Nuevo proceso»

  Scenario: sin candidatos disponibles en el formulario
    Given que no hay candidatos sin processId
    When se abre «Nuevo proceso»
    Then la caja Candidatos se ve deshabilitada y solo queda «Agregar candidato»
```

## Diferido (no es PROC-1)

Los casos del wizard anterior (referentes técnicos `principal` y `validador`, etapas, edición con `PATCH`, cierre de procesos, búsqueda `GET /users/referents`) quedan para las features de referentes (4 y 5) y de etapas. Dependen de los tipos legados `Process`, `ProcessTechnicalRef` y `StageHistoryEntry` (DT-029/DT-037), que no se tocan en PROC-1.
