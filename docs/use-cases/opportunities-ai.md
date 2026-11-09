# Oportunidad asistida por IA (OPP-AI-1)

Etapa 1 del flujo (Creación) fortalecida con IA: el box mágico y el brochure generan un borrador, y la banca sugiere recursos en la etapa 2. Términos según [`../glossary.md`](../glossary.md) (Oportunidad = `Process` en el código).

## Resumen de permisos

| Acción | Endpoint | PM | Reclutador | Referente técnico | Sin token |
| --- | --- | --- | --- | --- | --- |
| Generar borrador desde texto | `POST /ai/opportunity-draft` | ✅ | ✅ | 403 | 401 |
| Generar borrador desde brochure | `POST /ai/opportunity-draft/file` | ✅ | ✅ | 403 | 401 |
| Sugerencias de la banca (perfil sin oportunidad) | `POST /bench/match` | ✅ | ✅ | 403 | 401 |
| Sugerencias de la banca (oportunidad creada) | `GET /processes/:id/bench-suggestions` | ✅ | ✅ | 403 | 401 |

## Reglas

- **R1.** El borrador solo rellena el formulario; no crea nada. Nada se guarda hasta "Crear oportunidad".
- **R2.** Un campo que la IA no puede inferir queda vacío (nunca inventado) y se avisa.
- **R3.** El brochure se procesa en memoria y se descarta: no se guarda en disco, base de datos ni logs. Los logs registran solo longitud, latencia y resultado, nunca el contenido.
- **R4.** El % de match lo calcula el backend de forma determinística (60 % skills, 25 % banda (misma banda 100, diferencia de 1 → 50, resto 0), 15 % disponibilidad). La IA solo explica y nunca recibe nombre, código ni datos de contacto.
- **R5.** Si no hay `startDate`, el desglose muestra "Disponibilidad: no evaluada" y los pesos se redistribuyen entre skills y banda. Nunca en silencio.
- **R6.** Si ICA falla o tarda, el flujo manual y el panel de sugerencias siguen funcionando (sin la frase de la IA).
- **R7.** Solo se sugieren recursos `available` o `soft_booked`. No hay acción de asignar: solo sugerir.

## Códigos de error estables

El cuerpo de error es siempre `{ code, message }`. **El frontend ramifica por `code`, no por el status.**

| `code` | Status | Cuándo | Mensaje |
| --- | --- | --- | --- |
| `AI_UNAVAILABLE` | 503 | ICA caído, respuesta inválida tras la reparación, o configuración del borrador ausente/inválida (falla cerrado) | genérico del servicio |
| `AI_TIMEOUT` | 504 | Se agotó el tiempo total (una sola señal cubre la llamada y la única reparación; si el primer intento agota el tiempo no se repara) | genérico del servicio |
| `OPPORTUNITY_TEXT_TOO_LONG` | 400 | El texto supera el máximo; no se llama a ICA | «El texto supera el máximo de N caracteres» (N sale de la config) |
| (validación del DTO) | 400 | Texto vacío o en blanco | «El texto de la oportunidad es obligatorio» |
| `OPPORTUNITY_SOURCE_UNREADABLE` | 422 | Brochure PDF/DOCX sin texto extraíble, corrupto o con texto en blanco; no se llama a ICA (unidad 6, backend implementado; el frontend lo traduce en la unidad 7) | «No pudimos leer el documento» |
| (validación del archivo) | 400 | Archivo ausente, vacío, de tipo no admitido (por firma) o mayor al tope `OPPORTUNITY_SOURCE_MAX_FILE_BYTES`; solo `POST /ai/opportunity-draft/file` | mensaje del servidor |

`OPPORTUNITY_TEXT_TOO_LONG` (400), `AI_UNAVAILABLE` (503) y `AI_TIMEOUT` (504) también aplican a `POST /ai/opportunity-draft/file`, con el mismo cuerpo.

## Contrato de `POST /ai/opportunity-draft` (unidad 4, backend implementado)

- Body `{ text }`. Respuesta 200: `{ draft: { title, clientName, opportunityRole, skills, roleDescription, band | null, startDate | null }, missingFields[], warnings[] }`.
- No crea ni guarda nada (R1). Lo que la IA no infiere queda vacío o `null` y se lista en `missingFields` con un aviso (R2). «Senior» sin número → `band: null` más aviso (la banda es un entero 6 a 10). `skills` pasa por `normalizeSkills` (desconocidas se conservan como se escribieron).
- Config por env (en `.env.example` y `docker-compose.yml`): `OPPORTUNITY_DRAFT_MAX_TEXT_CHARS=8000` y `OPPORTUNITY_DRAFT_TIMEOUT_MS=30000`, sin default en código (env ausente o inválida → falla cerrado con `AI_UNAVAILABLE`). **Defaults propuestos, no confirmados por negocio.** Pregunta abierta: ¿estas dos envs deben tener también default en código (8000 / 30000)? El usuario decidirá.
- Logs del servicio: solo `chars`, `latencyMs` y `outcome` (R3). FlowLog en desarrollo no imprime el cuerpo de este endpoint: solo `{ omitted, length }` (`@NoBodyLog()`, DT-055).

