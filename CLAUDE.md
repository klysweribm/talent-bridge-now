# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

IBM Talent Bridge — internal MVP for IBM Consulting LatAm that centralizes recruitment coordination: recruiters, technical referents and PMs run selection processes end-to-end (creation → interviews → feedback → client reports). Candidates have no login; recruiters email them manually.

Sources of truth — read **by section**, never whole, unless the task is about the doc itself:

- `PROJECT_CONTEXT.md` — domain (roles, stages, data models), stack, env vars, design system tokens and screens.
- `good-practices/BEST-PRACTICES.md` — conventions in long form with examples (§2 frontend, §2.7 cross-cutting, §3 backend, §4.bis Stitch mockups).
- `.clinerules` — same rules for the other agent (Bob). Keep it consistent with `.claude/rules/` when a rule changes.

## Monorepo layout

```
apps/backend/    NestJS 10 · Hexagonal + DDD, vertical slice per capability (skeleton: only main/app.module/monitoring exist)
apps/frontend/   React 18 + Vite · Feature Slices + Atomic Design · React Query + Zustand · Carbon + Tailwind
packages/shared-types | shared-utils | email-templates   (not wired into any app yet)
DESIGN/          Stitch mockups — visual reference only, never copied as code
```

No root `package.json` and no workspace tool: each app/package is an independent npm project. Run commands from inside its directory.

## Commands

```bash
# apps/backend
npm run start:dev | build | typecheck | lint | test | test:cov | test:e2e
npx jest path/to/file.spec.ts                 # single test (jest rootDir = src)

# apps/frontend
npm run dev | build | typecheck | lint        # dev → localhost:5174
npm test -- --run                             # vitest (plain `npm test` = watch mode)
npx vitest run path/to/file.test.tsx          # single test

# repo root
node good-practices/validate-quality.mjs --strict   # line-limit gate (must run from root)
cp .env.example .env && podman-compose up -d        # full stack; or: podman-compose up -d mongodb (+ apps locally)
```

Services: frontend `:5174`, API `:3000/api/v1`, Swagger `:3000/api/docs`, MongoDB `:27017`. Demo users: `ana@`/`carlos@`/`mariana@ibm.com`.

## Architecture invariants (detail in the path-scoped rules below)

- **Backend:** `Controller → Service → Port ← Adapter`. `domain/` imports nothing from NestJS/Mongoose (only `class-validator`/`class-transformer` in `domain/dto/`). Every external service (watsonx.ai, COS, SMTP email, Slack) sits behind a port. Target cloud: IBM Code Engine `br-sao`, no Redis (`docs/architecture/README.md` ADR-006…012).
- **Frontend:** `Page → Organism → Molecule → Atom`; only organisms/pages call React Query or Zustand. React Query = server state, Zustand = client-only state, never mixed or mirrored. HTTP only in `features/<f>/infrastructure/*.infra.ts`, mock-first until the backend exists.
- **Line limits** are hard: one numeric source of truth, `LIMITS` in `good-practices/validate-quality.mjs`. Over the limit = missing abstraction; unavoidable debt goes to `good-practices/DEBT_TECH.md` with an ID before commit.

## Rules (`.claude/rules/`, auto-loaded by `paths:` when a matching file is read/edited)

| Paths | File | Covers |
| --- | --- | --- |
| `apps/**/*.{ts,tsx}`, `packages/**/*.ts` | `global-engineering.md` | No `any`, `readonly`, `I`/`T`/`E` type prefixes, errors, logging, SRP |
| `apps/frontend/src/**` | `frontend-architecture.md` | Slices, atomic tiers, data-flow boundary, state split, mock-first, design tokens |
| `apps/backend/src/**` | `backend-architecture.md` | Hexagonal layers, REST, Mongo, logging |
| `apps/backend/src/**/domain/dto/**` | `dto-validation.md` | class-validator DTOs, no Swagger decorators in domain |
| `**/*.test.{ts,tsx}`, `**/*.spec.ts` | `testing.md` | Vitest/RTL (frontend), Jest + fake ports (backend), Gherkin → TDD |
| `apps/backend/src/**`, `apps/frontend/src/**` | `anti-hardcoding.md` | Env vars, `ConfigService`, `VITE_*`, tokens, enums |
| `**/package.json`, compose, workflows, tsconfig | `workspace-tooling.md` | Independent npm projects, deps, CI |

