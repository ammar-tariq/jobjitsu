# 05 — Generate user stories

You are refining the JobJitsu **implementation backlog** stories from product + architecture docs.

## Goal

Decompose the **documented** platform into epics and user stories without inventing features.

Primary deliverable for this phase: [docs/roadmap/USER_STORIES.md](../roadmap/USER_STORIES.md) (`PE*` epics).

Keep day-to-day execution IDs in [docs/backlog/](../backlog/) (E01–E19); cross-link rather than fork conflicting scope.

## Required reading

- [FEATURES.md](../product/FEATURES.md) — Core / Experimental / Future
- [PLATFORM_SPECIFICATION.md](../product/PLATFORM_SPECIFICATION.md)
- [TERMINOLOGY.md](../product/TERMINOLOGY.md)
- [docs/architecture/OVERVIEW.md](../architecture/OVERVIEW.md)
- Existing [EPICS.md](../backlog/EPICS.md), [EPIC_FEATURES.md](../backlog/EPIC_FEATURES.md), [USER_STORIES.md](../backlog/USER_STORIES.md), [ACCEPTANCE_CRITERIA.md](../backlog/ACCEPTANCE_CRITERIA.md)
- [VERTICAL_SLICES.md](../backlog/VERTICAL_SLICES.md)

## Rules

- Prefer **updating** existing epic/story IDs over renumbering the world.
- One story ≈ one vertical slice; independently testable.
- AC must be observable and brand-safe (Agent · On-device; no urgency theater).
- Agent never owns Send; approval/Queue remain explicit where required.
- Mark Future-status product modules as out of scope for H1 story generation unless user asks.
- Distinguish review **Queue** from AI **Task Queue** in wording.

## Process

1. Gap analysis: product Core/Experimental/Future vs PLATFORM_SPEC sections. Prefer a short plan when scope is ambiguous; if the user already ordered Step 6, generate the roadmap file directly.
2. Write/update [../roadmap/USER_STORIES.md](../roadmap/USER_STORIES.md) with title, description, AC, dependencies, priority, technical notes, testing notes per story.
3. Align backlog E* stories later (phase 06/09); do not renumber E01–E19 casually.
4. Mark Future as deferred stubs; Experimental explicitly labeled.

## Story shape (roadmap file)

```text
### PE0x-S0y — title
**Description:** …
**Acceptance criteria:** …
**Dependencies:** …
**Priority:** …
**Technical notes:** …
**Testing notes:** …
**Status:** proposed | ready | done | deferred
```

## Done when

- Gaps for Core H1 are closed or explicitly deferred with reason
- Terminology consistent
- Conventional Commit
- **Stop and wait for approval** before phase 06
