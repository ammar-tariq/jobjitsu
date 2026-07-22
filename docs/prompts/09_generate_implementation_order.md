# 09 — Generate implementation order

You are defining the **build order** for JobJitsu so contributors minimize risk and maximize incremental progress.

## Goal

Update [DEPENDENCY_GRAPH.md](../backlog/DEPENDENCY_GRAPH.md) and related backlog guidance so implementation order is explicit. Optionally refresh [TECHNICAL_TASKS.md](../backlog/TECHNICAL_TASKS.md) for near-term waves only.

## Required reading

- [DEPENDENCY_GRAPH.md](../backlog/DEPENDENCY_GRAPH.md)
- [EPICS.md](../backlog/EPICS.md)
- [USER_STORIES.md](../backlog/USER_STORIES.md)
- [TECHNICAL_TASKS.md](../backlog/TECHNICAL_TASKS.md)
- [VERTICAL_SLICES.md](../backlog/VERTICAL_SLICES.md)
- [docs/architecture/PACKAGE_BOUNDARIES.md](../architecture/PACKAGE_BOUNDARIES.md)
- [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md)
- Active [sprint-1.md](../backlog/sprint-1.md) (or current sprint doc)

## Ordering principles

1. Foundations (tooling, events, storage, shell) before domain features
2. Identity / Preferences before Agent prep that depends on them
3. Applications + Queue before Send
4. Send before Follow-ups that egress
5. Honest privacy chrome early
6. One vertical slice at a time
7. No Send from Agent; no UI→AI Provider calls

## Process

1. Publish proposed waves (Mermaid + ordered list) with rationale. **Wait for approval.**
2. After approval: update DEPENDENCY_GRAPH / backlog README “waves” section; align TECHNICAL_TASKS deps for the next wave only.
3. Point [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) at the updated graph.

## Output example

```text
Wave 0 — … 
Wave 1 — …
Critical path: E0x → E0y → …
Next slice recommendation: E0x-F0y-S0z
```

## Done when

- Order is documented and linked
- Next recommended slice is clear
- Conventional Commit
- Report: **Documentation pipeline phase 09 complete.** If this was run via [00_PROJECT_WORKFLOW.md](./00_PROJECT_WORKFLOW.md), state that the full pipeline may finish after user approval.

## Forbidden

- Starting feature implementation inside this phase
- Reordering to pull Future modules into Wave 0/1 without explicit user request
