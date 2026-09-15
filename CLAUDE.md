# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

IBM Talent Bridge — an internal MVP for IBM Consulting LatAm that centralizes recruitment coordination: recruiters, technical referents, and PMs manage selection processes end-to-end (creation → interviews → feedback → client reports). Candidates have no login in the MVP; recruiters email them manually.

Read `PROJECT_CONTEXT.md` first for full domain context (roles, data models, selection stages, design tokens, env vars) — it's the source of truth and is kept current. `.clinerules` has the same non-negotiable architecture rules in enforcement form; both files should be treated as binding, not just background reading.

## Monorepo layout

```
apps/backend/    NestJS, Hexagonal + DDD + vertical slice ("capabilities")
apps/frontend/   React + Vite + TypeScript, Feature Slices + Atomic Design
packages/shared-types/    Shared TS interfaces
packages/shared-utils/    Pure helper functions (formatters, validators)
packages/email-templates/ Plain-HTML email templates (no scripts — must render in corporate mail clients)
```

There is no root `package.json` / workspace tool — `apps/backend`, `apps/frontend`, and each `packages/*` are independent npm projects. Run commands from inside each directory.

## Commands

### Backend (`apps/backend`)
```bash
npm run start:dev      # nest start --watch
npm run build          # nest build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint --fix
npm test               # jest (unit)
npm run test:watch
npm run test:cov
npm run test:e2e       # jest --config ./test/jest-e2e.json
```
Run a single backend test: `npx jest path/to/file.spec.ts` (jest rootDir is `src`, pattern `*.spec.ts`). Path aliases: `@capabilities/*` → `src/capabilities/*`, `@shared/*` → `src/shared/*`.

### Frontend (`apps/frontend`)
```bash
npm run dev             # vite dev server (localhost:5173)
npm run build           # tsc -b && vite build
npm run typecheck       # tsc --noEmit
npm run lint            # eslint . --ext ts,tsx --max-warnings 0
npm test                # vitest
npm run test:coverage   # vitest run --coverage
```
Run a single frontend test: `npx vitest run path/to/file.test.ts`.

### Full stack (Docker/Podman)
```bash
cp .env.example .env   # fill in IBM Cloud credentials first
docker-compose up -d           # or: podman-compose up -d
podman-compose up -d mongodb redis   # infra only, dev backend/frontend locally
```
Services: frontend `:5173`, backend `:3000`, Swagger `:3000/api/docs`, MongoDB `:27017`, Redis `:6379`.

## Backend architecture (Hexagonal + DDD, vertical slice per capability)

Capabilities live under `src/capabilities/<name>/` — `auth`, `candidates`, `processes`, `interviews`, `feedback`, `reports`, `notifications`, `cv-analysis`. Each one is a self-contained bounded context:

```
<capability>/
├── application/
│   ├── ports/       # interfaces for inbound/outbound dependencies
│   └── services/    # use cases, orchestrate domain logic
├── domain/
│   ├── dto/          # class-validator DTOs
│   └── interfaces/   # domain contracts, value objects, entities
└── infrastructure/
    ├── adapters/     # implement outbound ports (DB, HTTP, queues)
    └── controllers/  # thin REST entry points, map HTTP → use case only
```

**Layer rules (non-negotiable):** Controllers call only Application Services, never domain directly. Services inject Ports, never Adapters. Adapters implement Port interfaces (dependency inversion). Domain has **zero** external dependencies — no NestJS, no Mongoose, pure TypeScript.

**File-size hard limits** (enforced convention, not lint-configured): Controller 55 lines, Service 80, Port 50, Adapter 100, DTO 45, Module 60, Worker 100. A file that violates its limit signals a missing abstraction, not a formatting nitpick.

