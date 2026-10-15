---
name: generate-relevant-report
description: Generate a compact, deterministic, English/technical session-handoff report and write it into CLAUDE.md's TEMPORARY_SESSION_MEMORY block, replacing any prior content. Use before ending a session or starting a new one after /context-health recommends summarize or new-session.
---

# Generate Relevant Report

## Steps

1. Read `.claude/templates/relevant-report.template.md` — this defines the fixed section order and rules (English, technical, deterministic, no chain-of-thought, roughly one screen, omit a section's body only if there's genuinely nothing to say). Follow it exactly; do not add sections, do not restate the user's original request verbatim, do not editorialize.
2. Fill the template from this session's actual work — real decisions, real file paths, real open questions. Cap `## Files Touched` at 10 entries; if more were touched, list the 10 most relevant and add `+N more (see git diff)`.
3. Read the root `CLAUDE.md`.
4. Replace everything between `<!-- BEGIN TEMPORARY_SESSION_MEMORY -->` and `<!-- END TEMPORARY_SESSION_MEMORY -->` with:
   ```
   Status: pending
   GeneratedAt: <current ISO-8601 timestamp>

   <filled report>
   ```
   This is a full overwrite of the block's contents — never append to or merge with whatever was there before. If the block already held a `pending` or `imported` report from an earlier run, it is discarded; the new report is the only one that matters going forward.
5. Confirm to the user in one or two lines that the report was written and that they can now start a new session and run `/import-relevant-report` there.

## Restrictions

- Don't touch anything else in `CLAUDE.md` outside the delimiters.
- Don't invent metrics, decisions, or file paths not actually present in this session's work.
- This skill does not start a new session or invoke any other skill — it only writes the block.
