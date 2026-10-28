---
name: update-roadmap
description: Reconcile ROADMAP.md (including its "Estado actual / próximo paso" block and, when a remediation stage closes, good-practices/DEBT_TECH.md) with work actually verified in this session — update Estado, check off Criterios de éxito, update the "Orden de implementación" block, add a Historial row. Use after roadmap work that did NOT go through /roadmap-task (ad-hoc fixes, manual edits). /roadmap-task already does this inline — don't run it twice for the same task.
---

# Update roadmap

Applies the edit directly (git makes it reversible) — not a dry run.

## Steps

1. **Determine what was verified this session**: which feature ID / Etapa, what changed, and the evidence (gate run with passing output, or explicit user confirmation). "Code was written" is not evidence. Process each task independently.
2. Read root `ROADMAP.md` in full.
3. For each task, in its `## <ID> — ...` section:
   - Check only the `### Criterios de éxito` boxes actually verified (`- [x]`).
   - Update the `**Estado:**` line: `✅ completado (YYYY-MM-DD)` if **every** criterio is verified; otherwise keep `🚧 en progreso` and add a short note right under it (what's done / what's left). For the `FE` remediation section, check the box of the closed Etapa and update "Etapa N/8 cerrada".
4. Update the matching line in `## Orden de implementación recomendado` (`📌` → `🚧` → `✅`, and the short status text).
5. Add one row to `### Historial` (date, change, reason — follow the existing row style) and bump `**Última actualización:**` at the top.
6. **If a remediation Etapa closed** (all its plan items verified + gate green):
   - Replace `ROADMAP.md` → "Estado actual / próximo paso" (never `CLAUDE.md`, which only points there): one line for the closed stage (what was achieved + gate numbers), one for the next stage. Don't accumulate history there — it already lives in `ROADMAP.md` → Historial and `DEBT_TECH.md` → Resueltos.
   - In `good-practices/DEBT_TECH.md`, move resolved DT-IDs to "Resueltos" with a one-line note; register any new debt found.
7. **New follow-up work** discovered: don't add it to `ROADMAP.md` automatically. List it as a suggestion; adding it for real needs a duplicate check, an ID following the existing scheme (`<AREA>-<n>`), and placement in "Orden de implementación" by real dependency.
8. Report back:

```
Actualizado:
- <ID> — <Estado anterior> → <Estado nuevo> (<n>/<m> criterios)
Orden de implementación (actual):
- <copy of the block's lines>
Sugerencias (no agregadas): <list or "ninguna">
```

## Restrictions

- Never round up completion status.
- Never touch Motivación/Alcance/Dependencias prose of a task — only Estado, checkboxes, the order block, Historial.
- Never reorder unrelated tasks.
- If the expected structure is missing, say so instead of guessing where to write.
