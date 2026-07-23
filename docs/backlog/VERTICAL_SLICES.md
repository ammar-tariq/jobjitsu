# Vertical slice process

Engineering work proceeds **one user story at a time**.

```
Pick story → Plan → Implement → Test → Docs → Next story
```

Never build multiple features in parallel in the same change set.

## Current focus

| Field | Value |
|-------|--------|
| **Epic** | PE03 Identity & Resume Library |
| **Story** | Profile tree: Create profile → Paths → resumes under each Path |
| **Status** | PR gate — [#86](https://github.com/ammar-tariq/jobjitsu/pull/86) |
| **Note** | Resume import under each Path; approval/craft prefs deferred from Preferences UI |

## Completed slices

| Story | Date | Notes |
|-------|------|-------|
| PE04-S03 | 2026-07-23 | Honest Agent privacy chrome; PR #76 |
| PE04-S04 | 2026-07-23 | Fit/tone/constraints via façade + IPC; Preferences.Changed |
| PE04-S06 | 2026-07-23 | Durable data folder; profile/resume/prefs on disk |
| PE04-S01 | 2026-07-23 | Approval default on; façade + IPC + Preferences toggle |
| PE04-S05 | 2026-07-23 | Data folder + native picker; Preferences.Changed dataRoot |
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
