# Vertical slice process

Engineering work proceeds **one user story at a time**.

```
Pick story → Plan → Implement → Test → Docs → Next story
```

Never build multiple features in parallel in the same change set.

## Current focus

| Field | Value |
|-------|--------|
| **Epic** | Desktop Foundation ([sprint-1.md](./sprint-1.md)) |
| **Story** | Foundation spine packages complete; next DF-03 wiring in host |
| **Status** | Next: host DI / logging registration |
| **Note** | `shared→events→logger→config→core→sdk→testing` built — **still no AI** |

## Completed slices

| Story | Date | Notes |
|-------|------|-------|
| E02-F02-S01 | 2026-07-22 | Event catalog + typed payloads |
| E02-F03-S01 | 2026-07-22 | `createInMemoryEventBus` |
| DF-02 | 2026-07-22 | Desktop shell layout + Coming Soon nav (Vite/React) |
| Foundation spine | 2026-07-22 | shared, events, logger, config, core, sdk, testing |

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
