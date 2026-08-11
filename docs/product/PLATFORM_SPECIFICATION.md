# JobJitsu Platform Specification

> On-device. On-target. On your terms.

This document is the functional specification for **JobJitsu Core** — the H1 scope of the
product. It states what the shipped application does today, what H1 adds next, and the laws
every surface must obey. It describes **what**, not **how**.

Product shape:

- A local-first desktop application (Tauri shell, React renderer) for macOS, Windows, and Linux.
- The Agent prepares drafts on this device; the user owns every send.
- No JobJitsu cloud, account, or backend is required for core functionality.

This file states behavior only. Vision, principles, and voice live in the brand docs;
story-level acceptance criteria live in the backlog; system design lives in the
architecture docs.

Related documents: [non-goals](./NON_GOALS.md) ·
[architecture overview](../architecture/OVERVIEW.md) ·
[user stories](../backlog/USER_STORIES.md) ·
[brand guidelines](../brand/BRAND_GUIDELINES.md)

---

## Pipeline vocabulary

Applications move through a shared stage vocabulary:
`discover → curate → tailor → queue → approve → send → follow_up`.

Today the shell operates the middle of the pipeline (tailor, queue, approve, follow_up).
Discovery and send are planned (below). No surface may skip the approval gate on the way
to send.

---

## Current surfaces

Each view below ships today. Requirements are stated as contracts the implementation must
keep.

### Shell

- A side menu navigates between Craft, Applications, Queue, Follow-ups, Profile, Agent,
  Preferences, and Timeline; Onboarding replaces the shell on first run.
- The menu carries an Agent privacy pill reflecting readiness ("Agent · On-device" /
  "Agent · Ready" / "Agent · Unavailable").
- While Craft is preparing and the user is elsewhere, the shell shows one calm banner with
  an "Open Craft" action — no urgency styling.
- The renderer talks to the host only through the typed IPC bridge; it never imports or
  calls the AI provider directly.
- Failures surface as short, recoverable status lines ("Try again") announced through
  polite live regions; success is quiet confirmation. No blame, no blocking alarm states.

### Craft

- The user pastes a résumé, a job description, and optional company notes into a craft
  session owned by the host, so inputs and results survive navigation and view remounts.
- "Prepare" generates a résumé draft, a cover letter, or both through the local model. The
  UI publishes intent and renders progress; the host runs the model.
- Prepare begins by checking Agent readiness on this device; when no model is available,
  the user gets a plain next step instead of a stalled spinner.
- Actions that depend on the host (prepare, refine, save, export) disable while a job is
  running, so one craft session does one thing at a time.
- While preparing, a working view shows the phase checklist (checking Agent → résumé →
  cover letter), elapsed time, summaries of what was pasted, and device load (RAM / CPU)
  polled over IPC.
- Results land in three tabs — Résumé, Cover, Preview — and both drafts are editable in
  place.
- A refine chat targets either draft; each turn runs through the host Agent and the
  conversation is kept in the session.
- "Save" creates an application draft (company + role) that appears in Applications.
- Export writes the résumé to HTML or PDF as a local file. Export is not a send.

### Applications

- The user can create, list, and open application drafts with company, role, source URL,
  notes, résumé draft, cover letter draft, and an optional follow-up date with a draft
  note.
- Opening an existing draft loads every field for editing in place; saves confirm with
  quiet status text.
- Creating a draft that matches an existing company + role raises a duplicate warning; the
  user decides.
- Each application shows its pipeline stage and tracking status; the user moves drafts
  between stages explicitly (for example, mark ready for review).
- Tailor résumé and generate cover letter actions run through the host Agent against the
  selected application.
- Nothing in this view sends anything anywhere.

### Queue

- Lists applications at the `queue` stage — the calm check before approval.
- "Approve" moves the application to `approve` and confirms on-device: approved is not
  sent. There is no send action in the shell today.
