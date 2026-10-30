---
paths:
  - "apps/backend/src/**/*.ts"
---

# Backend architecture — Hexagonal + DDD, vertical slice per capability

Detail and examples: `good-practices/BEST-PRACTICES.md` §3 (read only the section you need). Entity types and roles: `packages/shared-types` (domain doc pending, `docs/domain.md`); use cases: `docs/use-cases/`; embed-vs-reference decisions and cross-aggregate consistency: ADR-013 in `docs/architecture/README.md`.

## Layout

`src/capabilities/<capability>/{application/{ports,services}, domain/{dto,interfaces}, infrastructure/{adapters,controllers}}`, plus `<capability>.module.ts`. Capabilities: `auth`, `candidates`, `processes`, `interviews`, `feedback`, `reports`, `notifications`, `cv-analysis`. Cross-cutting guards/interceptors/filters/pipes go in `src/shared/`. Aliases: `@capabilities/*`, `@shared/*`.

State today: only `main.ts`, `app.module.ts` and `monitoring/health.*` exist — every capability directory is an empty skeleton. The first capability implemented becomes the golden path for the rest; build it carefully and point to it from here once it exists.

## Dependency rule (inviolable)

- `Controller → Service → Port (abstract) ← Adapter`. Controllers never import an adapter; services depend only on `application/ports/*.port.ts`, injected by token.
- `domain/` has **zero** external dependencies — no `@nestjs/*`, no `mongoose`, no HTTP client. Pure TypeScript.
- Controllers contain no logic: one service call, then shape the response. Validation via `ValidationPipe` + DTOs; auth/roles via Guards in `shared/`.
- External integrations (watsonx.ai via `CvAnalysisPort`, COS, email via `EmailSenderPort` + SMTP adapter, Slack) are always an outbound Port + Adapter — a service must never know which vendor is behind it.
- Entities shared with the frontend (`User`, `Candidate`, `Process`, `Interview`, `Feedback`, `Report`, …) are imported directly from `@ibm-talent-bridge/shared-types` — never redefined in `domain/interfaces/`. That directory holds only value objects **local** to the capability, not part of the cross-app contract. New types in `shared-types` follow the same `I`/`T`/`E` prefix rule as the rest of the code (`global-engineering.md`); the legacy unprefixed ones are migrated incrementally, not renamed in bulk. `shared-types` stays **types only** (`import type`): the production image does not resolve the alias at runtime, so enum value arrays (e.g. `USER_ROLES`) live locally in the backend, typed against the shared type.
- **Consistency across capabilities (e.g. keeping `Candidate.processIds` in sync with `Process.candidateIds`) is a same-process, in-memory call from one capability's service to another's application service** (normal Nest DI across modules) — never a port+adapter reaching into another capability's Mongoose model, and never a multi-document Mongo transaction (the dev/CI Mongo in `docker-compose.yml` is a standalone instance, no replica set — transactions would fail at runtime). A failed second write must be logged and re-thrown as a typed exception, never swallowed. See ADR-013 for the full reasoning — this is the general pattern for every future cross-capability consistency need, not a one-off.

## REST

Plural resources (`/candidates`, `/processes`), standard verbs/status codes, filtering via query params, max 1 level of nesting (`/processes/:id/candidates` ok, deeper not). Document endpoints with `@nestjs/swagger` decorators on the controller (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) — Swagger at `/api/docs`. Never in `domain/` (see `dto-validation.md`).

## MongoDB (Mongoose)

- `timestamps: true` on every schema; Mongoose schemas live in `infrastructure/adapters/`, never in `domain/`.
- Every `@Prop` on a field typed as a TS union (`UserRole`, a process stage, a feedback recommendation, `shared-types` unions) needs an explicit `@Prop({ type: String, ... })`: Mongoose cannot infer a union and the process crashes at startup with `CannotDetermineTypeError`. Unit and e2e tests with fakes do not catch it — only booting the real process does.
- `candidate.email` unique index; index `processId` on interviews and feedback.
- Always paginate (`skip`/`limit` with a capped default) — never an unbounded `find()`.
- Adapters map Mongoose documents → domain interfaces before returning; a `Document` type never leaves the adapter.

## Logging

NestJS `Logger` only (`new Logger(ClassName.name)`), never `console.*`. Log ids and outcomes, never request bodies, tokens, OTP codes or PII.

Only exception: FlowLog (`shared/observability/`, `@TraceFlow()`), a debugging aid that prints request/adapter/response flow. It runs only with `FLOW_LOG_ENABLED=true` exact and never when `NODE_ENV=production`, redacts secrets (tokens, passwords, OTP, auth headers) and deliberately shows PII such as emails and names. Use `@TraceFlow()` only on public port methods, never on controllers or private helpers.
