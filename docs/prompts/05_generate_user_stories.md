# 05 — Generate user stories

You are refining the JobJitsu **implementation backlog** stories from product + architecture docs.

## Goal

Ensure [docs/backlog/](../backlog/) user stories and acceptance criteria cover Core (and labeled Experimental) capabilities without inventing Horizon-Future work as near-term commitments.

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

1. Gap analysis: product Core/Experimental vs existing stories. **Present plan; wait for approval.**
2. After approval: add/update stories + AC; keep [TECHNICAL_TASKS.md](../backlog/TECHNICAL_TASKS.md) in sync only when tasks are obvious from stories (otherwise leave for phase 09).
3. Do not create a parallel story file outside `docs/backlog/`.

## Story shape

```text
### Exx-Fyy-Szz — As a <role>, I can <capability>
- Given / When / Then style AC bullets
- Events or packages touched (if known)
- Status: proposed | ready | done
```

## Done when

- Gaps for Core H1 are closed or explicitly deferred with reason
- Terminology consistent
- Conventional Commit
- **Stop and wait for approval** before phase 06
