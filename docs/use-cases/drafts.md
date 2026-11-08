# Casos de uso — Borradores de formularios (DRAFT-1)

> Estado: 📌 **sin arrancar** (registrado en `ROADMAP.md` → `DRAFT-1`). Este archivo fija el comportamiento esperado;
> no hay código todavía. Contexto: la sesión se cierra por inactividad (aviso a los 360 s) o por expiración del JWT, y
> la caché de React Query se vacía al terminar la sesión (DT-015), así que un formulario largo se pierde completo.

## Reglas de negocio

- **D1:** el borrador **no crea ni modifica entidades**. Solo al confirmar se guarda el proceso o el candidato, y entonces
  el borrador se elimina.
- **D2:** nunca se guarda el archivo del CV: solo los campos extraídos o escritos.
- **D3:** todo acceso se filtra por el `userId` del JWT. Un usuario no puede leer, escribir ni borrar el borrador de otro.
- **D4:** el `payload` se valida contra `schemaVersion`. Si el formulario cambió de versión, el borrador se descarta con
  aviso; nunca se carga a medias.
- **D5:** logout manual → se pregunta «¿Conservar borrador?». Cierre por inactividad o expiración → se conserva siempre.
- **D6:** un borrador vence a los `DRAFT_RETENTION_DAYS` días (defecto 7) y se elimina solo (índice TTL).
- **D7:** sin PII en logs: solo `userId`, `formKey` y el tamaño del payload.

## Resumen de permisos

| Acción | Reclutador | Referente Técnico | PM |
| --- | --- | --- | --- |
| Guardar, leer, listar y borrar **sus propios** borradores | ✅ | ✅ (solo los formularios que su rol puede abrir) | ✅ |
| Acceder al borrador de otro usuario | ❌ no existe: la consulta siempre filtra por `userId` | ❌ | ❌ |

Sin token → 401 en todos los endpoints.

## Contrato previsto (a confirmar al planificar)

- Colección `drafts`: `{ userId, formKey, entityId?, payload, schemaVersion, updatedAt }`, índice único
  `{ userId, formKey, entityId }` e índice TTL por `DRAFT_RETENTION_DAYS`.
- `PUT /drafts/:formKey` (upsert), `GET /drafts/:formKey`, `DELETE /drafts/:formKey`, `GET /drafts` (lista del usuario).
- Formularios iniciales: nuevo proceso, editar proceso, agregar candidato. Feedback se suma cuando exista.

## Preguntas abiertas

1. ¿Un borrador por formulario o varios (por ejemplo, dos procesos a medio crear)? Defecto: uno por formulario nuevo y uno
   por entidad en edición.
2. ¿Qué pasa si, al recuperar una edición, la entidad cambió en el servidor? Defecto: avisar «el proceso cambió desde tu
   borrador» y dejar elegir.
3. ¿Se muestra un widget «Borradores pendientes» en el Inicio? Defecto: sí, prioridad LOW.

## Escenarios Gherkin

```gherkin
# language: es
Característica: Recuperar trabajo no enviado (DRAFT-1)
  Como PM o reclutador
  Quiero recuperar un formulario que no alcancé a enviar
  Para no perder trabajo cuando la sesión se cierra

  Escenario: Recuperar tras cierre por inactividad
    Dado que completé parte del formulario "Nuevo proceso"
    Y no lo envié
    Cuando la sesión se cierra por inactividad
    Y vuelvo a iniciar sesión y abro "Nuevo proceso"
    Entonces veo "Tienes un borrador" con su fecha
    Y al elegir "Recuperar" el formulario muestra los datos que había escrito

  Escenario: Descartar el borrador
    Dado que tengo un borrador de "Nuevo proceso"
    Cuando elijo "Descartar"
    Entonces el formulario queda vacío
    Y el borrador se elimina

  Escenario: Confirmar elimina el borrador
    Dado que recuperé un borrador
    Cuando creo el proceso
    Entonces el proceso se guarda
    Y el borrador ya no existe

  Escenario: El borrador no crea entidades
    Dado que tengo un borrador de "Agregar candidato"
    Entonces el candidato no aparece en la lista de Candidatos

  Escenario: Aislamiento entre usuarios
    Dado que "ana@ibm.com" tiene un borrador de "Nuevo proceso"
    Cuando "mariana@ibm.com" abre "Nuevo proceso"
    Entonces no ve ningún borrador
    Y GET /drafts/new-process con el token de mariana no devuelve el de ana

  Escenario: Logout manual con borrador
    Dado que tengo cambios sin enviar
    Cuando cierro sesión manualmente
    Entonces se me pregunta "¿Conservar borrador?"

  Escenario: Vencimiento
    Dado que un borrador tiene más de DRAFT_RETENTION_DAYS días
    Entonces se elimina automáticamente y no se ofrece al volver

  Escenario: Cambio de versión del formulario
    Dado que el borrador se guardó con una versión anterior del formulario
    Cuando abro el formulario
    Entonces veo "Tu borrador ya no es compatible" y no se cargan datos a medias

  Escenario: El CV no se guarda en el borrador
    Dado que subí un CV y se extrajo el perfil
    Cuando la sesión se cierra
    Entonces al recuperar veo los campos extraídos
    Y debo volver a adjuntar el archivo si quiero analizarlo de nuevo
```

> Un `Dado que` por escenario es suficiente para esta feature; al planificarla (ver `CLAUDE.md`: Gherkin → TDD exige plan
> mode primero) cada escenario pasa a ser un test que falla antes de implementar.
