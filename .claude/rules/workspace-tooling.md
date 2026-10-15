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
- `packages/shared-types` is **consumed by the frontend** via the alias `@ibm-talent-bridge/shared-types` (tsconfig `paths` + Vite/Vitest alias → `../../packages/shared-types/src/index.ts`, no build step, no `file:` dependency). `shared-utils` and `email-templates` are still **not consumed by any app**. Backend wiring of `shared-types` is deferred to `PROC-2`: the backend Docker build context is `apps/backend` only (no sibling `packages/` to copy in) and `tsc`'s compiled output layout would shift if a cross-package import were added now — revisit then. Wiring a new package into an app (tsconfig `paths` + alias, or a `file:` dependency) is a deliberate decision — ask before doing it implicitly.
- A new dependency: install it in the app that uses it, justify it in the summary (Etapa 1 precedent: `@hookform/resolvers`), and prefer what's already installed (React Query, Zustand, zod, react-hook-form, Carbon).
- CI lives in `.github/workflows/{backend,frontend}-ci.yml`, path-filtered per app, Node 22 (Node 20 is EOL), `npm ci`. `frontend-ci.yml` also runs `good-practices/validate-quality.mjs` (informational, `continue-on-error: true`, becomes `--strict`-blocking once Etapa 2 closes DT-002). Keep scripts in `package.json` and CI steps in sync — if you add a script CI should run, add the step too.
- Docker/Podman: `docker-compose.yml` (full stack), `docker-compose.test.yml` (test infra). Credentials always via `.env`, never inline defaults.
