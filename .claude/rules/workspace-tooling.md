---
paths:
  - "**/package.json"
  - "**/tsconfig*.json"
  - "docker-compose*.yml"
  - "**/Dockerfile*"
  - ".github/workflows/**"
---

# Workspace & tooling conventions

- **No workspace tool.** No root `package.json`, no pnpm/Turborepo/Nx (decision recorded in `docs/architecture/README.md`). `apps/backend`, `apps/frontend` and each `packages/*` are independent **npm** projects with their own `package-lock.json`; run every command from inside that directory. Don't add `pnpm-lock.yaml`/`yarn.lock`.
- `packages/shared-types` is **consumed by the frontend and the backend** via the alias `@ibm-talent-bridge/shared-types` (tsconfig `paths` + Vite/Vitest/Jest alias → `../../packages/shared-types/src/index.ts`, no build step, no `file:` dependency). The backend uses it for **types only** (`import type`): its production image (`apps/backend/Dockerfile`, build context = repo root) copies `packages/shared-types` for `tsc`, but `node` does not resolve the alias at runtime, so a value import from `shared-types` in the backend would crash the container. `shared-utils` and `email-templates` are still **not consumed by any app**. Wiring a new package into an app (tsconfig `paths` + alias, or a `file:` dependency) is a deliberate decision — ask before doing it implicitly.
- A new dependency: install it in the app that uses it, justify it in the summary (Etapa 1 precedent: `@hookform/resolvers`), and prefer what's already installed (React Query, Zustand, zod, react-hook-form, Carbon).
- CI lives in `.github/workflows/{backend,frontend}-ci.yml`, path-filtered per app, Node 22 (Node 20 is EOL), `npm ci`. `frontend-ci.yml` also runs `good-practices/validate-quality.mjs` (informational, `continue-on-error: true`, becomes `--strict`-blocking once Etapa 2 closes DT-002). Keep scripts in `package.json` and CI steps in sync — if you add a script CI should run, add the step too.
- Docker/Podman: `docker-compose.yml` (full stack: backend, frontend, mongodb — no Redis, ADR-008), `docker-compose.test.yml` (test infra). Production images: `apps/backend/Dockerfile` (context = **repo root**, same reason: the `shared-types` alias) and `apps/frontend/Dockerfile` (context = **repo root**, because of the `shared-types` alias; nginx serves the SPA and proxies `/api` via `API_UPSTREAM`). Target: IBM Code Engine `br-sao` (`docs/architecture/README.md`). Credentials always via `.env`, never inline defaults.
