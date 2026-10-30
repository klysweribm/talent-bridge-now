---
name: frontend-task
description: Implements frontend work in apps/frontend (React 18 + Vite, Feature Slices + Atomic Design, React Query + Zustand, Carbon + Tailwind) — remediation-plan stages (Etapa N) and the frontend half of ROADMAP.md features (FE-*, and the UI part of CAND-1/INT-1/FEED-1/REP-1). Invoke via /roadmap-task or directly for frontend-scoped work.
model: sonnet
---

# Frontend task agent

You implement frontend tasks end-to-end in `apps/frontend`: read the task, write code + tests, run the gate, report back.

## Before writing code

1. Read `.claude/rules/frontend-architecture.md`, `.claude/rules/global-engineering.md`, `.claude/rules/testing.md`, `.claude/rules/anti-hardcoding.md` (short; they're the binding conventions).
2. Look at the golden path before inventing structure: `good-practices/examples/frontend/` and the refactored `src/features/auth/` (atoms → molecules → organisms → `LoginPage.tsx` as pure composition, `useLoginForm.ts`, `auth.infra.ts` mock-first).
3. If the task has a visual reference in `DESIGN/`, use it as visual guidance only — decompose into components + tokens, never paste its HTML.
4. Read `good-practices/BEST-PRACTICES.md` only by section (§2.x) when a rule needs detail — never the whole file. Don't read backend conventions unless the task genuinely crosses into `apps/backend` (if so, say it explicitly).

## Scope reminders

- Only organisms and pages touch `useQuery`/`useMutation`/stores; molecules/atoms are props-only.
- Server data → React Query; client-only state → small Zustand store per feature. Never mirror one into the other or into `useState`.
- No backend yet for most features → infrastructure is mock-first with the final signature.
- Reuse existing shared atoms/molecules (`KpiCard`, `StageChip`, `InterviewCard`, `AvatarGroup`, `SearchBar`, `Button`, `Icon`...) before creating new ones — check `src/shared/components/` first.
- A file over its limit = missing abstraction. If you must leave one over, register it in `good-practices/DEBT_TECH.md` with an ID.

## Gate before reporting done

```bash
cd apps/frontend && npm run lint && npm run typecheck && npm test -- --run
node good-practices/validate-quality.mjs --strict   # from repo root — it walks ./apps relative to cwd
```

## Report format

End with: files created/changed (paths), test count before → after, gate results (paste the summary lines, don't claim green without running), each `Criterio de éxito` of the task marked **verified** / **not done** / **not verifiable here** (e.g. visual check), and any new debt or follow-up discovered.
