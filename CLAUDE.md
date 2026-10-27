# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

IBM Talent Bridge — internal MVP for IBM Consulting LatAm that centralizes recruitment coordination: recruiters, technical referents and PMs run selection processes end-to-end (creation → interviews → feedback → client reports). Candidates have no login; recruiters email them manually.

Sources of truth — read **by section**, never whole, unless the task is about the doc itself:

- `PROJECT_CONTEXT.md` — domain (roles, stages, data models), stack, env vars, design system tokens and screens.
- `docs/use-cases/` — per-feature use cases by role (what each role can/can't do, edge cases, authz rules) — source of truth for `@Roles` guards and authz tests, more granular than `docs/flows/README.md`.
- `good-practices/BEST-PRACTICES.md` — conventions in long form with examples (§2 frontend, §2.7 cross-cutting, §3 backend, §4.bis Stitch mockups).
- `.clinerules` — same rules for the other agent (Bob). Keep it consistent with `.claude/rules/` when a rule changes.

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

- **`ROADMAP.md`** (root) — product backlog per feature (`FE-OTP-1`, `AUTH-2`, `PROC-2`, `CAND-1`…), with "Orden de implementación", per-feature Criterios de éxito and a Historial. Every new feature idea goes here.
- **Remediation plan** — stage-by-stage frontend refactor (`Etapa 0-8`), in `~/.claude/plans/breezy-moseying-plum.md`.
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
ImportedAt: 2026-10-27T16:56:33Z
<!-- END TEMPORARY_SESSION_MEMORY -->

## Estado actual / próximo paso

> Se **reemplaza** al cerrar cada etapa (lo hace `/update-roadmap`); el historial vive en `ROADMAP.md` → Historial y `DEBT_TECH.md` → Resueltos.

- **Cerradas:** Etapa 0 y Etapa 1 (golden path en `features/auth/`).
- **QW-1 casi cerrado (2026-10-15):** gates, demo robusta y fundaciones implementados (frontend 143 tests, backend 5 tests, `validate-quality --strict` = 1 crítico, DT-002). Falta el recorrido en navegador (F5, roles `ana@`/`carlos@`/`mariana@ibm.com`, sin 404) y el health contra un Mongo real — ver `ROADMAP.md` → QW-1.
- **`docs/use-cases/` creado (2026-10-18):** catálogo de casos de uso por rol/feature, enlazado desde `ROADMAP.md`. Discrepancia abierta señalada (no resuelta): PM tiene acceso de ruta a `/processes/new`/`:id` en `AppRouter.tsx` pero debería ser solo lectura — resolver al implementar PROC-2.
- **AUTH-1 backend cerrado y verificado en vivo (2026-10-18):** `capability/auth` + guards `JwtAuthGuard`/`RolesGuard`/`@Roles` reutilizables + seed idempotente de los 3 usuarios demo. Primer consumidor real de `@ibm-talent-bridge/shared-types` en el backend. Bug real encontrado y corregido durante la verificación independiente (no solo por los tests, que pasaban igual): `UserModel.role` necesitaba `@Prop({type: String, ...})` explícito o Mongoose crashea el proceso en runtime al no poder inferir el tipo desde una unión TS — aplica a cualquier futuro `@Prop` sobre un campo de tipo unión de `shared-types`. **Pendiente:** swap de `features/auth/infrastructure/auth.infra.ts` de mock a `httpClient` (es trabajo de `frontend-task`, no se tocó en este pase backend-only).
- **AUTH-1 cerrado en código (2026-10-24):** swap de `auth.infra.ts` a `POST /auth/dev-login` hecho; test de integración `apps/backend/test/auth.integration.e2e-spec.ts` contra Mongo real (backend 16 unit / 33 e2e, frontend 146 tests). Resueltos DT-008 (`dev-login` y seed fallan cerrado: requieren `AUTH_DEV_LOGIN_ENABLED=true` exacto y nunca corren con `NODE_ENV=production`) y DT-009 (`httpClient` limpia la sesión ante 401 con token activo). **Pendiente:** recorrido manual en navegador (DT-010) — hasta registrarlo no se da por 100 % cerrado. Deuda abierta de AUTH-1: DT-010 a DT-014 en `good-practices/DEBT_TECH.md`.
- **Hardening de sesión del frontend (2026-10-24):** resueltos DT-015 (caché de React Query vaciada al terminar/cambiar sesión), DT-016 (JWT vencido tras F5 → `/login` sin pintar contenido) y DT-017 (401 tardío ya no cierra una sesión nueva). Frontend 178 tests. **Regla para Etapa 2 / PROC-2:** todo `useQuery` debe vivir bajo el árbol de rutas protegido (`client.clear()` no re-consulta componentes que siguen montados) — ver `.claude/rules/frontend-architecture.md`. Los `*-task` no tienen `model:` fijado: con la sesión en Opus, el gateway rechaza al subagente con `E003`; pasar `model: sonnet` al lanzarlos hasta fijarlo en `.claude/agents/*.md`.
- **Limpieza de documentación legacy (2026-10-25):** lo obsoleto se movió a `legacy_docs/` (fuera de alcance, bloqueado por `deny`); ADR-004/009/013 quedan PENDIENTE DE REEMPLAZO (encuadre Bench First, aún sin ADR nuevos). Pendiente: alcance B (rediseño del dominio, casos de uso, ROADMAP, `shared-types`).
- **OBS-1 FlowLog cerrado en código (2026-10-27):** trazas request → adapters → response en la terminal del backend (`shared/observability/`), apagado por defecto (`FLOW_LOG_ENABLED=false`), nunca en producción. Uso, qué oculta y cómo trazar un adapter nuevo: `ROADMAP.md` → OBS-1. Backend 35 unit / 38 e2e. Deuda abierta: DT-020 (warnings de lint) y DT-021 (`NODE_ENV=production` en el Dockerfile). Pendiente OBS-2 (sección Mongo con flag propio).
- **QW-2 cerrado en código (2026-10-27):** env vars sin consumidor retiradas (`a1c5b96`); `POST /auth/logout` + colección `auth_events` con login y logout, TTL `AUTH_EVENT_RETENTION_DAYS`=90 (`1341f8a`); `useLogoutMutation` (`666fcf0`); idle timer 360 s + aviso 60 s por `VITE_IDLE_*` (`71cb074`). Verificado en vivo por curl + Mongo (3 usuarios, filas login/logout, índice TTL). Backend 39 unit / 41 e2e, frontend 202 tests, `validate-quality --strict` = 1 crítico (DT-002), lint backend 0 errores / 14 warnings. **Pendiente:** recorrido en navegador (aviso a 360 s, F5, 3 roles → cierra DT-010). Deuda nueva: DT-022 (e2e ensucian `auth_events`), DT-023 (`trust proxy`), DT-024 (`SidebarNav` 433 líneas). `AUTH-3` (cierra DT-018) y `AUTH-4` (cierra DT-019) siguen registrados sin código.
- **Git:** los commits `b9acfc4`, `95d4fcc`, `a4da541`, `55a87cf` y otros anteriores conservan `Co-Authored-By`; reescribirlos está pendiente (el comando `git filter-branch` fue bloqueado por permisos). Sin remote: `https://github.com/klysweribm/architecture-reviewer-app.git` no se ha añadido ni se ha hecho push; nunca `--force`; `~/.gitconfig` tiene `http.sslverify=false`; auth token vs SSH sin decidir.
- **Próximo paso:** decidir la reescritura de commits y el remote; recorrido en navegador de QW-2/AUTH-1 (DT-010). Después, el orden acordado: Etapa 2 (dashboard, cierra DT-002 y DT-007/DT-024) → Etapa 3 (wizard + detalle) → PROC-2 (incluye conectar `shared-types` al backend y extraer los mocks de `DashboardPage.tsx` a `processes.infra.ts`) → FE-OTP-1. Opcionales: OBS-2, DT-020. Los sub-agentes se lanzan de uno en uno y con `model: sonnet`. Plan: `~/.claude/plans/realiza-una-validaci-n-del-polished-reddy.md`.
