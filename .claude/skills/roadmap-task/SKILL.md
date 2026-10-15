---
name: roadmap-task
description: Start a ROADMAP.md feature (FE-OTP-1, AUTH-2, CAND-1...) or a frontend remediation-plan stage ("Etapa 2") by resolving its scope and delegating to the matching sub-agent (frontend-task / backend-task / config-task), so only that domain's conventions load. Use when the user says "ejecutemos FE-OTP-1", "arranquemos la Etapa 2", "la siguiente tarea", or "next".
argument-hint: "<ID | Etapa N | next>"
---

# Roadmap task dispatcher

Delegates a task to the sub-agent whose own definition (`.claude/agents/*-task.md`) already tells it which rules to read — so this main session doesn't load `good-practices/*` or every `.claude/rules/*`, and the implementing agent never sees another domain's conventions.

## Steps

1. **Resolve the target.**
   - `Etapa N` → read that stage's section in the remediation plan (path in `CLAUDE.md` → "Estado actual"; today `~/.claude/plans/breezy-moseying-plum.md`).
   - A feature ID (`FE-OTP-1`, `AUTH-2`, `PROC-2`, `CAND-1`, `INT-1`, `FEED-1`, `REP-1`, `CV-1`, `HARDEN-1`, `DEPLOY-1`) → read its `## <ID> — ...` section in root `ROADMAP.md` in full (Motivación/Alcance/Dependencias/Criterios de éxito).
   - `next` / no id → `CLAUDE.md` → "Estado actual / próximo paso" says what's next; cross-check with the first non-✅ line of `ROADMAP.md` → "Orden de implementación recomendado". If they disagree, show both and ask.
2. **Check dependencies.** If the section's `### Dependencias` names something not ✅, tell the user before delegating — don't silently start a blocked task.
3. **Map to a sub-agent:**

   | Target | Sub-agent |
   | --- | --- |
   | `Etapa 0-7`, `FE`, `FE-*` | `frontend-task` |
   | `AUTH-*`, `PROC-*`, `CV-*` | `backend-task` |
   | `CAND-1`, `INT-1`, `FEED-1`, `REP-1` (frontend + backend) | `frontend-task` first, then `backend-task` — see step 4 |
   | `Etapa 8`, `HARDEN-*`, `DEPLOY-*` | `config-task` (plus `frontend-task` if the stage's scope includes UI code) |
   | Anything else / new prefix | Read its Alcance and ask the user which layer(s) it touches |

4. **Delegate** with the `Agent` tool (`subagent_type` = the agent above). The prompt must be self-contained: task id + its full section text + "end your report with each Criterio de éxito marked verified / not done / not verifiable here". **Don't restate conventions** — the agent reads its own rules.
   - Full-stack features: run the halves **sequentially**, never in parallel. Project principle: frontend first (mock-first), backend after. Pass the backend agent the list of `infrastructure/*.infra.ts` files + types the frontend agent produced, so the API matches the contract. Ask the user first whether to run both halves now or only the frontend one.
   - If the section explicitly crosses layers in a way the table doesn't capture, say so in the delegation prompt so the agent knows it may read one extra rule file.
5. **Report** the sub-agent's result to the user. Don't re-read the files it touched to "double-check" — trust its gate output, and if it didn't paste gate results, ask it.
6. **Reconcile tracking inline** (don't invoke `/update-roadmap` separately, don't spawn another agent): follow `.claude/skills/update-roadmap/SKILL.md` steps 3-7 using the verified-criteria report from step 4.

## Restrictions

- Never read `good-practices/BEST-PRACTICES.md` in full from the main session, nor more than one agent's rule bundle — that defeats the split. If ambiguous between layers, ask.
- Never mark anything ✅ on inference — only on the sub-agent's verified-criteria report or explicit user confirmation.
- If `ROADMAP.md`'s structure changed (no `## <ID> —` sections, no "Orden de implementación" block, no `Historial` table), say so instead of guessing.
