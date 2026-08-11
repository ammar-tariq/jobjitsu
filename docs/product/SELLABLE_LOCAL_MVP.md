# Sellable local MVP — gap analysis & shipped fixes

Analysis of **application code only** (shell, host, IPC, packages). Goal: a trustworthy local-first career OS that people could pay for, running **on-device Agent models** (Ollama) — no cloud résumé storage, agent ≠ send.

## Verdict (before this pass)

Solid foundation; not sellable yet. Identity, Preferences, Craft, and Applications worked under Tauri, but applications were **process-local only**, Queue / Follow-ups / Timeline were **Coming Soon**, startup **faked a mailbox send**, and approval-before-send was **API-only**.

## What must be true for a sellable local product

1. Career drafts survive restart (on this device).
2. User owns outbound: approval preference is visible; nothing sends without intent.
3. Primary nav destinations work (no dead “Coming Soon” for core nouns).
4. First-run setup guides profile + on-device Agent model.
5. Agent UI describes readiness calmly — not engineering cascade theater.
6. Craft work can land in an Application draft.

## Gaps found

| Area | Gap | Severity |
| ---- | --- | -------- |
| Applications | Memory-only repository; restart wiped drafts | Blocker |
| Startup | `Resume.Generated` → fake Gmail send without user intent | Blocker (trust) |
| Preferences | Approval-before-send + craft tone unused in UI | High |
| Queue / Follow-ups / Timeline | Nav → Coming Soon | High |
| Onboarding | Boot straight into Craft; no guided first run | High |
| Craft | Session-only React state; no save-to-application | High |
| Agent view | Event-name cascade demo; “ready (fake)” copy | Medium |
| Applications UX | No delete, no “Ready for review”, jargon (“model path”) | Medium |
| Timeline durability | Durable event sink not attached | Deferred (activity feed MVP) |
| Real mail / apply | Fake channels only | Deferred (honest stub) |

## Data persistence

### Already on disk (Tauri durable path)

Profiles, résumé versions + blobs, career paths, app settings (theme, approval flag, craft prefs, local model id), data-root pointer.

### Shipped in this pass

| Data | Storage |
| ---- | ------- |
| Application drafts (company, role, stage, notes, résumé/cover drafts, follow-up date/text) | KV `applications/drafts` under data folder |
| Onboarding completed | App settings `onboardingCompleted` |
| Queue / approve decisions | Application `stage` + domain events |
| Follow-ups | Fields on application (`followUpAt`, `followUpDraftText`) |
| Timeline (MVP) | In-process host activity (approve / prefs / agent status); durable sink still later |

### Still ephemeral / deferred

Craft chat history until saved to an application; real send outbox; discovery feed; structured résumé editor; durable event log on disk.

## Shipped UX / product fixes (this branch)

1. **Durable applications** — same data folder as identity; rebound when data folder changes.
2. **Honest startup** — health-check Agent only; **no** fake mailbox send.
3. **Preferences** — require approval before send; craft tone; data folder copy mentions applications.
4. **Queue** — list Ready for review; Approve (stays on device) / Keep drafting.
5. **Follow-ups** — schedule date + draft on an application; due list.
6. **Timeline** — calm activity list from host events.
7. **Agent** — status + recent activity; link to Preferences; no cascade theater.
8. **Onboarding** — profile → Agent model → done / skip (persisted).
9. **Applications** — send to Queue, delete, follow-up fields, clearer Agent copy.
10. **Craft** — “Save to application” creates/updates a local draft (nothing sent).

## Explicitly deferred (not this pass)

- Real Gmail / LinkedIn apply automation
- Job discovery network
- Full structured résumé studio
- Remote Agent providers
- Durable event sink + timeline across restart
- Plugin marketplace

## Local models

Primary path remains **Ollama on this device**. Preferences lists installed models; path-gated readiness; UI never imports `@jobjitsu/ai`. Brand chrome: **Agent · On-device**.