- "Keep drafting" returns the application to `tailor`.
- Both outcomes confirm in words that nothing was sent.
- An empty queue explains how to mark an application ready for review, without pressure.

### Follow-ups

- Lists applications that have a follow-up date, sorted by date, labelled "Due" or
  "Scheduled".
- Shows the follow-up draft note alongside each reminder.
- "Clear reminder" removes the date and note. Scheduling and drafting happen in
  Applications.
- Reminders are local data only; JobJitsu never sends a follow-up for the user.

### Profile

- The user can keep multiple profiles and select the active one.
- Career paths can be created, updated, selected, and archived.
- Résumés import with a parse preview before anything is committed; imported résumés are
  kept as versions the user can list and select.
- All profile data lives on this device.

### Agent

- Shows readiness as privacy chrome ("Agent · On-device" / "Agent · Ready" /
  "Agent · Unavailable") plus the configured local model path.
- When no model is configured, it explains the next step and links to Preferences.
- Shows recent host activity as short human summaries — not raw event names.
- States the contract in plain words: Agent prepares; you own send.

### Preferences

- Data folder: view, change, pick via dialog, or reset the on-device data root.
- On-device model: set the model path and list models detected on this machine; when the
  models folder is missing or empty, the listing explains what to do in plain language.
- Approval before send: a toggle, on by default; turning it off is an explicit choice.
- Craft tone: a saved preference applied when preparing drafts.
- Appearance: dark or light theme; dark is the default.

### Timeline

- Shows this session's activity from host events: drafts created, stage changes, queue
  approvals and rejections, follow-ups scheduled or dismissed, preferences changes, model
  readiness, and résumé imports.
- Entries are human summaries with timestamps; the empty state is quiet, not nagging.
- Today the timeline is session-scoped; a durable local log is planned (below).

### Onboarding

- Runs on first launch only; completion (or skip) is persisted so it never nags again.
- Step one captures a display name into the profile; step two selects an on-device model
  from those detected on this machine.
- Every step can be skipped; the app is fully usable without finishing onboarding.

---

## Planned (H1, not yet built)

Each item below is in H1 scope and specified by its user stories; none of it exists in the
shell today.

- **Discovery** — a source registry plus a curated roles browse feeding the `discover` and
  `curate` stages.
- **Agent orchestration** — start/pause controls that let the Agent carry roles through
  drafting into the queue; pause leaves the queue intact.
- **Outbound send** — a dedicated send package behind the approval gate, governed by a
  `canSend` policy; the Agent can never call it on its own.
- **Egress audit** — every outbound send recorded on the timeline: what left, where it
  went, what stayed local.
- **Durable scheduler** — follow-up reminders that survive app restart.
- **Quiet-hours notifications** — local notifications that respect quiet hours and stay
  silent by default.
- **Sanitized logs view** — an inspectable local log with career content redacted.

---

## Non-functional laws

These hold for every surface, current and planned:

- **Local-first data** — profile, résumés, applications, preferences, and Agent context
  live on this device; nothing syncs to a JobJitsu cloud.
- **Deny-by-default IPC** — the renderer reaches the host only through explicitly allowed,
  typed commands.
- **Agent ≠ send** — the Agent prepares and queues; only an explicit user action crosses
  the outbound boundary.
- **No telemetry of career content** — résumé bodies, letters, and identity never leave in
  logs, crash reports, or analytics.
- **Calm UX** — no urgency theater, streaks, guilt copy, or pressure mechanics; see the
  [brand guidelines](../brand/BRAND_GUIDELINES.md).
- **Dark-mode-first** — dark theme is the default; light is a preference.

---

## Later horizons

H2 and beyond — noted so H1 stays honest, not specified here: broader discovery sources,
email and recruiter integrations, interview preparation, career analytics, and a plugin
marketplace for user-enabled skills. Anything that contradicts the
[non-goals](./NON_GOALS.md) is rejected regardless of horizon.
