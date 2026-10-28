# Arquitectura agéntica de este proyecto — Hub & Spoke

> Documenta cómo este proyecto usa agentes/sub-agentes de Claude Code, no
> arquitectura de software del backend/frontend (eso vive en
> `.claude/rules/backend-architecture.md`/`frontend-architecture.md`).
> Leído por la sesión principal cuando necesita decidir cómo delegar una
> tarea — no se auto-carga por tocar un archivo (no tiene `paths:`), es
> consulta deliberada, igual que `context-engineering-guide.md`.

## El modelo

**Hub & Spoke.** La sesión principal (este chat) es el **hub/coordinador**:
decide qué hacer, en qué orden, y nunca delega esa decisión — solo delega
**ejecución** acotada a sub-agentes (**spokes**). Un spoke nunca invoca a
otro spoke directamente; siempre vuelve al hub, que decide el siguiente paso.

```
                    ┌─────────────────────┐
                    │   Sesión principal   │  ← hub / coordinador
                    │  (decide qué y en    │     nunca delega la decisión,
                    │   qué orden)         │     solo la ejecución
                    └──────────┬──────────┘
           ┌───────────┬───────┼───────┬───────────┐
           ▼           ▼       ▼       ▼           ▼
       Explore       Plan   frontend  backend    config
      (solo lee,   (diseña,  -task    -task      -task
       investiga)   no       (apps/   (apps/     (CI, Docker,
                    escribe) frontend) backend)   good-practices/)
```

## Los spokes disponibles (`.claude/agents/*.md`)

| Agente | Rol | Cuándo se usa |
| --- | --- | --- |
| `Explore` (built-in) | Solo lectura, investigación amplia | Antes de planear, cuando hay que entender código/docs existentes sin adivinar |
| `Plan` (built-in) | Diseño/arquitectura, sin escribir código | Para contrastar una decisión antes de comprometerla (ej. el modelo de dominio de ADR-013 se validó así) |
| `frontend-task` | Implementa en `apps/frontend` | Tareas de UI (`Etapa N`, `FE-*`) |
| `backend-task` | Implementa en `apps/backend` | Tareas de API/dominio (`AUTH-*`, `PROC-*`, `CV-*`) |
| `config-task` | Tooling, CI, Docker, `good-practices/` | Infra y gobierno (`HARDEN-*`, `DEPLOY-*`, Etapa 8) |

Cada `*-task` ya trae su propia lista de reglas a leer antes de escribir
código (ver su frontmatter) — el hub no necesita repetírselas al delegar.

## Límites (para evitar el 429 y no quemar tokens de más)

Encontramos en la práctica (sesión 2026-10-15) que lanzar varios agentes en
paralelo sin límite puede chocar con el rate-limit de la API (`429 Too many
requests`) — un agente se cortó a mitad de camino. Se recuperó reanudándolo,
pero el límite real debe hacerse cumplir con un **hook**, no solo con esta
regla (una regla en `.claude/` es contexto que el hub debería respetar, no
algo que el harness haga cumplir por sí solo).

- **Concurrencia máxima: 2 agentes corriendo a la vez.** Es lo que evita el
  429 — el límite real es cuántas llamadas van a la API al mismo tiempo, no
  el total acumulado.
- **Por tarea: máximo 4 agentes lanzados en total.** Alcanza para el caso
  típico (frontend + backend + config en paralelo, como QW-1). Si una tarea
  pareciera necesitar más de 4, es señal de que está mal partida — se divide
  en sub-tareas secuenciales, no en más paralelismo.
- `Explore`/`Plan` cuentan para el límite de concurrencia igual que los
  `*-task` — también consumen cupo de API, aunque no escriban código.
- Nunca dos spokes del **mismo** dominio en paralelo (dos `backend-task` a la
  vez, por ejemplo) — si hace falta más de un cambio en el mismo dominio,
  van secuenciales.

**Estado de la implementación:** esta regla todavía no está reforzada por un
hook (`PreToolUse` sobre la herramienta `Agent`, con contador por sesión) —
hoy es solo esta documentación. Implementarlo es tarea pendiente, ver
`ROADMAP.md` → "Estado actual / próximo paso" o el handoff de la sesión que lo
pidió. Se hace con la skill `update-config` (es la que sabe escribir hooks
válidos en `settings.json`).

## Modelo por agente

El campo `model:` del frontmatter de un `.claude/agents/*.md` fija qué
modelo usa ese agente. **Hoy ningún agente de este proyecto lo tiene fijado**
— los tres (`frontend-task`, `backend-task`, `config-task`) heredan el
modelo de la sesión que los lanza (comportamiento por defecto cuando se omite
el campo). Esto es intencional por ahora, pero queda pendiente decidir y fijar
explícitamente (ver `CLAUDE.md`).

Dos niveles de control, de más a menos permanente:

1. **Fijo en la definición** (`model: sonnet` en el `.md`) — explícito para
   cualquiera que lea el archivo, no depende de qué sesión lo invoque.
2. **Override puntual al invocar** — la herramienta `Agent` acepta un
   parámetro `model` por llamada, que gana sobre lo que diga el archivo. Es
   la decisión del hub caso por caso (ej. pedir `opus` para un `Plan` de
   arquitectura, aunque los `*-task` normales corran en `sonnet`).

Propuesta (no aplicada todavía): fijar `model: sonnet` en los tres
`*-task` — es el nivel correcto para escribir código y correr gates. El hub
pide `opus` explícitamente solo para `Plan` cuando la decisión lo justifica.
