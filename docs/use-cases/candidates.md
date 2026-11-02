# Casos de uso — Candidatos (CAND-1)

> Modelo de dominio: `Candidate` en `packages/shared-types`.
> `Candidate.processIds` ↔ `Process.candidateIds` se mantienen en sync vía
> llamada en memoria entre servicios (ADR-013) — nunca una transacción
> Mongo (standalone, sin replica set) ni un adapter cruzado.

## Resumen de permisos

| Acción | Reclutador | Referente Técnico | PM |
| --- | --- | --- | --- |
| Crear candidato (`POST /candidates`, dentro del wizard de PROC-2) | ✅ | ❌ | ✅ (POC, CAND-2) |
| Listar banco de perfiles (`GET /candidates`) | ✅ | ❌ | ✅ (lectura) |
| Ver detalle de candidato (`GET /candidates/:id`) | ✅ | ❌ (solo vía datos de su entrevista asignada) | ✅ (lectura) |
| Editar candidato (`PATCH /candidates/:id`) | ✅ | ❌ | ❌ |
| Extraer perfil desde un CV (`POST /candidates/cv-extraction`, CAND-2) | ✅ | ❌ | ✅ |
| Actualizar un candidato desde un CV nuevo (`PUT /candidates/:id`, CAND-2b) | ✅ | ❌ | ✅ |

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
- `technical_ref` llamando `POST /candidates` → 403. `pm` puede crear en la POC (CAND-2); revisar al cerrar el replanning de roles.

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

## UC-CAND-5: Extraer un perfil desde un CV (borrador editable)

**Roles:** Reclutador y PM. `technical_ref` → 403; sin token → 401 (`TODO(RBAC-1)`).
**Precondición:** un archivo PDF o DOCX y un modo (`ica` o `classic`).
**Flujo principal:** `POST /candidates/cv-extraction` (multipart: `file` + `mode`) devuelve un `ICvExtractionResult`
(`extractor`, `draft`, `missingFields`, `warnings`). **No persiste nada.** La persona revisa y edita el borrador y,
solo al confirmar, se llama a `POST /candidates` (UC-CAND-1), que crea el candidato con `status: 'tentative'`.
**Reglas de borde / negativas:**
- ICA no disponible (sin clave, modelo inexistente, timeout, caído) → 503 con `reason`, nunca 401. La interfaz
  ofrece "Reintentar con Clásica"; no hay cambio automático de extractor.
- Tipo no permitido (incluido `.doc` heredado), archivo vacío, corrupto o mayor que el máximo configurado → 400.
- PDF escaneado en modo clásico (sin texto) → borrador casi vacío y `warnings` lo indica (sin OCR).
- CV con instrucciones maliciosas → el borrador solo contiene datos válidos del esquema; el texto del CV nunca se
  trata como instrucción.
- Un fallo de ICA no afecta a `/bench` ni a `/auth`.
- Crear sin email → no se puede crear; email duplicado → 400 con el candidato existente (UC-CAND-1).

```gherkin
Feature: Extraer un perfil desde un CV
  Scenario: Extracción con ICA de un PDF
    Given una recruiter autenticada y un CV en PDF válido
    When envía el archivo con mode "ica"
    Then recibe un borrador con extractor "ica" y la lista missingFields
    And no se crea ningún candidato

  Scenario: Extracción clásica de un DOCX
    Given una PM autenticada y un CV en DOCX válido
    When envía el archivo con mode "classic"
    Then recibe el mismo esquema con extractor "classic"
    And el email, el teléfono y las skills del catálogo vienen rellenos

  Scenario: ICA no disponible
    Given que ICA falla
    When se pide la extracción con mode "ica"
    Then la respuesta es 503 con reason y nunca 401

  Scenario: Archivo no permitido
    When se envía un archivo .doc, vacío, corrupto o demasiado grande
    Then la respuesta es 400

  Scenario: Rol sin permiso
    Given un referente técnico autenticado
    When pide la extracción
    Then la respuesta es 403
```

## UC-CAND-6: Actualizar un perfil existente desde un CV más nuevo

**Roles:** Reclutador y PM. `technical_ref` → 403; sin token → 401.
**Precondición:** el candidato ya existe (mismo correo, sin distinguir mayúsculas).
**Flujo principal:** al terminar la extracción (UC-CAND-5) el backend busca el correo en la base y devuelve `matches`.
Si hay `exact`, la pantalla avisa **antes de editar** y de forma no bloqueante: "Este perfil ya existe y se va a
actualizar al confirmar", con la última actualización, quién la hizo y cuántas veces se actualizó. Al confirmar se
llama a `PUT /candidates/:id`: los campos del perfil se **reemplazan** por los del formulario; `email`, `status`,
`createdBy` y `createdAt` se conservan; se registra `updatedBy` (id, correo y rol de la sesión, nunca del cuerpo),
`updatedAt` y `updateCount + 1`.
**Perfiles parecidos:** si otro candidato con un correo distinto tiene el mismo nombre normalizado (sin tildes,
mayúsculas ni orden de palabras) o los mismos últimos 8 dígitos de teléfono, `matches.similar` los lista. Es solo un
aviso: no bloquea ni cambia el botón.
**Reglas de borde / negativas:**
- `PUT` a un id inexistente → 404. `PUT` con un correo distinto al guardado → 400 (cambiar el correo es UC-CAND-4).
- Editar el correo a uno que ya pertenece a otro candidato en el alta → 400 con el existente, y la pantalla ofrece
  "Actualizar el existente".
- Si la búsqueda de coincidencias falla, la extracción responde igual, sin `matches`.
- El reemplazo es total: un CV nuevo sin educación borra la educación guardada, y el aviso lo indica.
- Límites conocidos: la escritura manual no pasa por extracción, así que no muestra el aviso de parecidos; los
  candidatos creados antes de este cambio no tienen claves de búsqueda y no aparecen como parecidos hasta actualizarse.

```gherkin
Feature: Actualizar un perfil desde un CV más nuevo
  Scenario: El correo ya existe
    Given un candidato guardado con un correo
    When se extrae un CV con ese mismo correo
    Then la respuesta incluye matches.exact con quién y cuándo lo actualizó por última vez
    And no se crea ni se modifica nada todavía

  Scenario: Confirmar la actualización
    Given un perfil existente y un borrador con su mismo correo
    When un reclutador confirma con PUT /candidates/:id
    Then los campos se reemplazan, updatedBy es esa persona y updateCount aumenta en 1
    And createdBy, status y createdAt no cambian

  Scenario: Perfil parecido con otro correo
    Given un candidato guardado con otro correo y el mismo nombre
    When se extrae un CV
    Then matches.similar lo lista y la creación sigue permitida

  Scenario: La búsqueda de coincidencias falla
    Given que la consulta a la base falla
    When se extrae un CV
    Then la extracción responde con normalidad y sin matches
```

