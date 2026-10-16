# IBM Consulting Advantage (ICA) — Developer APIs

> Documentación de referencia descargada el 2026-10-16 desde el Swagger UI
> interno de IBM (`servicesessentials.ibm.com`). **No es parte del backend de
> IBM Talent Bridge** — hoy ningún código de este repo llama a ICA. Se guarda
> aquí como referencia reutilizable: la especificación es genérica de ICA, no
> específica de este proyecto, así que puede copiarse tal cual a cualquier
> otro repo/agente que necesite integrarse con ICA (p. ej. el agente
> "repo inspector" de `architecture_reviewer`, que es el motivo por el que se
> bajó).

- **Spec real**: [`openapi.yaml`](./openapi.yaml) (OpenAPI 3.0.3, 1297 líneas) — bajado con `curl` autenticado desde `https://servicesessentials.ibm.com/services/apis/docs/openapi.yaml` (la URL que carga el visor Swagger UI de `.../ica-ai-apis-swagger-ui/index.html`, vía su config `url: "../openapi.yaml"`). Volver a descargarlo cuando quede desactualizado: abrir esa página logueado, copiar las cookies de sesión desde DevTools → Network, y repetir el `curl` contra `openapi.yaml`.
- **Host de la API**: `https://api.servicesessentials.ibm.com/v1` (distinto del host donde vive la documentación).

## Autenticación

Bearer token estilo OpenAI en el header `Authorization`. La API key de
desarrollador se genera desde la UI de ICA: **Settings → API Keys → ICA
APIs**. No es la misma cookie de sesión del navegador — es una key propia
por usuario/equipo, pensada para llamadas programáticas.

```
Authorization: Bearer <tu-api-key-de-ICA>
```

## Qué expone (6 grupos de endpoints)

| Grupo | Endpoints | Para qué sirve |
| --- | --- | --- |
| **Assistants** | `POST /assistants/chat/completions`, `GET /assistants`, `GET /assistants/models` | Chatear con un asistente preconfigurado de ICA (prompt/contexto ya definidos del lado de ICA). |
| **Agents** | `POST /agents/chat/completions`, `GET /agents`, `GET /agents/models` | Igual que Assistants pero con agentes (pueden incluir herramientas/orquestación propia de ICA). |
| **Digital Workforce** | `POST /digital-workforce/chat/completions`, `GET /digital-workforce`, `GET /digital-workforce/models` | Chatear con "trabajadores digitales" — mismo contrato de request/response. |
| **Chat Models** | `POST /chat-models/chat/completions`, `GET /chat-models`, `GET /chat-models/models` | Acceso directo a modelos "en crudo" (sin la capa de asistente/agente), compatible con el formato OpenAI chat completions. |
| **Files** | `POST /files`, `GET /files`, `GET /files/{file_id}`, `DELETE /files/{file_id}` | Subir documentos y referenciarlos en un chat con `files: [{ "type": "file", "id": "<file-id>" }]`. Hay que esperar `data.status == "completed"` (polling a `GET /files/{file_id}`) antes de poder referenciar el archivo — la extracción de texto es asíncrona. |
| **Document Collections** | `POST /document-collections`, `GET /document-collections`, `GET/PUT /document-collections/{id}`, `POST .../file/add`, `POST .../file/remove` | Agrupar varios archivos en una base de conocimiento consultable (RAG), referenciable en chat con `files: [{ "type": "collection", "id": "<collection-id>" }]`. |
| **Tools (MCP)** | ver abajo | Registrar y usar servidores de herramientas vía **Model Context Protocol** — es el punto de entrada para que ICA invoque herramientas externas, o para que un cliente MCP (Claude Code/Desktop, MCP Inspector, opencode) invoque las herramientas que ICA expone. |

Los 4 primeros namespaces (`assistants`, `agents`, `digital-workforce`,
`chat-models`) comparten el mismo request/response shape — compatible con el
formato OpenAI (`ChatCompletionRequest`/`ChatCompletionResponse`).

## Tools / MCP — el bloque más relevante para integraciones

> MCP (Model Context Protocol) es el estándar abierto que permite que un
> modelo/agente invoque herramientas externas de forma uniforme. Esta API
> actúa como **registro y gateway** de servidores MCP para tu equipo ICA.

