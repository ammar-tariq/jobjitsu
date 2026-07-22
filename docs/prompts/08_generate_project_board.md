# 08 — Generate project board

You are shaping a **GitHub Projects–ready** board from the JobJitsu backlog.

## Goal

Produce a board specification (markdown) that maps epics/stories to columns and fields — suitable to create or sync a GitHub Project. Prefer documenting in `docs/backlog/` (e.g. `PROJECT_BOARD.md`) rather than inventing product scope.

## Required reading

- [docs/backlog/README.md](../backlog/README.md)
- [EPICS.md](../backlog/EPICS.md)
- [USER_STORIES.md](../backlog/USER_STORIES.md)
- [DEPENDENCY_GRAPH.md](../backlog/DEPENDENCY_GRAPH.md)
- [sprint-1.md](../backlog/sprint-1.md)
- [FEATURES.md](../product/FEATURES.md) status

## Proposed board shape (adapt, don’t invent epics)

**Columns (example):** Backlog → Ready → In progress → In review → Done

**Fields (example):** Epic ID, Horizon, Feature Status (Core/Experimental/Future), Package(s), Blocked by

**Views (example):** Current sprint; H1 only; hide Future

## Process

1. Draft `docs/backlog/PROJECT_BOARD.md` outline (columns, views, mapping rules). **Wait for approval.**
2. After approval: write the file; link it from backlog README and IMPLEMENTATION_ROADMAP index.
3. If the user asks to create the GitHub Project via `gh`, do that only after the markdown board exists and is approved — still no product feature code.

## Constraints

- Do not add stories that failed phase 06
- Future-status items stay in a parked view, not “Ready”
- Brand: no vanity velocity theater in column names

## Done when

- Board spec committed and linked
- **Stop and wait for approval** before phase 09
