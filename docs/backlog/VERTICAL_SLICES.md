# Vertical slice process

Engineering work proceeds **one user story at a time**.

```
Pick story → Plan → Implement → Test → Docs → Next story
```

Never build multiple features in parallel in the same change set.

## Current focus

| Field | Value |
|-------|--------|
| **Epic** | PE01 Desktop UI / Desktop Foundation |
| **Story** | Next: PE01-S02 / PE01-S03 (nav labels + deny-by-default IPC) |
| **Status** | PE01-S01 / DF-01 complete |
| **Note** | Native JobJitsu window via Tauri; React webview; launch smoke green |

## Completed slices

| Story | Date | Notes |
|-------|------|-------|
| PE01-S01 / DF-01 | 2026-07-23 | Tauri host `app/src-tauri`; `pnpm dev:desktop` |
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
