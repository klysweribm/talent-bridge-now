# `.claude/memory/`

Curated, git-committed, team-shared reference knowledge about **how to work** in this repo with Claude Code. It is not loaded automatically — files here are read on demand when `CLAUDE.md` points to them.

- `context-engineering-guide.md` — when to continue / fork / summarize / start a new session, and the `/context-health` → `/generate-relevant-report` → `/import-relevant-report` handoff workflow.
- `agentic-architecture.md` — the hub-and-spoke sub-agent model (`.claude/agents/*.md`), concurrency/per-task limits, and the per-agent `model:` convention.

Domain and architecture knowledge does **not** live here. Dominio vigente: pendiente (`docs/domain.md`); los tipos actuales de `packages/shared-types` pertenecen al encuadre anterior. Diseño: `docs/design/UX-GUIDELINES.md`. Convenciones: `.claude/rules/`. Estado: `ROADMAP.md`. Don't duplicate them here.

## What this is *not*

Not the personal, per-user Claude Code auto memory (`~/.claude/projects/.../memory/`), which is written automatically and isn't shared. This directory is per-repo, shared via git, and edited deliberately only when the workflow itself changes.

Not a running log. A dated "what happened today" note belongs in the handoff block of `CLAUDE.md`, in `ROADMAP.md` → Historial, or in a commit message.
