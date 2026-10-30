# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

IBM Talent Bridge — internal MVP for IBM Consulting LatAm that centralizes recruitment coordination: recruiters, technical referents and PMs run selection processes end-to-end (creation → interviews → feedback → client reports). Candidates have no login; recruiters email them manually.

Sources of truth — read **by section**, never whole, unless the task is about the doc itself:

- `PROJECT_CONTEXT.md` — only a pointer table to the owner of each topic (it no longer holds context). Domain: pending (`docs/domain.md`); entity and role types: `packages/shared-types`; stack and decisions: `docs/architecture/README.md`.
- `docs/use-cases/` — per-feature use cases by role (what each role can/can't do, edge cases, authz rules) — source of truth for `@Roles` guards and authz tests, more granular than `docs/flows/README.md`.
- `good-practices/BEST-PRACTICES.md` — conventions in long form with examples (§2 frontend, §2.7 cross-cutting, §3 backend, §4.bis Stitch mockups).
- `.clinerules` — pointer for the other agent (Bob) to this file and `.claude/rules/`; nothing to keep in sync.

## Out of scope

- **`legacy_docs/` está fuera de alcance: no leer, no citar, no usar para decisiones. Si una tarea parece requerirlo, preguntar al usuario.**

## Monorepo layout

```
apps/backend/    NestJS 10 · Hexagonal + DDD, vertical slice per capability (skeleton: only main/app.module/monitoring exist)
apps/frontend/   React 18 + Vite · Feature Slices + Atomic Design · React Query + Zustand · Carbon + Tailwind
packages/shared-types   wired into both apps (frontend since QW-1, backend since the shared-types wiring commit)
packages/shared-utils | email-templates   (not wired into any app yet)
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

- **`ROADMAP.md`** (root) — product backlog per feature, with status, priority, dependencies, per-feature Criterios de éxito and a Historial. Every new feature idea goes here.
- **Estado y próximo paso: `ROADMAP.md`.**
- **`good-practices/DEBT_TECH.md`** — line-limit/architecture debt (not features).

Start a task with `/roadmap-task <ID | "Etapa N" | next>`: it delegates to the matching sub-agent (`.claude/agents/`), which reads only its own domain's rules, and reconciles `ROADMAP.md` at the end. Use `/update-roadmap` only for work that didn't go through `/roadmap-task`.

| Target | Sub-agent |
| --- | --- |
| `Etapa 0-7`, `FE-*` | `frontend-task` |
| `AUTH-*`, `PROC-*`, `CV-*` | `backend-task` |
| `CAND-1`, `INT-1`, `FEED-1`, `REP-1` | `frontend-task` then `backend-task` (sequential, frontend first) |
| `QW-2` | `config-task` (env vars), `frontend-task` (idle timer), `backend-task` then `frontend-task` (logout), manual check (Mongo) |
| `AUTH-3`, `AUTH-4` | `backend-task` then `frontend-task` |
| `Etapa 8`, `HARDEN-*`, `DEPLOY-*` | `config-task` |

## Conventions not covered by a path rule

- Commits: Conventional Commits (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`, `build`), one logical change per commit.
- **Gherkin → TDD:** a task specified as Gherkin (`Feature`/`Scenario`/`Given`/`When`/`Then`) requires plan mode first, then each Scenario written as a failing test before any implementation.
- A decision with several valid options (new dependency, wiring `packages/*`, deploy target, a deviation from the plan) → ask, don't pick silently.
- Auto-memory stores preferences and lessons, never project facts. If a fact lives in the repo, the memory links to it and does not copy it.
- Sub-agents (`.claude/agents/*-task.md`) are launched one at a time and with `model: sonnet`: with the session on Opus the gateway rejects the sub-agent with `E003`.

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
Status: imported
ImportedAt: 2026-10-30T00:20:14Z
<!-- END TEMPORARY_SESSION_MEMORY -->
