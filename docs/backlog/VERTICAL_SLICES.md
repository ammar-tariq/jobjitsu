# Vertical slice process

Engineering work proceeds **one user story at a time**.

```
Pick story → Plan → Implement → Test → Docs → Next story
```

Never build multiple features in parallel in the same change set.

## Current focus

| Field | Value |
|-------|--------|
| **Epic** | Event-driven host |
| **Story** | Startup cascade on the bus; UI never calls AI |
| **Status** | Host runtime + Dojo activity view |
| **Note** | `App.Started → Plugin.Loaded → Resume.Generated → Email.Synced` |

## Completed slices

| Story | Date | Notes |
|-------|------|-------|
| E02-F02-S01 | 2026-07-22 | Event catalog + typed payloads |
| E02-F03-S01 | 2026-07-22 | `createInMemoryEventBus` |
| DF-02 | 2026-07-22 | Desktop shell layout + Coming Soon nav (Vite/React) |
| Foundation spine | 2026-07-22 | shared, events, logger, config, core, sdk, testing |
| DF-10 | 2026-07-22 | Extension SDK manager, lifecycle, DI, events |
| E06-F02 + fakes | 2026-07-22 | Fake AI, Gmail, Jobs, Resume providers |
| Event cascade | 2026-07-22 | Host runtime cascade; UI↛AI fence |

## Sprint 1 sequence

1. DF-01 Launch desktop application  
2. DF-02 Create shell layout  
3. DF-03 Create logging  
4. DF-04 Create error reporting  
5. DF-05 Register dependency injection  
6. DF-06 Register event bus  
7. DF-07 Create settings service  
8. DF-08 Create theme system  
9. DF-09 Create plugin loader  
10. DF-10 Create extension manager  
