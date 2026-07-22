# 09 — Generate implementation order

You are defining the **build order** for JobJitsu so contributors minimize risk and maximize incremental progress.

## Goal

Publish [IMPLEMENTATION_ORDER.md](../../IMPLEMENTATION_ORDER.md) as the **canonical task sequence**: every Core task in dependency order, grouped by milestone, with parallel batches and critical path marked. Align [DEPENDENCY_GRAPH.md](../backlog/DEPENDENCY_GRAPH.md) if needed.

## Required reading

- [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md)
- [DEPENDENCY_GRAPH.md](../backlog/DEPENDENCY_GRAPH.md)
- [EPICS.md](../backlog/EPICS.md)
- [USER_STORIES.md](../backlog/USER_STORIES.md)
- [../roadmap/USER_STORIES.md](../roadmap/USER_STORIES.md)
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

1. Confirm [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) `PE*` waves and [GITHUB_PROJECT_IMPORT.md](../backlog/GITHUB_PROJECT_IMPORT.md) hierarchy are coherent with this graph.
2. Update this file’s PE↔E wave table if waves change.
3. Optionally refresh [TECHNICAL_TASKS.md](../backlog/TECHNICAL_TASKS.md) for the next wave only (prefer PE task IDs / twins).
4. Report: **Documentation pipeline phase 09 complete.**

## Done when

- Order is documented and linked (PE roadmap + E graph + GitHub import)
- Next recommended slice/task is clear (`PE01-S01-T01`)
- Conventional Commit (if user wants a commit)
- **Stop and wait for approval** before product feature implementation (unless user waives)

## Forbidden

- Starting feature implementation inside this phase
- Reordering to pull Future modules into Wave 0/1 without explicit user request
