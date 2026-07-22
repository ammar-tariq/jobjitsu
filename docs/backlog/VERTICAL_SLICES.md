# Vertical slice process

Engineering work proceeds **one user story at a time**.

```
Pick story → Plan → Implement → Test → Docs → Next story
```

Never build multiple features in parallel in the same change set.

## Current focus

| Field | Value |
|-------|--------|
| **Epic** | PE02 Storage & Event Spine |
| **Story** | Next: PE02-S02 — Typed local event bus (or PE04 prefs) |
| **Status** | PE02-S01 complete (this slice) |
| **Note** | Local FS KV + blobs under user-data; no cloud |

## Completed slices

| Story | Date | Notes |
|-------|------|-------|
| PE02-S01 | 2026-07-23 | FS storage provider; temp-dir KV/blob restart tests |
| PE01-S04 | 2026-07-23 | Dark default + light toggle (land via #61 if needed) |
| PE01-S03 | 2026-07-23 | IPC allowlist, fail-closed dispatcher, typed bridge |
| PE01-S02 | 2026-07-23 | Primary H1 nav: Applications → Timeline |
| PE01-S01 / DF-01 | 2026-07-23 | Tauri host `app/src-tauri`; `pnpm dev:desktop` |
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
