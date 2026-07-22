# Vertical slice process

Engineering work proceeds **one user story at a time**.

```
Pick story → Plan → Implement → Test → Docs → Next story
```

Never build multiple features in parallel in the same change set.

## Current focus

| Field | Value |
|-------|--------|
| **Epic** | PE03 Trust & Identity |
| **Story** | PE03-S03 — Version and select resumes (this slice) |
| **Status** | In progress → PR gate |
| **Note** | List + select via identity APIs; select ≠ send; optional parent refs |

## Completed slices

| Story | Date | Notes |
|-------|------|-------|
| PE03-S03 | 2026-07-23 | Version list/select; parentVersionId; select ≠ send |
| PE03-S02 | 2026-07-23 | Resume library import + Preferences UI; Resume.Imported |
| PE03-S01 | 2026-07-23 | Local profile CRUD; Preferences form via IPC |
| PE02-S03 | 2026-07-23 | Memory durable sink; allowlist coverage tests |
| PE02-S02 | 2026-07-23 | Full EVENT_SYSTEM catalog; Progress minimization |
| PE02-S01 | 2026-07-23 | FS storage provider; temp-dir KV/blob restart tests |
| PE01-S04 | 2026-07-23 | Dark default + light toggle |
| PE01-S03 | 2026-07-23 | IPC allowlist + typed bridge |
| PE01-S02 | 2026-07-23 | Primary H1 nav |
| PE01-S01 / DF-01 | 2026-07-23 | Tauri host |
