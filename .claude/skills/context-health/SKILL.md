---
name: context-health
description: Evaluate this session's contextual degradation from observable, qualitative signals and recommend continue, fork, summarize, or new session. Use when a session has been running a while, feels unfocused, or before starting a large new sub-task.
---

# Context Health Check

Read-only. This skill never edits any file — it only produces a report and, if it recommends summarizing, tells the user to run `/generate-relevant-report` next (it does not call that skill itself).

## What to evaluate

Look at the actual transcript of this session — not at any numeric telemetry, because none is reliably exposed here (see Restrictions). For each signal, judge it from what genuinely happened in this conversation:

- **Active topics**: how many distinct, not-obviously-related goals are being worked on right now versus one coherent thread.
- **Files referenced**: how many distinct files have been read or edited, and whether any of them are unusually large (e.g. a file requiring `offset`/`limit` paging, or several files read in full when only a section was needed).
- **Unresolved ambiguities**: open questions asked (by either side) that never got a clear answer.
- **Active contradictions**: a decision, plan, or fact stated earlier that was later reversed or contradicted without an explicit acknowledgment of the change.
- **Accumulated assumptions**: choices made "for now" or "assuming X" that were never confirmed and are still load-bearing.
- **Reasoning/chaining depth**: how many nested sub-tasks or layers of "in order to do A I first need B which needs C" are currently in flight.
- **Drift**: how far the current activity has wandered from the original ask in this session.
- **Repeated re-reads**: the same file or the same piece of information being re-fetched more than once — a concrete sign that earlier context was already effectively lost.
- **Compaction signal**: whether the harness has already emitted an auto-compaction/summarization notice earlier in this session.
- **Rule/skill load**: how many distinct `.claude/rules/*.md` or skill files have been pulled in — a lot of loaded policy on top of a lot of active topics compounds risk.

## Classification

Use judgment, not a formula — these are qualitative bands, not thresholds computed from a metric:

- **LOW** — one coherent thread, no contradictions, no repeated re-reads. Normal working state.
- **MEDIUM** — a couple of related sub-threads, or one stale assumption worth confirming, but nothing actively conflicting. Still safe to continue.
- **HIGH** — multiple unrelated topics active at once, and/or a contradiction or repeated re-read has actually occurred. Continuing is risky; summarizing soon is warranted.
- **CRITICAL** — several of the HIGH signals together, and/or the harness has already auto-compacted and confusion persisted afterward. Recommend stopping to summarize now, before doing anything else non-trivial.

## Output (always this shape)

```
## Context Health Check
Risk: <LOW|MEDIUM|HIGH|CRITICAL>
Signals:
- <signal>: <what was actually observed>
Potentially degraded areas:
- <area/topic that may be losing precision>
Recommendation: <continue|fork|summarize|new-session>
Next action: <one concrete sentence>
```

Recommendation mapping:
- LOW → `continue`
- MEDIUM → `continue` (optionally `fork` if the next step is a wide exploration you don't need to keep verbatim)
- HIGH → `summarize` — next action: "Run /generate-relevant-report, then start a new session and run /import-relevant-report."
- CRITICAL → `new-session` — next action: same as HIGH, but stated more urgently, and flag which specific topic should be dropped rather than carried forward.

## Restrictions

- Never state an exact token count, a percentage of context window used, or any other number the harness has not itself surfaced in this conversation. If you don't know, say "not observable from this session" rather than estimating a fake number.
- Don't fabricate a precise signal count ("14 files referenced") unless you actually counted them from the visible transcript — approximate language ("several", "two or three") is fine and more honest than a fake-precise number.
- This skill only reports. It does not write to `CLAUDE.md`, does not clear anything, and does not invoke `/generate-relevant-report` on its own — that's a separate, explicit step the user or the calling session takes.
