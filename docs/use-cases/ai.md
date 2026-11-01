# Casos de uso — Asistente de IA (AI-1)

Capability `ai`: servicio inyectable que envía una consulta a ICA y devuelve una respuesta, organizado por
**tópicos**. Decisión y riesgos: ADR-014. Contrato: `packages/shared-types/src/ai.ts`.

## Resumen de permisos

| Acción | Reclutador | PM | Referente Técnico |
| --- | --- | --- | --- |
| `GET /ai/status` | Sí | Sí | 403 |
| `POST /ai/ask` | Sí | Sí | 403 |

Sin token: 401. `TODO(RBAC-1)`: el acceso real por rol se afina con RBAC.

## UC-AI-1: Consultar el estado del asistente

- **Rol:** reclutador, PM.
- **Flujo:** `GET /ai/status` devuelve `{ available, source, model, reason? }`. Comprueba que la clave responda y que `ICA_MODEL_ID` esté en `GET /chat-models/models`.
- **Reglas:**
  - Sin clave: `available: false`, `reason: NOT_CONFIGURED`. Modelo ausente: `MODEL_NOT_FOUND`. Clave rechazada: `UNAUTHORIZED`.
  - La respuesta nunca contiene ningún fragmento de la clave.
  - Es independiente del resto: si ICA cae, `/bench`, `/auth` y `/health` siguen igual.

## UC-AI-2: Hacer una consulta

- **Rol:** reclutador, PM.
- **Flujo:** `POST /ai/ask` con `{ topic, query }`. Responde `{ ok: true, answer, topic, source, model, usage }`.
- **Reglas:**
  - `topic` en lista cerrada (hoy solo `general`); `query` con longitud máxima; throttle más estricto que el global.
  - `topic` fuera de la lista o `query` vacía o demasiado larga: 400.
  - Sin proveedor, clave inválida, modelo inexistente, red, timeout, 429 o 5xx: **503** (nunca 401) con `reason`.
  - Hay un tope de tiempo total por consulta (`AI_TOTAL_TIMEOUT_MS`), además del timeout por llamada y los reintentos.
  - Con `AI_PROVIDER=fake` la respuesta lleva `source: 'fake'`.

## UC-AI-3: Uso desde otra capability (servicio)

- **Flujo:** otra capability importa `AiModule` e inyecta el coordinator: `ask({ topic, query, context? })`.
- **Reglas:** el coordinator nunca lanza; devuelve `{ ok: true, ... }` o `{ ok: false, reason }`, y cada capability decide qué hacer sin IA. Ningún endpoint de otra capability depende de ICA para responder.

## Fuera de alcance (siguientes)

Sub-agentes y tool-calling (`TODO(AI-2)`); tópicos de oportunidad, CV y feedback; lectura de la banca o del proceso desde la base; caja de asistente en la UI; `stream`; `files`.
