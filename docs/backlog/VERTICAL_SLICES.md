# Vertical slice process

Engineering work proceeds **one user story at a time**.

```
Pick story → Plan → Implement → Test → Docs → Next story
```

Never build multiple features in parallel in the same change set.

## Current focus

| Field | Value |
|-------|--------|
| **Story** | None — pick next |
| **Status** | Idle |
| **Suggested next** | [E02-F04-S01](./USER_STORIES.md) (durable sink hook tests) or [E02-F01-S01](./USER_STORIES.md) (storage KV) |
| **Wave** | 1 |

## Completed slices

| Story | Date | Notes |
|-------|------|-------|
| E02-F02-S01 | 2026-07-22 | Event catalog + typed payloads (with platform interfaces) |
| E02-F03-S01 | 2026-07-22 | `createInMemoryEventBus` — ordered local pub/sub |

Update this file when a slice finishes and when the next story is chosen.
