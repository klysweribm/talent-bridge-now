---
paths:
  - "apps/backend/src/**/*.ts"
---

# Backend architecture — Hexagonal + DDD, vertical slice per capability

Detail and examples: `good-practices/BEST-PRACTICES.md` §3 (read only the section you need). Domain model (Candidate/Process/Interview/Feedback fields, stages, roles): `PROJECT_CONTEXT.md`.

## Layout

`src/capabilities/<capability>/{application/{ports,services}, domain/{dto,interfaces}, infrastructure/{adapters,controllers}}`, plus `<capability>.module.ts`. Capabilities: `auth`, `candidates`, `processes`, `interviews`, `feedback`, `reports`, `notifications`, `cv-analysis`. Cross-cutting guards/interceptors/filters/pipes go in `src/shared/`. Aliases: `@capabilities/*`, `@shared/*`.

State today: only `main.ts`, `app.module.ts` and `monitoring/health.*` exist — every capability directory is an empty skeleton. The first capability implemented becomes the golden path for the rest; build it carefully and point to it from here once it exists.

## Dependency rule (inviolable)

- `Controller → Service → Port (abstract) ← Adapter`. Controllers never import an adapter; services depend only on `application/ports/*.port.ts`, injected by token.
- `domain/` has **zero** external dependencies — no `@nestjs/*`, no `mongoose`, no HTTP client. Pure TypeScript.
- Controllers contain no logic: one service call, then shape the response. Validation via `ValidationPipe` + DTOs; auth/roles via Guards in `shared/`.
- IBM Cloud integrations (Watson NLU, COS, Event Notifications, App ID, Slack) are always an outbound Port + Adapter — a service must never know which vendor is behind it.

## REST

Plural resources (`/candidates`, `/processes`), standard verbs/status codes, filtering via query params, max 1 level of nesting (`/processes/:id/candidates` ok, deeper not). Document endpoints with `@nestjs/swagger` decorators on the controller (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) — Swagger at `/api/docs`. Never in `domain/` (see `dto-validation.md`).

## MongoDB (Mongoose)

- `timestamps: true` on every schema; Mongoose schemas live in `infrastructure/adapters/`, never in `domain/`.
- `candidate.email` unique index; index `processId` on interviews and feedback.
- Always paginate (`skip`/`limit` with a capped default) — never an unbounded `find()`.
- Adapters map Mongoose documents → domain interfaces before returning; a `Document` type never leaves the adapter.

## Logging

NestJS `Logger` only (`new Logger(ClassName.name)`), never `console.*`. Log ids and outcomes, never request bodies, tokens, OTP codes or PII.