**Conventions:** kebab-case filenames with mandatory suffixes (`.controller.ts`, `.service.ts`, `.port.ts`, `.adapter.ts`, `.dto.ts`, `.module.ts`); never `any` (use `unknown` + type guards); `readonly` on interface props; type prefixes on new code — `interface` → `I`, `type` → `T`, `enum` → `E` (see `good-practices/BEST-PRACTICES.md` §2.7); no silent `try {} catch {}`; NestJS `Logger` only, never log passwords/tokens/full PII; REST endpoints plural (`/candidates`), filtering via query params, max 1 level of route nesting.

**MongoDB (Mongoose):** `timestamps: true` on every schema; `candidate.email` must be unique; index `processId` on interviews and feedback; always paginate with skip/limit, never unbounded queries.

## Frontend architecture (Feature Slices + Atomic Design)

Each business domain is a slice under `src/features/<name>/` (`auth`, `candidates`, `processes`, `interviews`, `feedback`, `reports`), and components inside a slice follow atom → molecule → organism → page:

```
features/<feature>/
├── components/{atoms,molecules,organisms,pages}/
├── hooks/            # one hook per domain operation
├── infrastructure/   # pure HTTP functions — no hooks, no JSX
├── services/
├── store/            # Zustand, per-feature client state only
└── types/            # extend packages/shared-types

shared/{components/{atoms,molecules,organisms},hooks,layouts,store,utils}/
router/    # React Router + role guards
config/    # env vars, constants
```

A component/hook used in exactly one feature stays in that feature; used in 2+ features, it moves to `shared/`.

**Line limits:** Atom 50, Molecule 90, Organism 100, Page 90, Hook 60, Infrastructure fn 50, Zustand store 50.

**State — two non-overlapping domains, never mixed:**
- **React Query** owns anything that comes from a GET (server state): fetching, cache, invalidation, mutations with `POST/PATCH/DELETE`.
- **Zustand** owns only client-generated state that never comes from a GET: JWT/role/profile after login, active step of a multi-step wizard before final submit, UI preferences (sidebar collapsed, theme). Use many small per-domain stores (e.g. `features/auth/store/auth.store.ts`, `features/processes/store/wizard.store.ts`), not one global store.
- Never duplicate the same data in both stores, never copy React Query data into Zustand or `useState`, never call the API from `useEffect`.

**Data-flow / store-access boundary:**
```
Page (routing, orchestration) → Organism (only layer allowed to call useQuery/useStore)
  → Molecule (props only) → Atom (props only, purely presentational)
```
Molecules and atoms must never import a data hook directly — only Organisms and Pages touch stores/React Query, so a store change only ripples through the organism layer.

**Conventions:** never `any`; `readonly` interface props; type prefixes on new code — `interface` → `I`, `type` → `T`, `enum` → `E` (see `good-practices/BEST-PRACTICES.md` §2.7); `PascalCase.tsx` components, `useCamelCase.ts` hooks, `camelCase.infra.ts` infrastructure, `camelCase.store.ts` stores; HTTP calls only in `infrastructure/`, never in hooks or components directly; prefer `.map/.filter/.reduce` over imperative loops.

**Design system:** Carbon Design System (IBM) + Tailwind utility classes mapped from custom tokens in `apps/frontend/tailwind.config.ts`; font is IBM Plex Sans, icons are Material Symbols Outlined. Full color/spacing/typography token tables and reference mockup screens (login, recruiter dashboard, create-process wizard) are documented in the "Sistema de Diseño" section of `PROJECT_CONTEXT.md`; HTML reference designs live under `stitch_ibm_talent_bridge_portal/`.

## Before considering a task done

- No file exceeds its line limit for its layer/atomic-design tier.
- Backend `domain/` imports nothing from NestJS or Mongoose.
- Controllers → Services → Ports only (no layer-skipping).
- New frontend components sit in the correct atomic tier and feature/shared location.
- Server state is in React Query, client state in Zustand — never mixed.
- `tsc --noEmit` passes in whichever app/package you touched.
- New backend logic has a `class-validator` DTO; new code has matching tests (Jest/Vitest).
- No silent `catch {}`; backend errors use `Logger` + a typed NestJS exception.

## Estado actual / próximo paso