| Endpoint | Método | Qué hace |
| --- | --- | --- |
| `/tools` | `GET` | Lista los servidores MCP visibles para tu API key (los públicos + los de tu equipo). Cada entrada trae un `connection` ya armado — se pega directo en la config de un cliente MCP estándar, reemplazando el token por tu API key. Pasar `?return_tools=true` para incluir también la lista de herramientas de cada servidor. |
| `/tools` | `POST` | Registra un servidor MCP nuevo, scoped a tu equipo. Tres modos de auth al crearlo: `bearer` (token fijo), `oauth` (flujo OAuth completo — queda en `pending_authorization` hasta completarlo), o sin auth. Si no es OAuth, se conecta y descubre sus herramientas de inmediato. |
| `/tools/{id}` | `PUT` | Actualiza metadata (nombre, descripción) o rota credenciales de un servidor que sea de tu equipo. No se puede cambiar la URL del upstream ni su origen. |
| `/tools/{id}` | `DELETE` | Borra un servidor de tu equipo (gateway, conexión y registro). |
| `/tools/search` | `GET` | Busca por nombre/descripción de servidor o de herramienta individual (`?q=`), paginado. |
| `/tools/{cfServerId}/mcp` | `GET` | Abre un stream SSE servidor→cliente (transporte MCP streamable-HTTP). |
| `/tools/{cfServerId}/mcp` | `POST` | Invoca el servidor MCP con una petición JSON-RPC 2.0 (`initialize`, `tools/list`, `tools/call`, …) — es la llamada real para "usar" una herramienta ya registrada. |

**Flujo típico para explotar esto:**
1. `POST /tools` para registrar un servidor MCP propio (por ejemplo, un servidor que exponga capacidades de generación de diagramas/C4), o usar uno público ya listado.
2. `GET /tools?return_tools=true` (o `/tools/search`) para descubrir qué herramientas expone.
3. `POST /tools/{cfServerId}/mcp` con `tools/call` para invocar la herramienta concreta.

Esto es justo lo que permitiría conectar ICA con una herramienta externa de
documentación/diagramado (como se mencionó para el agente "repo inspector" de
`architecture_reviewer`) — ese agente sería quien registra su propio servidor
MCP (o usa uno existente) y lo invoca a través de este gateway.

## Qué más se puede explotar a futuro (ideas, no decisiones)

- **Document Collections** como RAG sobre la documentación/código de un repo — subir los `.md`/diagramas generados y permitir que un asistente responda preguntas sobre la arquitectura documentada.
- **Agents** en vez de **Chat Models** cuando se necesite orquestación propia de ICA (herramientas ya conectadas del lado de ICA) en lugar de armar el loop de herramientas manualmente.
- El soporte **OAuth** en `POST /tools` permite registrar servidores MCP que requieran login de usuario (p. ej. una herramienta que escriba en un repo de GitHub a nombre de alguien), no solo servidores con token fijo.

## Esquemas clave (ver `openapi.yaml` → `components.schemas` para el detalle completo)

- `ChatCompletionRequest` / `ChatCompletionResponse` — compatibles con el formato de OpenAI; aceptan `files: [...]` para adjuntar archivos/colecciones.
- `McpServer` — forma de cada servidor listado por `GET /tools` (incluye el `connection` listo para pegar en un cliente MCP).
- `CreateToolServerRequest` / `UpdateToolServerRequest` — payloads para registrar/actualizar un servidor MCP.
- Respuestas de error comunes: `400 BadRequest`, `401 Unauthorized`, `403 Forbidden` (servidor no es de tu equipo), `404 NotFound`.

## Notas de seguridad

- La API key de ICA es un secreto — nunca commitear una real en este repo ni en ningún otro. Si se usa desde código, va como variable de entorno (ver `.claude/rules/anti-hardcoding.md` de este repo para la convención), nunca hardcodeada.
- El `curl` usado para bajar `openapi.yaml` llevaba cookies de sesión del navegador (login corporativo IBM) — esas cookies **no se guardaron** en este repo ni en ningún archivo; solo se usaron una vez, de forma efímera, para la descarga.
