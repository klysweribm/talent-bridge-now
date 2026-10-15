# `.claude/scratchpads/`

Ephemeral, per-task working files — draft notes, intermediate analysis, anything a skill or an agent wants to jot down while it's working but that has no long-term value once the task is done.

Rules:
- Everything in this directory except this `README.md` is gitignored. Don't rely on it surviving a `git clone`, a new machine, or another teammate's checkout.
- Never use this directory for cross-session handoff. That's what the `TEMPORARY_SESSION_MEMORY` block in the root `CLAUDE.md` is for (see `/generate-relevant-report` and `/import-relevant-report` in `.claude/skills/`). A scratchpad file is invisible to the next session by design.
- Feel free to create and delete files here freely — there's no expectation of tidiness beyond "don't leave stale files that could be mistaken for current state."
