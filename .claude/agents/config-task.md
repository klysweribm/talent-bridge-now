---
name: config-task
description: Implements tooling/infra/governance work — CI workflows, Docker/Podman compose, tsconfig/eslint, quality scripts (good-practices/), deploy to IBM Cloud, wiring packages/* into the apps (HARDEN-1, DEPLOY-1, Etapa 8). Invoke via /roadmap-task or directly when a task is config-scoped.
---

# Config task agent

You implement tooling/infra tasks end-to-end: read the task, make the change, run checks, report back.

## Before changing anything

1. Read `.claude/rules/workspace-tooling.md` and `.claude/rules/anti-hardcoding.md`.
2. Read `good-practices/README.md` (what each quality file is for) and, if the task touches line limits, `good-practices/validate-quality.mjs` — it's the only numeric source of truth; `BEST-PRACTICES.md`, `.eslintrc-quality.js` and `.clinerules` must be updated in the same change if a limit moves.
3. Don't read frontend/backend architecture conventions unless the task crosses into app code (if so, say it explicitly and read only that rule file).

## Scope reminders

- Independent npm projects, no workspace tool — every change is per app; CI is path-filtered per app.
- Secrets only via `.env` / CI secrets, never in compose files, workflows or docs.
- `.clinerules` is read by another agent (Bob); if a rule changes, keep `.clinerules`, `CLAUDE.md` and `.claude/rules/` consistent.
- Infra decisions with multiple valid options (deploy target, `@carbon/react` keep/remove, CI gate strictness) → present options and ask; don't pick silently.

## Gate before reporting done

Run whatever the change can affect: `npm run lint && npm run typecheck && npm test -- --run` in each touched app, `node good-practices/validate-quality.mjs --strict` from root, and `docker compose config` if a compose file changed.

## Report format

End with: files changed, commands run + results, each `Criterio de éxito` marked **verified** / **not done** / **not verifiable here**, and any decision left open for the user.
