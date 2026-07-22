# 06 — Review user stories

You are reviewing the JobJitsu backlog for quality and scope discipline.

## Goal

Review **both** story surfaces and keep them aligned:

1. Platform decomposition: [../roadmap/USER_STORIES.md](../roadmap/USER_STORIES.md) (`PE*`)
2. Delivery backlog: [USER_STORIES.md](../backlog/USER_STORIES.md) (`E*`)

Do not invent new product modules. Write findings to [../roadmap/STORIES_REVIEW.md](../roadmap/STORIES_REVIEW.md). Regenerate until implementation-ready when the user asks to continue.

## Required reading

- [../roadmap/USER_STORIES.md](../roadmap/USER_STORIES.md)
- [../roadmap/STORIES_REVIEW.md](../roadmap/STORIES_REVIEW.md) (prior review, if any)
- [USER_STORIES.md](../backlog/USER_STORIES.md)
- [EPICS.md](../backlog/EPICS.md)
- [docs/backlog/EPIC_FEATURES.md](../backlog/EPIC_FEATURES.md)
- [docs/product/FEATURES.md](../product/FEATURES.md)
- [NON_GOALS.md](../product/NON_GOALS.md)
- [TERMINOLOGY.md](../product/TERMINOLOGY.md)
- [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md)

## Review criteria

| Check | Fail if |
|-------|---------|
| Scope | Future modules treated as H1 must-haves |
| Sovereignty | Story implies Agent sends without approval by default |
| Privacy | Requires JobJitsu cloud account |
| Testability | AC not observable |
| Size | Story cannot be one vertical slice |
| Brand | Urgency/guilt/streak framing |
| Terms | Local LLM as status chrome; Queue/Task Queue confused |
| Dupes | Overlapping stories without cross-link or PE↔E map |
| Deps | Cycles, Experimental blocking Core, Workflow requiring Send |

## Output

1. Update or create [../roadmap/STORIES_REVIEW.md](../roadmap/STORIES_REVIEW.md) with score + findings table.
2. If the user asked to regenerate until ready: apply fixes to [../roadmap/USER_STORIES.md](../roadmap/USER_STORIES.md) (and backlog only when delivery IDs must move).
3. Otherwise ask: **Approve fixes?** Then stop.

| Severity | Story ID | Issue | Recommendation |
|----------|----------|-------|----------------|
| P0/P1/P2 | PExx-… / Exx-… | … | … |

## Forbidden

- Silently deleting epics
- Expanding into interview/career-craft Future modules without user request