## Contrato de `POST /ai/opportunity-draft/file` (unidad 6, backend implementado, sin commitear)

- `multipart/form-data` con el campo `file`. Formatos: PDF, DOCX, MD y TXT. Respuesta 200: la misma `IOpportunityDraftResponse` que el box mágico (el servicio delega en `OpportunityDraftService.draft(texto)`, así que comparten tope de texto, timeout total y sanitizado).
- **Validación por firma, no por MIME ni extensión:** PDF (`%PDF-`) y DOCX (ZIP que contiene `word/`) se reconocen por sus primeros bytes; MD/TXT se aceptan si no tienen bytes NUL y decodifican como UTF-8. Un `.doc` heredado (OLE), un `.xlsx` o un binario con extensión `.pdf` se rechazan con 400. Las firmas están duplicadas a propósito respecto de `candidates` para no cruzar capabilities.
- **En memoria (R3):** PDF/DOCX se leen con `DOCUMENT_TEXT_EXTRACTOR_PORT` (`DocumentTextModule`, importado por `AiModule`); MD/TXT se decodifican como UTF-8. Nada se guarda en disco, base de datos ni logs.
- **Errores:** 400 (archivo ausente, vacío, tipo no admitido, mayor al tope — el 413 de multer se convierte en 400 con `opportunity-source-too-large.filter.ts` — y `OPPORTUNITY_TEXT_TOO_LONG`); **422 `OPPORTUNITY_SOURCE_UNREADABLE`** (PDF sin texto, corrupto o texto en blanco; no se llama a ICA); 503 `AI_UNAVAILABLE`; 504 `AI_TIMEOUT`. Cuerpo siempre `{ code, message }`.
- **Config por env** (en `.env.example` y `docker-compose.yml`): `OPPORTUNITY_SOURCE_MAX_FILE_BYTES=5242880` (5 MiB). **Sí tiene default en código** (`OPPORTUNITY_SOURCE_DEFAULT_MAX_FILE_BYTES = 5_242_880` en `opportunity-draft.constants.ts`, mismo criterio que `CV_DEFAULT_MAX_FILE_BYTES`): env ausente o vacía → default sin aviso; inválida → default y `Logger.warn` con el nombre de la variable (nunca su valor); válida → ese valor. El archivo siempre está acotado. (La propiedad de «falla cerrado, sin default» vale solo para `OPPORTUNITY_DRAFT_MAX_TEXT_CHARS` y `OPPORTUNITY_DRAFT_TIMEOUT_MS`, decisión de la unidad 4.) **5 MiB es un valor propuesto, no confirmado por negocio.**
- **Permisos:** recruiter y pm; technical_ref 403; sin token 401. Throttle con las mismas constantes que el endpoint de texto.
- **Privacidad:** el controller propio (`opportunity-draft-file.controller.ts`) lleva `@NoBodyLog()` desde su creación, con test de metadata. Los logs del servicio solo registran `bytes`, `latencyMs` y `outcome` (nunca nombre ni contenido; test con espía de Logger). Sin `@TraceFlow()`.
- Verificado con puerto de IA falso (PDF y MD por HTTP, DOCX solo con extractor falso en el test del servicio). **No verificado contra ICA real ni con un DOCX real por HTTP.**

## Comportamiento de la interfaz del box mágico (unidad 5, frontend implementado)

Verificado solo con tests (infra mockeada); sin recorrido en navegador ni contra el endpoint real.

- **Solo rellena campos vacíos.** Nunca pisa lo escrito a mano. Lo que la IA propuso para un campo que ya tenía valor se lista como «no sobrescrito». Un `null` del borrador (`band`, `startDate`) no aplica nada. El formulario se lee al **responder**, no al hacer clic en «Generar con IA».
- **«Sugerido por IA»** aparece en cada campo rellenado y se quita solo cuando el usuario lo edita (el valor actual deja de coincidir con el aplicado).
- **Campos por completar (R2):** los vacíos y los de `missingFields` se resaltan con borde y texto (no solo color), más un aviso general. Los `warnings` del backend se muestran tal cual.
- **Errores ramificados por `code`** (`error.body.code`), nunca por status: `AI_UNAVAILABLE`, `AI_TIMEOUT` y `OPPORTUNITY_TEXT_TOO_LONG` tienen mensaje propio; este último muestra el `message` del servidor (sin máximo fijo en el frontend). Sin `code` (400 de validación del DTO, 500, respuesta inesperada) → caso `UNKNOWN`; red caída (`HttpError(0)`) → caso `NETWORK`. En todos el formulario manual sigue usable y hay «reintentar» (R6).
- **Privacidad (R3):** el texto, el resultado y los `warnings` viven en estado local del componente; no pasan por localStorage, sessionStorage ni el store del wizard. El texto se envía con `trim()`.
- Pendiente de esta unidad: «Skills normalizadas» de extremo a extremo (depende de la unidad 8) y la verificación en navegador.

