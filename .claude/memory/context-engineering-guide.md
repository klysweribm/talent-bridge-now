# Context engineering guide

How to keep a Claude Code session in this repo healthy over time, and how to hand off cleanly between sessions without turning `CLAUDE.md` into a diary.

## The workflow

```
New session
  ↓
Load CLAUDE.md (small: commands, rule lookup table, current state, handoff block)
  ↓
Path-scoped rules (.claude/rules/*.md, `paths:` frontmatter) auto-load when a matching file is read/edited
  ↓
Work normally
  ↓
/context-health
  ↓
If HIGH or CRITICAL risk:
    /generate-relevant-report   (writes into the TEMPORARY_SESSION_MEMORY block, Status: pending)
  ↓
Start a new session
  ↓
/import-relevant-report          (reads the block, rehydrates, clears it, Status: imported)
  ↓
Continue with a clean context
```

`/context-health` is cheap and safe to run anytime — it's read-only. Running it doesn't obligate you to act; it just gives you a recommendation.

## When to fork vs. resume vs. summarize vs. start fresh

- **Fork** (a sub-agent that inherits full context) when you need to go explore or execute something whose *raw output* you won't need again — a wide grep-and-read investigation, a speculative multi-file refactor attempt, a long test run's log. The fork burns its own tokens; your main session stays clean. Good default for "go check X" tasks inside an otherwise-healthy session.
- **Resume the same session** when `/context-health` says LOW or MEDIUM and the current task is a direct continuation of what's already loaded — most of the time, this is the right choice. Don't summarize or restart just because a session has been running a while; do it because specific signals below are present.
- **Summarize + start a new session** (`/generate-relevant-report` → new session → `/import-relevant-report`) when `/context-health` says HIGH or CRITICAL: several unrelated topics are active at once, the same files have been re-read more than once because earlier reads were "lost," there are unresolved contradictions from earlier in the conversation, or the harness has already auto-compacted once and things still feel foggy. A fresh session with a tight, deliberate report beats continuing to build on a shaky base.
- **Start fresh with no report at all** when the task itself is unrelated to what the session was doing — don't drag irrelevant context into a report just because a session exists. A report is for continuing *the same line of work*, not for carrying baggage into unrelated work.

## Minimizing saturation while you work

- Prefer reading only the files/sections you need; don't re-read a file "just to be sure" unless you have a concrete reason — that's a signal `/context-health` watches for.
- Push detail into path-scoped rule files (`.claude/rules/`, `paths:` frontmatter) instead of CLAUDE.md. A rule **without** `paths:` loads in every session — only use that for truly global rules.
- Use forks for exploration whose output you'll summarize, not keep verbatim.
- One handoff report at a time. `/generate-relevant-report` always replaces the block's previous contents — it never appends. If you need to hand off again before the last report was imported, that's a signal the previous handoff never happened; import or discard it first rather than layering a second report on top.

## Handling this repo specifically

`apps/backend`, `apps/frontend` and each `packages/*` are **independent npm projects** (no workspace tool), so context bleed is mostly about domain conventions, not build graphs:

- Work one app at a time. Frontend and backend conventions live in separate path-scoped rules (`.claude/rules/frontend-architecture.md` / `backend-architecture.md`) that only load when you read/edit a file under that app — don't open the other app's files "just in case".
- Full-stack features are done frontend first (mock-first), backend after, ideally as two sub-agent runs via `/roadmap-task` — not both halves in one long main session.
- `good-practices/BEST-PRACTICES.md` and `docs/integrations/ica/openapi.yaml` are the long-form sources. Read them **by section**, never whole, unless the task is about those docs.
- A handoff report that spans both apps should say which app each next step belongs to.

## What this guide deliberately avoids

- No invented token counts, context-window percentages, or other telemetry Claude Code doesn't actually expose in-conversation. `/context-health` classifies risk from qualitative signals (topic count, re-reads, contradictions, drift) — not from numbers nobody can see.
- No historical log inside `CLAUDE.md`. The handoff block holds exactly one report, replaced or cleared each time, never appended to.