> Esta sección se **reemplaza** al cerrar cada etapa — no se acumula. Es el punto de retoma para una sesión nueva; no repite lo que ya está en `PROJECT_CONTEXT.md`/`.clinerules`.

- **Plan vigente**: remediación frontend por etapas, aprobado y en ejecución. Plan completo en `~/.claude/plans/breezy-moseying-plum.md` (leer si se necesita el detalle etapa por etapa).
- **Principio transversal**: los mockups en `DESIGN/` (generados por "Stitch") son solo guía visual — nunca se copian literal. Todo HTML de ahí pasa primero por componentización (Atomic Design) y tokens de Tailwind. Ver `good-practices/BEST-PRACTICES.md` §4.bis y `good-practices/examples/frontend/`.
- **Etapa 0 (fundaciones de calidad) — CERRADA**: `validate-quality.mjs` y `.eslintrc-quality.js` corregidos para apuntar a rutas reales; `apps/frontend/.eslintrc.cjs` creado (el frontend no tenía config de lint); `tsconfig.eslint.json` nuevo para que el lint type-aware cubra tests/configs sin tocar el `tsconfig.json` de build; `@types/node` instalado; `good-practices/examples/frontend/` creado; `STAGE_CHIP_STYLES` corregido; guard por rol real en `AppRouter`; `services/` → `infrastructure/` en las 6 features; `good-practices/DEBT_TECH.md` reescrito con la deuda real de este proyecto (antes documentaba otra app). Gate verificado: lint/typecheck/tests en verde (84/84 tests), `validate-quality.mjs --strict` reporta 6 críticos ya trazados en `DEBT_TECH.md`.
- **Etapa 1 (refactor de `auth`) — CERRADA**: `LoginPage.tsx` (402 líneas, DT-001) descompuesto en `features/auth/components/{atoms,molecules,organisms}` siguiendo el golden path de `good-practices/examples/frontend/` — `LoginPage.tsx` queda en 12 líneas de composición pura. Validación migrada a `react-hook-form`+`zod` (`useLoginForm.ts`); login simulado movido a `features/auth/infrastructure/auth.infra.ts` (mock-first, consumido vía `useMutation`). Se agregó `@hookform/resolvers` como dependencia nueva (faltaba para `zodResolver`). Tests nuevos por cada atom/molecule/organism + `LoginPage.test.tsx`/`LoginForm.test.tsx` cubriendo el flujo completo (97/97 tests en verde). Gate verificado: lint/typecheck/tests en verde, `validate-quality.mjs --strict` pasa de 6 a 5 críticos (DT-001 movido a Resueltos en `DEBT_TECH.md`).
- **Próximo paso — Etapa 2**: refactorizar `apps/frontend/src/features/processes/components/pages/DashboardPage.tsx` (291 líneas, DT-002 en `DEBT_TECH.md`) en organisms (`DashboardHeader`, `KpiSection` reutilizando `KpiCard`, `ActiveProcessesList`, `UpcomingInterviewsList` reutilizando `InterviewCard`), mover `MOCK_KPI`/`MOCK_PROCESSES`/`MOCK_INTERVIEWS` a `infrastructure/` + hooks de React Query, agregar organism `AppHeader`/TopBar en `shared/components/organisms/`, y dividir `SidebarNav.tsx` (DT-007) en `NavList`/`UserProfileCard`/`SupportFooter`. Detalle completo en la Etapa 2 de `~/.claude/plans/breezy-moseying-plum.md`.
- **Deuda pendiente sin etapa fija todavía**: 4 atoms compartidos sobre línea (`Icon` 89/50, `InputField` 77/50, `Avatar` 64/50, `Button` 64/50, DT-003 a DT-006) — asignados tentativamente a Etapa 1-2 en `DEBT_TECH.md`, no se tocaron en Etapa 1 (se reusaron tal cual desde `LoginForm`); decidir al tocarlos si se resuelven en Etapa 2 o se les da su propio paso.
