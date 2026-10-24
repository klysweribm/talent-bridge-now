# Casos de uso — Candidatos (CAND-1)

> Modelo de dominio: `Candidate` en `packages/shared-types`.
> `Candidate.processIds` ↔ `Process.candidateIds` se mantienen en sync vía
> llamada en memoria entre servicios (ADR-013) — nunca una transacción
> Mongo (standalone, sin replica set) ni un adapter cruzado.

## Resumen de permisos

| Acción | Reclutador | Referente Técnico | PM |
| --- | --- | --- | --- |
| Crear candidato (`POST /candidates`, dentro del wizard de PROC-2) | ✅ | ❌ | ❌ |
| Listar banco de perfiles (`GET /candidates`) | ✅ | ❌ | ✅ (lectura) |
| Ver detalle de candidato (`GET /candidates/:id`) | ✅ | ❌ (solo vía datos de su entrevista asignada) | ✅ (lectura) |
| Editar candidato (`PATCH /candidates/:id`) | ✅ | ❌ | ❌ |

## UC-CAND-1: Cargar candidato con validación de duplicado por email

**Rol:** Reclutador (dentro del wizard, paso 3 de `processes.md`).
**Precondición:** ninguna — es la primera carga del candidato.
**Flujo principal:** `POST /candidates` con `email` único → se crea el
registro → `Process.candidateIds` y `Candidate.processIds` se sincronizan.
**Reglas de borde / negativas:**
- Email ya existente en la colección → 400, **no crea registro nuevo**,
  response incluye el candidato/proceso(s) existente(s) para que el
  frontend muestre el modal de alerta (Flujo 1, paso 3).
- Un candidato puede estar en N procesos simultáneos sin restricción
  (regla de negocio explícita en `docs/flows/README.md` → "Reglas de
  Negocio Críticas") — el duplicado por email bloquea *crear de nuevo*,
  no *asociar un candidato existente a un proceso nuevo*. **A definir en
  PROC-2/CAND-1:** si asociar un candidato existente a un segundo proceso
  usa el mismo `POST /candidates` (idempotente, detecta el duplicado y
  solo agrega el `processId`) o un endpoint distinto — no hay precedente
  en flows/README.md.
- Si la sincronización `Candidate.processIds ↔ Process.candidateIds` falla
  a mitad de camino (la llamada en memoria al servicio de candidates
  tiene éxito pero la escritura en processes falla, o viceversa): se
  loguea y se propaga como excepción tipada, **nunca** un `catch {}`
  silencioso (ADR-013). El manejo explícito del fallo parcial más allá de
  "loguear y propagar" queda **pendiente** — ADR-013 lo señala como
  abierto para PROC-2/CAND-1.
- `technical_ref`/`pm` llamando `POST /candidates` → 403.

## UC-CAND-2: Listar banco de perfiles (paginado)

**Rol:** Reclutador, PM.
**Precondición:** sesión válida.
**Flujo principal:** `GET /candidates` paginado — nunca una query sin
límite (regla de `.clinerules`).
**Reglas de borde / negativas:**
- `technical_ref` → 403 (no tiene acceso al banco de perfiles
  independiente; solo ve datos de candidato dentro del contexto de una
  entrevista propia ya agendada — ver `interviews.md`).
- PM: acceso de solo lectura, nunca ve controles de editar/eliminar en
  esta vista.

## UC-CAND-3: Ver detalle de candidato (historial de procesos)

**Rol:** Reclutador, PM.
**Precondición:** el candidato existe.
**Flujo principal:** `GET /candidates/:id` incluye su historial de
procesos (vía `processIds`).
**Reglas de borde / negativas:**
- `technical_ref` consultando `GET /candidates/:id` directamente (fuera
  del contexto de su entrevista asignada) → 403.
- Candidato sin ningún proceso asociado (`processIds: []`) → detalle
  válido, historial vacío, no es un estado de error.

## UC-CAND-4: Editar datos de candidato

**Rol:** Reclutador.
**Precondición:** el candidato existe.
**Flujo principal:** `PATCH /candidates/:id`.
**Reglas de borde / negativas:**
- Editar el `email` a uno que ya pertenece a otro candidato → 400 (misma
  regla de unicidad que en la creación).
- `technical_ref`/`pm` → 403 (PM es lectura-only también para edición).
