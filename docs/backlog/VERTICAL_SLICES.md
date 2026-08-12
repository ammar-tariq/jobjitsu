# Vertical slice process

Engineering work proceeds **one user story at a time**.

```
Pick story → Plan → Implement → Test → Docs → Next story
```

Never build multiple features in parallel in the same change set.

## Current focus

| Field | Value |
|-------|--------|
| **Epic** | [PE01 Desktop Shell](https://github.com/ammar-tariq/jobjitsu/issues/1) |
| **Story** | Shell UX — calm chrome, `data-layout`, Applications list + detail |
| **Status** | In Progress |
| **Note** | Presentation only. Do not change IPC, send, or Agent ownership. PE20 mailbox intelligence stays in Applications as quiet summary + attention, not a cockpit. |

## Completed slices

| Story | Date | Notes |
|-------|------|-------|
| Sellable local MVP | 2026-08-11 | Durable applications; Queue/Follow-ups/Timeline; approval prefs; no fake send; onboarding |
| PE05-S07 | 2026-08-11 | List on-device Agent models from Ollama; PR #113 |
| PE08-S04 | 2026-08-11 | Applications list + open detail; PR #111 |
| PE08-S02 | 2026-08-11 | Application cover letter draft; PR #110 |
| PE28-S03 | 2026-08-11 | Craft chat refine + clarifying questions; PR #109 |
| PE28-S02 | 2026-08-11 | HTML preview + local PDF export; PR #108 |
| PE28-S01 | 2026-08-11 | Craft screen résumé + cover letter; PR #107 |
| PE05-S06 | 2026-08-11 | Real on-device Agent via local Ollama; PR #106 |
| PE03-S04 | 2026-08-11 | Tailor résumé draft no send; PR #100 |
| PE08-S01 | 2026-08-11 | Application drafts create/edit; soft-duplicate; PR #98 |
| PE03-S10 | 2026-08-11 | AI parse import draft; Profile prefill; PR #97 |
| PE05-S05 | 2026-08-11 | Offline / local-primary Agent; PR #96 |
| PE05-S03 | 2026-08-11 | Context Builder allowlist + budgets; PR #95 |
| PE05-S02 | 2026-08-11 | Path-gated Agent readiness; Preferences model path; PR #94 |
| PE05-S01 | 2026-07-23 | Fake provider health/complete; Ai.LocalModel*; no silent cloud fallback; PR #93 |
| PE03-S09 | 2026-07-23 | Create Path from existing résumé; PR #92 |
| PE03-S08 | 2026-07-23 | LinkedIn PDF import + source label; PR #91 |
| PE03-S07 | 2026-07-23 | Attach identity/path/both after review; PR #90 |
| PE03-S06 | 2026-07-23 | Review import before library write; PR #89 |
| PE27-S01 (multi-profile) | 2026-07-23 | Multiple local profiles; Paths/resumes nested; PR #88 |
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

## Sellable local MVP bar

What must be true to sell the local-first MVP (on-device Agent, no cloud résumé storage, agent ≠ send):

- Career drafts survive restart — applications persist under the on-device data folder.
- User owns outbound: approval-before-send is visible in Preferences; nothing sends without intent.
- Primary nav destinations all work — no "Coming Soon" for core nouns.
- Startup is honest: health-check the Agent only; never fake a send.
- First-run onboarding guides profile + on-device Agent model, and stays skippable.
- Agent view describes readiness calmly — status and recent activity, no cascade theater.
- Craft output can land in an application draft ("Save to application"); nothing is sent.
- Queue lists items ready for review: Approve (stays on device) or Keep drafting.
- Follow-ups can be scheduled on an application, with a due list.
- Timeline shows a calm local activity feed (durable sink still deferred).
- Primary intelligence is Ollama on this device; chrome says Agent · On-device; UI never imports `@jobjitsu/ai`.
- Deferred honestly: real mail/apply channels, discovery network, structured résumé studio, remote providers, durable event log, plugins.
