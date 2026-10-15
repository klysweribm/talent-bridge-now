---
name: import-relevant-report
description: Read the TEMPORARY_SESSION_MEMORY block from CLAUDE.md, rehydrate this session with the report it contains, then clear the block. Use at the start of a new session after a prior one ran /generate-relevant-report.
---

# Import Relevant Report

## Steps

1. Read the root `CLAUDE.md` and extract the content between `<!-- BEGIN TEMPORARY_SESSION_MEMORY -->` and `<!-- END TEMPORARY_SESSION_MEMORY -->`.
2. Check `Status`:
   - If it is **not** `pending` (e.g. `none` or already `imported`), tell the user there is no pending handoff report to import and stop. Do not modify the file.
3. If `Status: pending`:
   - Present the report's sections back to the user in the conversation (Objective, Key Decisions, Current State, Open Risks, Next Steps, Files Touched) — this is the actual rehydration step; there is no other state store, so read it carefully before summarizing it back.
   - Then replace the entire block content with:
     ```
     Status: imported
     ImportedAt: <current ISO-8601 timestamp>
     ```
     dropping the report body entirely — the block must not retain the old report text after import.
4. Confirm the import in one line and proceed with the work described in "Next Steps," or ask the user what to prioritize if it's ambiguous.

## Restrictions

- Never leave the report body in the block after importing — the point of this skill is that the block returns to a minimal, non-accumulating state every time.
- Don't touch anything else in `CLAUDE.md` outside the delimiters.
- If the block's `Status` line is missing or malformed, say so explicitly rather than guessing what it might have meant.