## Gherkin

```gherkin
# language: es
Característica: Oportunidad asistida por IA (OPP-AI-1)
  Como PM o reclutador
  Quiero describir el perfil buscado y recibir sugerencias de la banca
  Para crear oportunidades más rápido, con menos errores y priorizando talento interno

  Antecedentes:
    Dado que inicio sesión como "mariana@ibm.com" con rol "pm"

  Escenario: Generar la oportunidad desde texto libre
    Dado que estoy en la etapa 1 de "Nueva oportunidad"
    Cuando escribo en el box mágico "Fullstack senior React y NestJS para ITAU, 6 meses, inicio en diciembre"
    Y pulso "Generar con IA"
    Entonces el formulario se rellena con título, cliente, banda y stack
    Y los campos rellenados muestran "Sugerido por IA"
    Y no se crea ninguna oportunidad hasta que pulso "Crear oportunidad"

  Escenario: Campos que la IA no pudo inferir
    Cuando genero la oportunidad con un texto que no menciona al cliente
    Entonces el campo cliente queda vacío
    Y veo un aviso de campos por completar

  Escenario: Generar desde un brochure
    Cuando subo el brochure "Requerimiento_ITAU.pdf"
    Entonces el formulario se rellena igual que con el texto libre
    Y el archivo no se guarda en el servidor

  Escenario: Brochure ilegible
    Cuando subo un PDF sin texto extraíble
    Entonces veo "No pudimos leer el documento"
    Y el formulario queda intacto

  Escenario: ICA no responde al generar
    Dado que ICA no está disponible
    Cuando pulso "Generar con IA"
    Entonces veo un mensaje claro de error
    Y puedo completar el formulario manualmente

  Escenario: Skills normalizadas
    Cuando la IA devuelve "Reactjs" y "Nestjs"
    Entonces el formulario muestra "React" y "NestJS"

  Escenario: Sugerencias de la banca en la etapa 2
    Dado que completé el perfil con React, NestJS y banda 8
    Cuando avanzo a la etapa 2
    Entonces veo "Sugeridos de la banca" ordenados por % de match
    Y los recursos con 75% o más muestran "Recomendado"
    Y cada recurso muestra skills que cumple y que le faltan

  Escenario: El porcentaje no depende de ICA
    Dado que ICA no está disponible
    Cuando avanzo a la etapa 2
    Entonces veo los recursos con su % y su desglose
    Y no veo la explicación generada por IA

  Escenario: Sin coincidencias suficientes
    Dado que ningún recurso de la banca llega al umbral
    Cuando avanzo a la etapa 2
    Entonces veo "Sin coincidencias suficientes en la banca"
    Y la acción "Buscar candidatos externos"

  Escenario: Cambiar el perfil recalcula las sugerencias
    Dado que estoy en la etapa 2 con sugerencias visibles
    Cuando vuelvo a la etapa 1 y agrego la skill "AWS"
    Y avanzo otra vez a la etapa 2
    Entonces las sugerencias se recalculan con el perfil nuevo

  Escenario: Sugerencias en el detalle de la oportunidad
    Dado que la oportunidad "ITAU" ya está creada
    Cuando abro su detalle
    Entonces veo el mismo panel "Sugeridos de la banca"

  Escenario: Los datos personales no salen hacia ICA
    Cuando se generan las explicaciones del match
    Entonces ICA solo recibe skills, nivel, banda y disponibilidad
    Y nunca nombre, código ni datos de contacto

  Escenario: Permisos
    Dado que inicio sesión como "carlos@ibm.com" con rol "technical_ref"
    Entonces POST /ai/opportunity-draft responde 403
    Y POST /bench/match responde 403
    Y sin token ambos responden 401

  Escenario: Textos visibles
    Cuando navego por la aplicación
    Entonces el menú, los títulos y los botones dicen "Oportunidad"
    Y las rutas y la API siguen usando "processes"
```

## Escenarios añadidos por el plan (no estaban en la HU)

```gherkin
  Escenario: Fecha de inicio ausente
    Dado que el perfil no tiene fecha de inicio
    Cuando avanzo a la etapa 2
    Entonces el desglose muestra "Disponibilidad: no evaluada"
    Y los pesos de skills y banda se redistribuyen
```
