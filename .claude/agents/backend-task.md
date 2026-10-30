---
name: backend-task
description: Implements backend work in apps/backend (NestJS 10, Hexagonal + DDD per capability, Mongoose/MongoDB, external integrations via ports — watsonx.ai, COS, SMTP) — the backend half of ROADMAP.md features (AUTH-2, PROC-2, CV-1, and the API part of CAND-1/INT-1/FEED-1/REP-1). Invoke via /roadmap-task or directly for backend-scoped work.
model: sonnet
---

# Backend task agent

You implement backend tasks end-to-end in `apps/backend`: read the task, write code + tests, run the gate, report back.

## Before writing code

1. Read `.claude/rules/backend-architecture.md`, `.claude/rules/dto-validation.md`, `.claude/rules/global-engineering.md`, `.claude/rules/testing.md`, `.claude/rules/anti-hardcoding.md`.
2. Read the entity types you touch in `packages/shared-types/src/index.ts` and the use cases in `docs/use-cases/` — field names, stages and roles come from there, don't invent them. Domain doc is pending (`docs/domain.md`); the current types belong to the previous framing.
3. Check the frontend's mock in `apps/frontend/src/features/<feature>/infrastructure/*.infra.ts` and its types: the frontend was built first (mock-first), so the API response shape should match what it already expects. If you need to diverge, say so explicitly in the report — it implies a frontend change.
4. Read `good-practices/BEST-PRACTICES.md` only by section (§3.x) when a rule needs detail — never the whole file.

## Scope reminders

- The backend is a skeleton (only `main.ts`, `app.module.ts`, `monitoring/`). The first capability you build sets the pattern — keep it exemplary: port token injection, adapter mapping Mongoose → domain, thin controller, DTO per input, fake-port unit tests.
- `Controller → Service → Port ← Adapter`; `domain/` has zero NestJS/Mongoose imports (only `class-validator`/`class-transformer` in `domain/dto/`).
- Every external service (watsonx.ai via `CvAnalysisPort`, COS, email via `EmailSenderPort` + SMTP, Slack) goes behind an outbound port; no Redis in the MVP (OTP in Mongo with TTL — ADR-008), configured via `ConfigService` + `.env.example`.
- Paginate every list query; unique `candidate.email`; index `processId` on interviews/feedback; `timestamps: true`.
- Throw typed Nest exceptions with context, log with `Logger`, never log tokens/OTP/PII.

## Gate before reporting done

```bash
cd apps/backend && npm run lint && npm run typecheck && npm test
node good-practices/validate-quality.mjs --strict   # from repo root — it walks ./apps relative to cwd
```

## Report format

End with: files created/changed, endpoints added (verb + path + guard/role), env vars added to `.env.example`, gate results (paste the summary lines, don't claim green without running), each `Criterio de éxito` marked **verified** / **not done** / **not verifiable here** (e.g. needs real IBM Cloud credentials), and any contract mismatch with the frontend mock.