## Work tracking

- **`ROADMAP.md`** (root) — product backlog per feature (`FE-OTP-1`, `AUTH-2`, `PROC-2`, `CAND-1`…), with "Orden de implementación", per-feature Criterios de éxito and a Historial. Every new feature idea goes here.
- **Remediation plan** — stage-by-stage frontend refactor (`Etapa 0-8`), in `~/.claude/plans/breezy-moseying-plum.md`.
- **`good-practices/DEBT_TECH.md`** — line-limit/architecture debt (not features).

Start a task with `/roadmap-task <ID | "Etapa N" | next>`: it delegates to the matching sub-agent (`.claude/agents/`), which reads only its own domain's rules, and reconciles `ROADMAP.md` at the end. Use `/update-roadmap` only for work that didn't go through `/roadmap-task`.

| Target | Sub-agent |
| --- | --- |
| `Etapa 0-7`, `FE-*` | `frontend-task` |
| `AUTH-*`, `PROC-*`, `CV-*` | `backend-task` |
| `CAND-1`, `INT-1`, `FEED-1`, `REP-1` | `frontend-task` then `backend-task` (sequential, frontend first) |
| `Etapa 8`, `HARDEN-*`, `DEPLOY-*` | `config-task` |

## Conventions not covered by a path rule

- Commits: Conventional Commits (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`, `build`), one logical change per commit.
- **Gherkin → TDD:** a task specified as Gherkin (`Feature`/`Scenario`/`Given`/`When`/`Then`) requires plan mode first, then each Scenario written as a failing test before any implementation.
- A decision with several valid options (new dependency, wiring `packages/*`, deploy target, a deviation from the plan) → ask, don't pick silently.

## Definition of done

- `lint`, `typecheck` and tests green in every app touched (paste the summary, don't claim it), and `validate-quality.mjs --strict` doesn't add critical violations.
- New code has tests (every new component tier, every new service via fake ports); new backend input has a DTO.
- No layer-skipping, no state mixing, no silent `catch {}`, no hardcoded config.
- `ROADMAP.md` / `DEBT_TECH.md` updated if the task moved a criterion or created/resolved debt.

## Context & session workflow

See `.claude/memory/context-engineering-guide.md`. `/context-health` (read-only) recommends when to hand off; `/generate-relevant-report` writes a handoff into the block below; `/import-relevant-report` (start of a new session) reads and clears it.

## Agentic architecture (sub-agents)

See `.claude/memory/agentic-architecture.md` for the hub-and-spoke model (main session = coordinator, `.claude/agents/*.md` = spokes), concurrency/per-task limits (≤2 concurrent, ≤4 per task — not yet hook-enforced), and the per-agent `model:` convention.

<!-- BEGIN TEMPORARY_SESSION_MEMORY -->
Status: pending
GeneratedAt: 2026-10-16T00:00:00Z

## Objective
- Validate UX design and target IBM Cloud architecture; resolved a real Feedback-access contradiction found during role-separation review, which led to completing the domain model and persistence design.

## Key Decisions
- Role separation confirmed: Feedback form (`/feedback`) stays `technical_ref`-only (write); `recruiter`/`pm` read saved results from process detail, never the same form — resolves a real conflict between `navigation.ts`, `ROADMAP.md`, and `docs/flows/README.md`.
- Backend paradigm stays Hexagonal+DDD+MongoDB (user explicitly declined reopening it) — the real work was embed-vs-reference, not relational normalization.
- `Process.technicalRefs` embeds `{userId, roleInProcess: 'principal'|'validador'}` (was flat `technicalRefIds`); `StageHistoryEntry` gained `status`; new `Report`/`ReportSendEvent` entities; `Feedback.visibleTo` removed (static authz rule, not persisted data) — unique index on `interviewId` enforces 1:1 at DB level instead.
- Cross-aggregate consistency (`Candidate.processIds` ↔ `Process.candidateIds`): in-memory service-to-service call, never a cross-capability adapter nor a Mongo transaction (dev/CI Mongo is standalone, no replica set) — documented as the general pattern for future capability pairs too.
- IBM Cloud target: everything on Code Engine (frontend+backend, Render dropped), region `br-sao`, no Redis in MVP (OTP via Mongo TTL), watsonx.ai replaces Watson NLU, email via `EmailSenderPort`+SMTP (Event Notifications dropped) — all in ADR-006..013, `docs/architecture/README.md`.
- UX: single app shell + 5-item nav (Inicio/Procesos/Entrevistas/Feedback/Reportes), minimal action-oriented dashboard — `docs/design/UX-GUIDELINES.md` is now the UX source of truth, mockups are visual reference only.

## Current State
- Done & verified (gates re-run independently, not just trusted from subagent reports): `shared-types` updated and typechecks; backend now imports it (Docker context moved to repo root, tsconfig/Jest aliases added); frontend nav trimmed to 5 items (142 tests passing); backend lint/typecheck/5 tests/build/e2e all green; `validate-quality --strict` = 1 pre-existing critical (DashboardPage, Etapa 2 scope, unrelated).
- Done: ADR-013 written; `ROADMAP.md`, `docs/flows/README.md`, `PROJECT_CONTEXT.md`, `.clinerules`, `.claude/rules/backend-architecture.md`, `good-practices/BEST-PRACTICES.md` synced with the new model and the Feedback resolution.
- 6 commits made this session (local only, not pushed) across Claude config migration, QW-1 (frontend/backend/config), UX+architecture docs, and the domain model.
- Untested/in progress: no browser walkthrough was done after the nav trim (QW-1's "F5 + 3 roles + no 404" criterion is covered by `AppRouter.test.tsx` but not manually re-verified post-trim).
- Not started: PROC-2 and the deeper per-role (technical_ref/pm) use-case definition the user asked to validate next — session ended on an open choice between the two, never answered.

## Open Risks
- **User explicitly asked for a hard cap on parallel/total subagents** after a `429 Too many requests` killed one background agent mid-run (recovered via resume + independent gate re-verification, no data lost, but it's an unresolved process gap). Agreed approach, not yet implemented: a `PreToolUse` hook on the `Agent` tool with a session-keyed counter file (concurrency cap ~2, per-task cap ~4) — a `.claude/rules/*.md` policy alone cannot enforce this, only a hook can.
- Related: user wants an explicit hub-and-spoke agentic-architecture doc for this project (coordinator = main session, capped spokes) and wants `model:` pinned per sub-agent definition (`.claude/agents/*.md` currently has no `model:` field — all inherit the session's model). Neither change has been made yet.
- `CLAUDE.md`'s own "Monorepo layout" section still says `packages/shared-types | shared-utils | email-templates (not wired into any app yet)` — now stale for `shared-types` (frontend already had it, backend was wired this session). Outside this report's edit scope (restriction: don't touch anything outside the delimiters) — flag for the importing session to fix in the same pass as its first `CLAUDE.md` edit.
- Several domain-model decisions were deliberately left open in ADR-013/ROADMAP rather than resolved now (by design, not oversight) — don't re-derive them, just read ADR-013 directly: `User.specialty` taxonomy (free text vs. controlled vocabulary, PROC-2), `ReportSendEvent.sentTo` cardinality (REP-1), partial-failure handling for the Candidate↔Process sync (PROC-2/CAND-1).
- `/context-health` rated this session HIGH risk right before this report was requested — several loosely-related phases stacked in one long session (Claude config migration → QW-1 → UX/architecture → domain model). Don't assume deep recall of early-session specifics (e.g. exact QW-1 file lists); re-read source files rather than trust a compressed memory of them.

## Next Steps
1. Ask the user to choose: continue the Referente/PM use-case review, or start PROC-2 (session ended on this exact open question, unanswered).
2. Implement the agent-concurrency-limit hook (`PreToolUse` on `Agent` tool, session-keyed counter, deny via `permissionDecision: "deny"` or exit 2) via the `update-config` skill — don't skip this, it's the user's explicit ask from this session's last exchange.
3. Write `.claude/rules/agentic-architecture.md` codifying the hub-and-spoke model already in practice (main session = coordinator; `Explore`/`Plan`/`frontend-task`/`backend-task`/`config-task` = spokes) with the agreed caps (≤2 concurrent, ≤4 per task).
4. Pin `model: sonnet` in `.claude/agents/{frontend-task,backend-task,config-task}.md` frontmatter (currently unset, inheriting the session's model) — leave `opus` as a per-call override for `Plan`-type architecture work only.
5. Manually re-verify in a browser (not just tests) that the trimmed nav + persisted session work end-to-end: login as all 3 demo users, confirm F5 keeps the session, confirm no sidebar/dashboard link 404s.
6. If starting PROC-2: it's the backend golden-path capability — build it against the now-complete domain model (ADR-013), using `backend-task`.

## Files Touched
- `packages/shared-types/src/index.ts` — domain model rewrite (ADR-013): `ProcessTechnicalRef`, `StageStatus`, `InterviewRescheduleEvent`, `Report`/`ReportSendEvent`, `User.specialty`; removed `Feedback.visibleTo`; renamed `WatsonNLUResult`→`CvAnalysisResult`.
- `docs/architecture/README.md` — ADR-013 (domain model) + ADR-006..012 (IBM Cloud target: Code Engine/br-sao/no-Redis/watsonx.ai/SMTP) + Mermaid C1/C2/deployment diagrams replacing the wrong-product C4.
- `docs/design/UX-GUIDELINES.md` (new) — single source of truth for MVP UX; supersedes mockups where they conflict.
- `ROADMAP.md` — QW-1/AUTH-1 added and reordered ahead of FE-OTP-1; PROC-2/INT-1/FEED-1/REP-1 sections updated with ADR-013 model notes and open questions; Historial rows added.
- `apps/frontend/src/shared/config/navigation.ts` + `AppRouter.tsx`/`.test.tsx` — nav trimmed to 5 MVP items, role table corrected (feedback mismatch fixed).
- `apps/backend/{Dockerfile,tsconfig.json,package.json,test/jest-e2e.json}`, `.github/workflows/backend-ci.yml` — repo-root Docker build context + `@ibm-talent-bridge/shared-types` alias wiring (unit + e2e Jest).
- `apps/backend/src/app.module.ts`, `apps/backend/.eslintrc.cjs`, `apps/backend/src/monitoring/**` — Mongoose/helmet/throttler wired, hexagonal health check with DB-status port.
- `apps/frontend/Dockerfile`, `apps/frontend/nginx.conf` — production image for Code Engine (SPA + `/api` proxy).
- `PROJECT_CONTEXT.md`, `docs/flows/README.md`, `.clinerules`, `.claude/rules/backend-architecture.md`, `good-practices/BEST-PRACTICES.md` — synced with the Feedback-access resolution and the new domain model.
- `.claude/rules/*.md`, `.claude/agents/*.md`, `.claude/skills/*` (new, this session) — the Claude Code config migrated and adapted from another project at session start.
- +15 more (see git log — 6 commits this session, `git diff HEAD~6` for full scope)
<!-- END TEMPORARY_SESSION_MEMORY -->

## Estado actual / próximo paso

> Se **reemplaza** al cerrar cada etapa (lo hace `/update-roadmap`); el historial vive en `ROADMAP.md` → Historial y `DEBT_TECH.md` → Resueltos.

- **Cerradas:** Etapa 0 y Etapa 1 (golden path en `features/auth/`).
- **QW-1 casi cerrado (2026-10-15):** gates, demo robusta y fundaciones implementados (frontend 143 tests, backend 5 tests, `validate-quality --strict` = 1 crítico, DT-002). Falta el recorrido en navegador (F5, roles `ana@`/`carlos@`/`mariana@ibm.com`, sin 404) y el health contra un Mongo real — ver `ROADMAP.md` → QW-1.
- **Orden acordado para la demo al sponsor** (vertical real con backend, flujo de negocio primero): Etapa 2 (dashboard, cierra DT-002/DT-007 y deja verde el lint de CI) → Etapa 3 (wizard + detalle) → AUTH-1 (dev-login JWT) → PROC-2 (incluye conectar `shared-types` al backend) → FE-OTP-1. Plan: `~/.claude/plans/realiza-una-validaci-n-del-polished-reddy.md`.
