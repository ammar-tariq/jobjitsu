# 08 — Generate project board

You are shaping a **GitHub Projects–ready** board from the JobJitsu backlog.

## Goal

Produce a board specification (markdown) that maps epics/stories to columns and fields — suitable to create or sync a GitHub Project. Living files:

- [docs/backlog/PROJECT_BOARD.md](../backlog/PROJECT_BOARD.md)
- Ordered waves: [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md)

Prefer documenting in `docs/backlog/` rather than inventing product scope.

## Required reading

- [docs/backlog/README.md](../backlog/README.md)
- [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md)
- [../roadmap/USER_STORIES.md](../roadmap/USER_STORIES.md)
- [EPICS.md](../backlog/EPICS.md)
- [USER_STORIES.md](../backlog/USER_STORIES.md)
- [DEPENDENCY_GRAPH.md](../backlog/DEPENDENCY_GRAPH.md)
- [sprint-1.md](../backlog/sprint-1.md)
- [FEATURES.md](../product/FEATURES.md) status

## Process

1. Draft/update `docs/backlog/PROJECT_BOARD.md` (columns, views, mapping rules) aligned with IMPLEMENTATION_ROADMAP waves.
2. Link from backlog README and IMPLEMENTATION_ROADMAP.
3. If the user asks to create the GitHub Project via `gh`, do that only after the markdown board exists — still no product feature code.
4. **Stop and wait for approval** before phase 09 (unless the user asked to continue).

## Constraints

- Do not add stories that failed phase 06
- Future-status items stay in a parked view, not “Ready”
- Brand: no vanity velocity theater in column names

## Done when

- Board spec committed and linked
- **Stop and wait for approval** before phase 09
