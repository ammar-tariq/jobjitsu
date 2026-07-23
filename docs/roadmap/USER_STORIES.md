# JobJitsu User Stories (Roadmap Decomposition)

> Generated from the **documented** platform only — [PLATFORM_SPECIFICATION.md](../product/PLATFORM_SPECIFICATION.md),
> [FEATURES.md](../product/FEATURES.md), and architecture contracts.
>
> **Do not invent features.** Status labels (Core / Experimental / Future) gate commitment.
>
> **Delivery SSOT:** day-to-day execution IDs live in [../backlog/USER_STORIES.md](../backlog/USER_STORIES.md)
> (`E01`–`E19`) + [DEPENDENCY_GRAPH.md](../backlog/DEPENDENCY_GRAPH.md).
> This file is the **platform decomposition** (`PE*`). Keep both maps in sync via the coverage table below.
>
> **Review:** [STORIES_REVIEW.md](./STORIES_REVIEW.md) (Step 7 — implementation-ready).

**Architecture:** [../architecture/SYSTEM_ARCHITECTURE.md](../architecture/SYSTEM_ARCHITECTURE.md) · **Terms:** [../product/TERMINOLOGY.md](../product/TERMINOLOGY.md)

---

## Ownership (avoid duplicate work)

| Concern | Owner story | Not owner |
|---------|-------------|-----------|
| Career paths under identity | PE03-S05 | PE27-S01 (hard multi-identity only) |
| Post-import review & attach | PE03-S06 / PE03-S07 | Silent auto-commit to identity |
| AI parse after import | PE03-S10 (after PE05) | PE03-S06 manual review |
| Resume draft / tailor (no send) | PE03-S04 | PE06-S02 (orchestration only) |
| Cover letter draft | PE08-S02 | PE03-S04 |
| Enqueue into review Queue | PE06-S02 / PE09-S01 | AI Task Queue (PE16) |
| Career egress | PE10-* | Agent, discovery, plugins |
| Knowledge retrieval | PE14-S02 | PE05-S03 (optional port / no-op until PE14) |

## PE ↔ E coverage map

| PE epic | Backlog epics (delivery) | Notes |
|---------|--------------------------|-------|
| PE01 | E01, E03 | Shell + calm navigation |
| PE02 | E02 | Storage + events |
| PE03 | E04 | Identity / resumes |
| PE04 | E05 | Preferences / privacy chrome |
| PE05 | E06 | Local AI (Core only; remote = PE05-S04 Experimental) |
| PE06 | E12 | Agent preparative |
| PE07 | E07 | Discovery (local/CSV first) |
| PE08 | E08 | Applications |
| PE09 | E09 | Review Queue |
| PE10 | E10 | Send |
| PE11 | E11 | Follow-ups |
| PE12 | E13 | Timeline / trust |
| PE13 | E14 | Onboarding + empty states |
| PE14–PE20 | — | Experimental — admit backlog epics when prioritized |
| PE21 | E15 | Outcomes (Future) |
| PE22–PE24, PE27–PE30 | — | Future stubs |
| PE25 | E18 | Plugins |
| PE26 | E19 | Export + Host Extensions stub |

---

## Epic index

| Epic | Name | Feature status | Priority | Source (scoped) |
|------|------|----------------|----------|-----------------|
| [PE01](#pe01) | Desktop Shell & Foundation | Core · H1 | P0 | Shell, IA, Appearance, IPC |
| [PE02](#pe02) | Storage & Event Spine | Core · H1 | P0 | Local Storage, Event bus, Logging hook |
| [PE03](#pe03) | Identity & Resume Library | Core · H1 | P0 | Profile, Paths, Resume Library / Import / Versioning / Tailoring |
| [PE04](#pe04) | Preferences & Privacy Chrome | Core · H1 | P0 | Preferences, Approval, Quiet hours, Agent chrome |
| [PE05](#pe05) | Local Intelligence | Core · H1 | P0 | AI Provider, Context Builder, Model Manager, Offline |
| [PE06](#pe06) | Agent (preparative) | Core · H1 | P0 | Agent lifecycle → Queue (not Send) |
| [PE07](#pe07) | Discovery & Job Providers | Core · H1 | P1 | Providers (local/CSV), curation, browse; analysis advisory |
| [PE08](#pe08) | Applications & Pipeline | Core · H1 | P0 | Drafts, list/detail, cover letter, tracking |
| [PE09](#pe09) | Queue & Human Review | Core · H1 | P0 | Review Queue ≠ AI Task Queue |
| [PE10](#pe10) | Send (Egress Boundary) | Core · H1 | P0 | Sole egress; ADR 0009 |
| [PE11](#pe11) | Follow-ups & Scheduler | Core · H1 | P1 | Follow-ups, persist, dismiss/send under policy |
| [PE12](#pe12) | Timeline & Trust | Core · H1 | P0 | Activity Timeline; sanitized logs |
| [PE13](#pe13) | Onboarding & Empty States | Core · H1 | P1 | First-run + brand empty states |
| [PE14](#pe14) | Knowledge Base | Experimental | P1 | Career Knowledge Base |
| [PE15](#pe15) | AI Validation | Experimental | P1 | Validate Output pipeline |
| [PE16](#pe16) | Workflow Engine & AI Task Queue | Experimental | P1 | Workflow Planner & Engine; Task Queue |
| [PE17](#pe17) | Browser Automation Apply Assist | Experimental | P2 | Browser Automation |
| [PE18](#pe18) | Trusted Automation | Experimental | P2 | Automation Settings; TA event path |
| [PE19](#pe19) | AI Playground & Prompt Library | Experimental | P2 | Playground, Prompt Library |
| [PE20](#pe20) | Email Integration | Experimental | P2 | Email channel adapter |
| [PE21](#pe21) | Outcomes & Reflection | Future | P3 | FEATURES Future |
| [PE22](#pe22) | Interview Readiness | Future | P3 | Interview Agent |
| [PE23](#pe23) | Narrative Studio | Future | P3 | FEATURES Future |
| [PE24](#pe24) | Recruiter & Network Nudges | Future | P3 | Recruiter / LinkedIn Messaging |
| [PE25](#pe25) | Plugins (Agent Skills) | Future | P3 | Plugin Architecture |
| [PE26](#pe26) | Extensions & Portability | Future | P3 | Export + Host Extensions |
| [PE27](#pe27) | Multi-profile / Career Path | Future | P3 | FEATURES Future |
| [PE28](#pe28) | Role-fit compass | Future | P3 | FEATURES Future |
| [PE29](#pe29) | Offer & decision journal | Future | P3 | FEATURES Future |
| [PE30](#pe30) | Skills & learning map | Future | P3 | FEATURES Future |

---

## PE01

**Desktop Shell & Foundation** · Status: **Core · H1** · Priority: **P0**

### PE01-S01 — Launch desktop host

**Description:** As a user, I can open JobJitsu as a desktop app with calm chrome.

**Acceptance criteria:**
  - App launches to a main window titled JobJitsu.
  - Status region reserved for Agent · On-device.
  - No career data leaves the machine at launch (no Send).

**Dependencies:** None

**Priority:** P0

**Technical notes:** app host + ui; Tauri target / Vite-first per TAURI_TS_RUNTIME.

**Testing notes:** Smoke launch; no network egress assertions.

**Status:** proposed

### PE01-S02 — Navigate primary H1 sections

**Description:** As a user, I can move between Applications, Queue, Follow-ups, Agent, Preferences, Timeline.

**Acceptance criteria:**
  - Nav labels match TERMINOLOGY (Applications not Pipeline; Queue ≠ AI Task Queue).
  - Destinations present: Applications, Queue, Follow-ups, Agent, Preferences, Timeline.
  - One primary view at a time; keyboard focus visible.

**Dependencies:** PE01-S01

**Priority:** P0

**Technical notes:** DESKTOP_ARCHITECTURE IA.

**Testing notes:** Nav a11y + keyboard smoke.

**Status:** proposed

### PE01-S03 — Deny-by-default IPC

**Description:** As the platform, UI can only call allowlisted host commands.

**Acceptance criteria:**
  - Unknown commands fail closed.
  - UI cannot invoke AI Provider complete/embed.
  - No raw filesystem from renderer.

**Dependencies:** PE01-S01

**Priority:** P0

**Technical notes:** ADR 0013; DESKTOP IPC catalog.

**Testing notes:** Contract test deny path.

**Status:** proposed

### PE01-S04 — Dark-default appearance

**Description:** As a user, the shell defaults to a calm dark theme and remembers Appearance.

**Acceptance criteria:**
  - Dark default on first launch.
  - Appearance preference persists across restart.
  - Primary text meets WCAG AA on default theme.

**Dependencies:** PE01-S01

**Priority:** P1

**Technical notes:** FEATURES Appearance; design tokens; backlog E01/E03-F03.

**Testing notes:** Theme persist + contrast smoke.

**Status:** proposed

## PE02

**Storage & Event Spine** · Status: **Core · H1** · Priority: **P0**

### PE02-S01 — Persist documents on-device

**Description:** As the host, I can store profile/application docs under the user data dir.

**Acceptance criteria:**
  - Data survives restart.
  - No default cloud object store.
  - Temp-dir unit tests pass.

**Dependencies:** PE01-S01

**Priority:** P0

**Technical notes:** packages/storage; ADR 0006.

**Testing notes:** Integration restart test.

**Status:** proposed

### PE02-S02 — Typed local event bus

**Description:** As packages, we publish/subscribe Domain.Action events in-process.

**Acceptance criteria:**
  - Catalog names from EVENT_SYSTEM.
  - No network I/O on the bus.
  - Progress payloads PII-minimized (ids/counts, not bodies).

**Dependencies:** PE01-S01

**Priority:** P0

**Technical notes:** packages/events; independent of durable storage.

**Testing notes:** Pub/sub unit tests.

**Status:** proposed

### PE02-S03 — Durable event hook

**Description:** As Timeline, I can persist the durable allowlist.

**Acceptance criteria:**
  - Allowlist includes Send outcomes, Queue approve/reject, Agent.Paused, Preferences.Changed.
  - Default sink is no-op until Timeline package wires it.
  - Hook does not perform network I/O.

**Dependencies:** PE02-S02

**Priority:** P1

**Technical notes:** DURABLE_EVENT_NAMES.

**Testing notes:** Callback invocation test.

**Status:** proposed

## PE03

**Identity & Resume Library** · Status: **Core · H1** · Priority: **P0**

One **identity** (e.g. Ammar Tariq) with optional **paths** (Fullstack Developer, Mobile App).
Import → review/edit → attach. AI parse is **PE03-S10** (after Local Intelligence).

### PE03-S01 — Maintain local profile

**Description:** As a user, I can create and edit my on-device profile.

**Acceptance criteria:**
  - Profile fields persist locally.
  - UI never implies JobJitsu cloud sync.
  - Updates go through identity public APIs (not UI→storage).

**Dependencies:** PE02-S01

**Priority:** P0

**Technical notes:** DATA_MODELS Profile; identity package.

**Testing notes:** CRUD unit tests.

**Status:** done (2026-07-23)

### PE03-S02 — Import resume into Resume Library

**Description:** As a user, I can import a resume file into the local library.

**Acceptance criteria:**
  - Resume.Imported emitted (id only).
  - Version stored with label.
  - Import failure is calm and recoverable.

**Dependencies:** PE03-S01

**Priority:** P0

**Technical notes:** Resume Import.

**Testing notes:** Fixture import test.

**Status:** done (2026-07-23)

### PE03-S03 — Version and select resumes

**Description:** As a user, I can keep multiple resume versions and pick one for an application.

**Acceptance criteria:**
  - Multiple versions listable via identity public surface.
  - Parent/child version refs optional.
  - Selecting a version does not send anything.

**Dependencies:** PE03-S02

**Priority:** P1

**Technical notes:** Resume Versioning.

**Testing notes:** Version graph unit test.

**Status:** done (2026-07-23)

### PE03-S04 — Tailor resume draft (no send)

**Description:** As a user, I can request a tailored resume **draft** for a job without sending anything.

**Acceptance criteria:**
  - Uses Context Builder + AI Provider.
  - Output is a draft/version; user remains author.
  - Does not call Send; does not enqueue (enqueue is PE06-S02 / PE09).
  - May create or update a path résumé only after user review (same authorship rule as PE03-S06).

**Dependencies:** PE03-S02, PE05-S01, PE05-S03

**Priority:** P0

**Technical notes:** Resume Tailoring; ownership: draft only; wave after PE05 (not before paths attach).

**Testing notes:** Fence test agent/AI ↛ send.

**Status:** proposed · after PE05

### PE03-S05 — Maintain career paths under identity

**Description:** As a user, I can create local **paths** under my profile (e.g. Fullstack Developer, Mobile App) without creating separate accounts.

**Acceptance criteria:**
  - Identity remains one person; paths are children (name + optional notes).
  - Create / rename / archive path; all local-only; UI never implies cloud sync.
  - Active path is selectable; switching path does not send anything.
  - Chrome uses **Path** (not “sub-profile”).

**Dependencies:** PE03-S01

**Priority:** P0

**Technical notes:** Extend identity DATA_MODELS; façade + IPC; Preferences or Identity view.

**Testing notes:** Paths stay on device; select ≠ send.

**Status:** done (2026-07-23)

### PE03-S06 — Review and edit after every import

**Description:** As a user, after I import a résumé (or LinkedIn PDF), I always land on a calm **review & edit** step before anything is attached.

**Acceptance criteria:**
  - Import never auto-commits to identity or a path without this step.
  - User can edit label + structured fields available without AI (at minimum: display name, contact, free-text body / notes; raw file kept).
  - Partial/empty fields are honest; no fake completeness.
  - Cancel leaves library unchanged (or only a discarded draft — one rule, documented).
  - No LLM/parse required; file stored as version source.

**Dependencies:** PE03-S02

**Priority:** P0

**Technical notes:** Post-import UI; host owns storage; UI via IPC only.

**Testing notes:** Import → edit → cancel does not attach; UI never imports `@jobjitsu/ai`.

**Status:** proposed

### PE03-S07 — Attach reviewed import to identity and/or path

**Description:** As a user, after editing an import I can attach it to my profile, a path, or both.

**Acceptance criteria:**
  - Choices: **Update identity** · **Save to path** (pick or create) · **Both**.
  - First-run default may suggest identity + create first path; later imports default to path (do not silently overwrite identity).
  - Attach emits clear local events (ids only); never outbound.
  - Selecting the new path résumé does not send.

**Dependencies:** PE03-S05, PE03-S06, PE03-S03

**Priority:** P0

**Technical notes:** Wire Resume Library versions to `pathId`; identity patch from allowlisted fields only.

**Testing notes:** Attach to path only leaves identity unchanged; both updates both.

**Status:** proposed

### PE03-S08 — Import LinkedIn via exported PDF

**Description:** As a user, I can import a LinkedIn profile by exporting it as PDF and choosing that file — with clear in-app guidance.

**Acceptance criteria:**
  - Same import → review → attach pipeline as résumé files.
  - UI shows calm steps to export LinkedIn as PDF (no scraping, no LinkedIn login, no API).
  - Failure/cancel copy is recoverable; never pressure.
  - Source label distinguishes `linkedin-pdf` vs résumé when stored.

**Dependencies:** PE03-S06

**Priority:** P1

**Technical notes:** Brand EMPTY_STATES / onboarding copy; ToS-safe.

**Testing notes:** Guidance visible; import path reuses library APIs.

**Status:** proposed

### PE03-S09 — Create a path from an existing résumé version

**Description:** As a user, I can create a new path (e.g. Mobile App) by attaching an existing library version — without generating text.

**Acceptance criteria:**
  - Pick existing version → create/name path → set as that path’s selected résumé.
  - Does not call AI; does not send.
  - User can still edit metadata before confirm.

**Dependencies:** PE03-S05, PE03-S03

**Priority:** P1

**Technical notes:** Thin UI over PE03-S05 / PE03-S07.

**Testing notes:** New path points at chosen version id.

**Status:** proposed

### PE03-S10 — AI parse import into structured fields

**Description:** As a user, after Agent/runtime is available, import review can be **pre-filled** by on-device parse — still editable before attach.

**Acceptance criteria:**
  - Parse runs only via host AI; UI never imports `@jobjitsu/ai`.
  - Pre-fill is a draft; PE03-S06 edit remains mandatory before attach.
  - Unavailable Agent → calm fallback to manual edit (PE03-S06); no guilt.
  - Chrome stays honest (Agent · On-device only when local).
  - Does not send; does not auto-attach.

**Dependencies:** PE03-S06, PE05-S01, PE05-S03

**Priority:** P0

**Technical notes:** Block until Local Intelligence; fence UI↛AI.

**Testing notes:** With AI stub: fields pre-filled; without: manual path works.

**Status:** deferred · after PE05

## PE04

**Preferences & Privacy Chrome** · Status: **Core · H1** · Priority: **P0**

### PE04-S01 — Set approval-before-send default on

**Description:** As a user, approval-before-send is on by default and editable in Preferences.

**Acceptance criteria:**
  - Default on for new installs.
  - Preferences.Changed emitted on edit.
  - config store SSOT; preferences façade only.

**Dependencies:** PE02-S01

**Priority:** P0

**Technical notes:** PACKAGE_BOUNDARIES preferences.

**Testing notes:** Default policy unit test.

**Status:** done (2026-07-23)

### PE04-S02 — Quiet hours and calm notifications

**Description:** As a user, I can set quiet hours so nudges do not interrupt.

**Acceptance criteria:**
  - Quiet-hours fields persist in Preferences.
  - When PE11 scheduler is active, due nudges respect quiet hours.
  - No urgency / streak / guilt copy.

**Dependencies:** PE04-S01

**Priority:** P1

**Technical notes:** Enforced with PE11; fields ship with prefs.

**Testing notes:** Persist + quiet-hours unit test.

**Status:** proposed

### PE04-S03 — Show Agent · On-device status

**Description:** As a user, I always see honest Agent · On-device chrome when local.

**Acceptance criteria:**
  - Never default label “Local LLM” in status bar.
  - Unavailable/ready states shown calmly before a model is configured.
  - Remote provider (if configured later) never uses Agent · On-device.

**Dependencies:** PE01-S01

**Priority:** P0

**Technical notes:** TERMINOLOGY; shell maps `ai.getStatus` + `Ai.LocalModel*` (no UI→AI imports).

**Testing notes:** Badge semantics UI test.

**Status:** done (2026-07-23)

### PE04-S04 — Fit, tone, and constraint preferences

**Description:** As a user, I can set fit rules, tone, and constraints that guide curation and Agent work.

**Acceptance criteria:**
  - Fit / tone / constraint fields persist locally.
  - Preferences.Changed emitted on save.
  - Copy never invents urgency to override user rules.
  - Values readable by discovery curation and Agent (no UI→AI).

**Dependencies:** PE04-S01

**Priority:** P0

**Technical notes:** FEATURES Preferences; backlog E05.

**Testing notes:** Persist + read via preferences façade.

**Status:** done (2026-07-23)

### PE04-S05 — Show and change on-device data folder

**Description:** As a user, I can see where JobJitsu stores my data and choose a different folder on this device.

**Acceptance criteria:**
  - Preferences shows the current data folder and the platform default.
  - Changing the folder goes through host storage APIs (not UI→storage).
  - Native folder picker is available in the desktop app (`storage.pickDataRoot`); typed path remains as fallback.
  - Restore default is available.
  - Preferences.Changed emits with `dataRoot` on change.
  - Copy never implies a JobJitsu cloud.

**Dependencies:** PE02-S01

**Priority:** P0

**Technical notes:** Trust surface for backup / encrypted volumes; Tauri dialog plugin for pick; typed path fallback in browser/dev.

**Testing notes:** Default path + set/reset/pick IPC and Preferences UI (Choose folder stub).

**Status:** done (2026-07-23)

### PE04-S06 — Persist career data under on-device data folder

**Description:** As a user, when I choose a data folder, JobJitsu saves my profile, resumes, and preferences as files there so I can inspect and back them up.

**Acceptance criteria:**
  - Desktop host opens on-device storage under the active data root (`kv/` + `blobs/`).
  - Profile and resume import survive process restart under that folder.
  - Preferences settings persist under the same root.
  - Custom-folder pointer is stored under the platform default root (`config/data-root.json`), not inside the custom folder alone.
  - Changing/picking/resetting the folder rebinds durable stores via host IPC (UI never talks to FS).
  - Shell does not import Node FS from `@jobjitsu/storage/node`.
  - Copy never implies a JobJitsu cloud.

**Dependencies:** PE04-S05, PE02-S01, PE03-S02

**Priority:** P0

**Technical notes:** Injectable `LocalFsIo` (Node tests / Tauri desktop); restore `storage.pickDataRoot` if merge-lost.

**Testing notes:** Temp-dir restart + custom-folder rebind tests; IPC pick/set/reset.

**Status:** done (2026-07-23)

## PE05

**Local Intelligence** · Status: **Core · H1** · Priority: **P0**

> **Core scope:** local provider, Context Builder, model path, offline-first.
> Optional remote provider is **Experimental** — see PE05-S04 (not an H1 gate).

### PE05-S01 — AI Provider health and complete

**Description:** As the host, I can run complete/health against a local AI Provider.

**Acceptance criteria:**
  - Provider interface: health / complete / (optional embed).
  - No silent cloud fallback.
  - Ai.LocalModelReady | Ai.LocalModelFailed (or equivalent catalog names) for readiness.

**Dependencies:** PE02-S02

**Priority:** P0

**Technical notes:** AI_ARCHITECTURE; packages/ai. UI never calls provider.

**Testing notes:** Fake provider contract tests.

**Status:** proposed

### PE05-S02 — Configure local model path

**Description:** As a user, I can point JobJitsu at my on-device model path.

**Acceptance criteria:**
  - Misconfigured path → failed readiness + recovery path to Preferences.
  - Models load lazily (not at shell launch).

**Dependencies:** PE05-S01, PE04-S01

**Priority:** P0

**Technical notes:** Model Manager in packages/ai.

**Testing notes:** Misconfig recovery test.

**Status:** proposed

### PE05-S03 — Context Builder minimizes prompt context

**Description:** As the platform, prompts include only task-needed slices.

**Acceptance criteria:**
  - Profile → Resume → … → Current Job budgeted by task.
  - No full Timeline dump into prompts.
  - KnowledgeReader port may be a no-op until PE14; Core does not require Knowledge Base.

**Dependencies:** PE05-S01, PE03-S01

**Priority:** P0

**Technical notes:** Context Builder contract; PE14 wires real KnowledgeReader.

**Testing notes:** Minimization unit test.

**Status:** proposed

### PE05-S04 — Optional remote AI Provider (Experimental)

**Description:** As a user, I may configure a remote AI Provider with my own keys.

**Acceptance criteria:**
  - Feature status **Experimental** — not required for Core H1.
  - Never shown as Agent · On-device.
  - Keys stored as local secrets only; no JobJitsu cloud account.

**Dependencies:** PE05-S01

**Priority:** P2

**Technical notes:** User-Owned API Keys; FEATURES Experimental. Not nested as Core commitment.

**Testing notes:** Chrome honesty test.

**Status:** proposed · Experimental

### PE05-S05 — Offline / local-primary path

**Description:** As a user, local AI work continues without requiring network.

**Acceptance criteria:**
  - Local provider health/complete works with network disabled in tests.
  - No silent fallback to remote when local fails.
  - Failure copy is calm and points to Preferences / model path.

**Dependencies:** PE05-S01

**Priority:** P0

**Technical notes:** Offline Strategy; ENGINEERING_CONSTITUTION testing offline AC.

**Testing notes:** Offline / no-network provider test.

**Status:** proposed

## PE06

**Agent (preparative)** · Status: **Core · H1** · Priority: **P0**

### PE06-S01 — Start and pause agent work

**Description:** As a user, I can start preparative work and pause anytime.

**Acceptance criteria:**
  - Agent.Started / Agent.Paused emitted.
  - Pause leaves review Queue intact.
  - Idle microcopy calm (e.g. belt tied / waiting) — no urgency.

**Dependencies:** PE04-S01, PE05-S01

**Priority:** P0

**Technical notes:** packages/agent; never imports send.

**Testing notes:** Fence + pause tests.

**Status:** proposed

### PE06-S02 — Orchestrate drafts into review Queue

**Description:** As a user, the agent can orchestrate preparative drafts into the review Queue without sending.

**Acceptance criteria:**
  - After successful prep, Queue.Enqueued (via queue package).
  - No Send.Attempted / Send.Succeeded.
  - Progress batched calmly (ids/counts).
  - Does not own resume/cover letter generation APIs (PE03-S04 / PE08-S02).

**Dependencies:** PE06-S01, PE08-S01, PE09-S01

**Priority:** P0

**Technical notes:** SYSTEM_ARCHITECTURE sequence 4.1; ownership = orchestration.

**Testing notes:** Integration cascade; fence agent ↛ send.

**Status:** proposed

## PE07

**Discovery & Job Providers** · Status: **Core · H1** · Priority: **P1**

> **H1 scope:** Job Provider contract, local/CSV/fixture first, curation, browse/select.
> Search Profiles sync, Match Score productization, and feed-like sync loops are **out of H1**
> (document in PLATFORM_SPEC; schedule as Experimental when admitted).

### PE07-S01 — Register a Job Provider source

**Description:** As the platform, I can register a discovery Source / Job Provider.

**Acceptance criteria:**
  - list / sync / normalizeRole contract.
  - First source may be local / CSV / fixture.
  - Discovery.RolesFound emitted (counts/ids).

**Dependencies:** PE02-S02

**Priority:** P0

**Technical notes:** PACKAGE_BOUNDARIES discovery.

**Testing notes:** Fake source unit test.

**Status:** proposed

### PE07-S02 — Curate roles toward fit

**Description:** As a user, roles are filtered toward fit using my preferences — not a vanity feed.

**Acceptance criteria:**
  - Discovery.RolesCurated emitted.
  - Filters honor PE04-S04 fit/constraints when set.
  - Zero matches → calm empty (no infinite-scroll vanity).

**Dependencies:** PE07-S01, PE04-S04

**Priority:** P1

**Technical notes:** NON_GOALS volume.

**Testing notes:** Curation unit test with prefs fixture.

**Status:** proposed

### PE07-S03 — Analyze job vs profile (local)

**Description:** As a user, I can request a job analysis grounded in my profile.

**Acceptance criteria:**
  - Uses Context Builder + local AI Provider.
  - Output is advisory; no guaranteed-hire claims.
  - Does not call Send.

**Dependencies:** PE07-S01, PE05-S03

**Priority:** P1

**Technical notes:** Job Analysis; advisory only.

**Testing notes:** Honest-copy + no-send assertion.

**Status:** proposed

### PE07-S04 — Browse and select curated roles

**Description:** As a user, I can browse curated roles and start an application draft from one.

**Acceptance criteria:**
  - List shows at least title and company.
  - Selecting a role offers a calm CTA to create/open an application draft.
  - CTA does not send or enqueue by itself.

**Dependencies:** PE07-S02

**Priority:** P1

**Technical notes:** backlog E07-F04; draft creation PE08-S01.

**Testing notes:** List + select interaction test.

**Status:** proposed

## PE08

**Applications & Pipeline** · Status: **Core · H1** · Priority: **P0**

### PE08-S01 — Create and edit application drafts

**Description:** As a user, I can create application drafts linked to resumes (and optionally roles).

**Acceptance criteria:**
  - Application.DraftCreated emitted.
  - Stages follow DATA_MODELS mapping.
  - Duplicate soft-warn when identity keys match.
  - Role may be fixture/manual; Job Provider not required for a draft.

**Dependencies:** PE03-S02

**Priority:** P0

**Technical notes:** applications package; PE07 optional for curated path.

**Testing notes:** CRUD + duplicate test.

**Status:** proposed

### PE08-S02 — Generate cover letter draft

**Description:** As a user, I can generate a cover letter draft for an application.

**Acceptance criteria:**
  - Uses AI Provider + Context Builder.
  - User can edit before queue/send.
  - No auto-send; no auto-enqueue without explicit path.

**Dependencies:** PE08-S01, PE05-S01

**Priority:** P1

**Technical notes:** Cover Letter Intelligence; ownership: letter draft.

**Testing notes:** Draft-only assertion.

**Status:** proposed

### PE08-S03 — Track application status post-send

**Description:** As a user, I can update tracking status (Submitted → … → Archived).

**Acceptance criteria:**
  - Application.StageChanged emitted.
  - Tracking stages ≠ prep pipeline stages (see DATA_MODELS map).

**Dependencies:** PE08-S01, PE10-S01

**Priority:** P1

**Technical notes:** DATA_MODELS pipeline map.

**Testing notes:** Stage transition unit test.

**Status:** proposed

### PE08-S04 — List and open applications

**Description:** As a user, I can list applications and open a detail view.

**Acceptance criteria:**
  - List shows status/stage label per item.
  - Detail shows draft content + metadata.
  - Empty list uses calm empty state (PE13-S02).

**Dependencies:** PE08-S01

**Priority:** P0

**Technical notes:** backlog E08-F03.

**Testing notes:** List/detail UI test.

**Status:** proposed

## PE09

**Queue & Human Review** · Status: **Core · H1** · Priority: **P0**

### PE09-S01 — Enqueue application for review

**Description:** As the agent or user, I can enqueue an application awaiting approval.

**Acceptance criteria:**
  - Queue.Enqueued emitted.
  - Item visible in Queue view.
  - Distinct from AI Task Queue (copy + package).

**Dependencies:** PE08-S01

**Priority:** P0

**Technical notes:** packages/queue.

**Testing notes:** Enqueue unit test.

**Status:** proposed

### PE09-S02 — Approve or reject queue items

**Description:** As a user, I can approve or reject queued items calmly.

**Acceptance criteria:**
  - Queue.Approved / Queue.Rejected emitted.
  - Reject does not send.
  - When approval-before-send is on, Send requires prior approval.

**Dependencies:** PE09-S01, PE04-S01

**Priority:** P0

**Technical notes:** EVENT_SYSTEM sovereignty AC.

**Testing notes:** Policy gate test.

**Status:** proposed

## PE10

**Send (Egress Boundary)** · Status: **Core · H1** · Priority: **P0**

### PE10-S01 — Send only through send package (first channel stub)

**Description:** As the platform, career payloads leave only via Send after policy checks, using a first stub channel.

**Acceptance criteria:**
  - `send.approveAndSend` (or catalog equivalent) is the UI egress command.
  - Agent cannot import send (fence).
  - First channel stub: file export and/or mailto (honest outcome).
  - Outcomes: success | failed | unknown — never lie success.

**Dependencies:** PE09-S02

**Priority:** P0

**Technical notes:** SendChannel contract; merges prior stub-channel story.

**Testing notes:** Fence + outcome tests; stub channel integration.

**Status:** proposed

### PE10-S02 — Audit egress on Timeline

**Description:** As a user, I can see what left the machine.

**Acceptance criteria:**
  - Privacy.EgressRecorded / EgressRecord fields populated.
  - Application.Submitted on success path only.
  - Unknown never shown as success in Timeline.

**Dependencies:** PE10-S01, PE12-S01

**Priority:** P0

**Technical notes:** DATA_MODELS EgressRecord.

**Testing notes:** Timeline integration test.

**Status:** proposed

## PE11

**Follow-ups & Scheduler** · Status: **Core · H1** · Priority: **P1**

### PE11-S01 — Schedule a polite follow-up

**Description:** As a user, I can schedule a follow-up for a submitted application.

**Acceptance criteria:**
  - FollowUp.Scheduled emitted.
  - Due time stored locally.
  - No guilt / streak framing.

**Dependencies:** PE08-S03, PE02-S01

**Priority:** P1

**Technical notes:** packages/scheduler; SCHEDULER laws.

**Testing notes:** Schedule unit test.

**Status:** proposed

### PE11-S02 — Receive calm due notification

**Description:** As a user, I get a calm nudge when a follow-up is due (outside quiet hours).

**Acceptance criteria:**
  - FollowUp.Due (or equivalent) when due.
  - Quiet hours from PE04-S02 respected.
  - Notification copy is invitational, not urgent.

**Dependencies:** PE11-S01, PE04-S02

**Priority:** P1

**Technical notes:** Scheduler + prefs.

**Testing notes:** Due + quiet-hours test.

**Status:** proposed

### PE11-S03 — Scheduler survives restart

**Description:** As a user, scheduled follow-ups survive app restart.

**Acceptance criteria:**
  - Jobs persist in storage.
  - After restart, due jobs are detectable (time-travel / clock inject in tests).

**Dependencies:** PE11-S01

**Priority:** P1

**Technical notes:** backlog E11-F02.

**Testing notes:** Restart + time-travel test.

**Status:** proposed

### PE11-S04 — Dismiss or send follow-up under policy

**Description:** As a user, I can dismiss/snooze a due follow-up or send under the same approval path as other egress.

**Acceptance criteria:**
  - Dismiss / snooze does not send.
  - Send path goes Queue → Send (or equivalent policy) with approval-before-send honored.
  - Agent cannot bypass send.

**Dependencies:** PE11-S02, PE09-S02, PE10-S01

**Priority:** P1

**Technical notes:** backlog E11-F04; sovereignty.

**Testing notes:** Dismiss vs send policy test.

**Status:** proposed

## PE12

**Timeline & Trust** · Status: **Core · H1** · Priority: **P0**

### PE12-S01 — Inspect local timeline

**Description:** As a user, I can inspect a local activity timeline of meaningful events.

**Acceptance criteria:**
  - Durable allowlist events appear after actions (approve, send, pause, prefs).
  - Timeline is local-only; no analytics SaaS.
  - Entries are calm and scannable.

**Dependencies:** PE02-S03

**Priority:** P0

**Technical notes:** Activity Timeline; packages/timeline.

**Testing notes:** Persist + list integration.

**Status:** proposed

### PE12-S02 — Sanitized logs view

**Description:** As a user, I can open a sanitized logs view for trust/debug without dumping secrets.

**Acceptance criteria:**
  - Secrets redacted.
  - No full resume bodies in default log lines.
  - Export of logs (if any) is explicit user action.

**Dependencies:** PE12-S01

**Priority:** P1

**Technical notes:** Logging / trust UI.

**Testing notes:** Redaction unit test.

**Status:** proposed

## PE13

**Onboarding & Empty States** · Status: **Core · H1** · Priority: **P1**

### PE13-S01 — Complete calm first-run onboarding

**Description:** As a new user, I can complete first-run onboarding without pressure.

**Acceptance criteria:**
  - Steps cover: create identity → import résumé **or** LinkedIn PDF → review/edit → create first path → approval-before-send explanation.
  - Agent · On-device chrome visible during onboarding.
  - No forced model download wall; model config and AI parse can wait (PE03-S10).
  - Skippable where safe; no guilt copy.

**Dependencies:** PE04-S01, PE03-S07, PE04-S03

**Priority:** P1

**Technical notes:** brand EMPTY_STATES; no PE05-S02 hard gate.

**Testing notes:** First-run path UI test.

**Status:** proposed

### PE13-S02 — Calm empty states for primary lists

**Description:** As a user, empty Applications / Queue / Follow-ups screens invite one next step.

**Acceptance criteria:**
  - Each empty state has one headline, one short sentence, one primary CTA.
  - Copy matches brand empty-state tone (no shame).
  - CTAs route to create draft / start agent / schedule — not send.

**Dependencies:** PE01-S02

**Priority:** P1

**Technical notes:** brand EMPTY_STATES; backlog E14-F02.

**Testing notes:** Empty-state snapshot / copy review.

**Status:** proposed

---

## PE14

**Knowledge Base** · Status: **Experimental** · Priority: **P1**

### PE14-S01 — Store knowledge entries locally

**Description:** As a user, I can store career knowledge entries on-device.

**Acceptance criteria:**
  - Entries persist locally.
  - No JobJitsu cloud sync implied.
  - CRUD via knowledge public surface.

**Dependencies:** PE02-S01

**Priority:** P1

**Technical notes:** Career Knowledge Base; Experimental.

**Testing notes:** CRUD unit test.

**Status:** proposed · Experimental

### PE14-S02 — Retrieve knowledge into Context Builder

**Description:** As the platform, Context Builder can read knowledge via KnowledgeReader.

**Acceptance criteria:**
  - KnowledgeReader returns budgeted slices for a task.
  - Default still minimizes; no full dump.
  - Write path remains outside Context Builder.

**Dependencies:** PE14-S01, PE05-S03

**Priority:** P1

**Technical notes:** Wires port left no-op in Core PE05-S03.

**Testing notes:** Retrieval budget unit test.

**Status:** proposed · Experimental

## PE15

**AI Validation** · Status: **Experimental** · Priority: **P1**

### PE15-S01 — Validate generated resume before queue

**Description:** As a user, I can run Formatting → ATS → Missing skills checks before enqueue.

**Acceptance criteria:**
  - Pipeline order documented in WORKFLOW_ENGINE.
  - Results are advisory; user decides.
  - Validation does not send.

**Dependencies:** PE03-S04, PE05-S01

**Priority:** P1

**Technical notes:** Validate Output; Experimental.

**Testing notes:** Pipeline order unit test.

**Status:** proposed · Experimental

## PE16

**Workflow Engine & AI Task Queue** · Status: **Experimental** · Priority: **P1**

### PE16-S01 — Start Application Workflow through Wait for Approval

**Description:** As a user, I can start an Application Workflow that prepares materials and stops at Wait for Approval.

**Acceptance criteria:**
  - Steps run through Wait for Approval (review Queue).
  - Does not call Send; user owns Send after approve.
  - WorkflowRun record persisted locally.

**Dependencies:** PE06-S01, PE08-S01, PE09-S01

**Priority:** P1

**Technical notes:** WORKFLOW_ENGINE; ends at Queue — not PE10.

**Testing notes:** Workflow ends-at-queue integration.

**Status:** proposed · Experimental

### PE16-S02 — Inspect AI Task Queue progress

**Description:** As a user, I can inspect AI Task Queue states (Pending…Cancelled) calmly.

**Acceptance criteria:**
  - Distinct UI noun from review Queue.
  - Progress is calm (no fake precision).
  - Cancel leaves drafts inspectable where safe.

**Dependencies:** PE16-S01

**Priority:** P1

**Technical notes:** AI Task Queue ≠ review Queue.

**Testing notes:** State machine unit test.

**Status:** proposed · Experimental

### PE16-S03 — Workflow step runners and unload

**Description:** As the platform, individual Workflow steps run via runners and unload resources on cleanup.

**Acceptance criteria:**
  - Step runners are testable units.
  - Cleanup unloads model/resources per Resource Management.
  - Failure of one step does not silently call Send.

**Dependencies:** PE16-S01, PE05-S01

**Priority:** P1

**Technical notes:** Split from oversized PE16-S01; WORKFLOW_ENGINE.

**Testing notes:** Runner + unload unit tests.

**Status:** proposed · Experimental

## PE17

**Browser Automation Apply Assist** · Status: **Experimental** · Priority: **P2**

### PE17-S01 — Prepare automation without egress

**Description:** As a user, browser automation may prepare fills without submitting for me by default.

**Acceptance criteria:**
  - Default does not submit forms.
  - User remains author of submit.
  - Experimental labeling in UI.

**Dependencies:** PE08-S01, PE04-S01

**Priority:** P2

**Technical notes:** Browser Automation; not Trusted Automation.

**Testing notes:** No-submit default test.

**Status:** proposed · Experimental

## PE18

**Trusted Automation** · Status: **Experimental** · Priority: **P2**

### PE18-S01 — Enable Trusted Automation default off

**Description:** As a user, I can opt into Trusted Automation (default off) with explicit policy.

**Acceptance criteria:**
  - Default off.
  - TA path emits required events per EVENT_SYSTEM.
  - Still cannot bypass Send package fences where Send is used.

**Dependencies:** PE10-S01, PE04-S01

**Priority:** P2

**Technical notes:** Automation Settings; TA event path.

**Testing notes:** Default-off + event path test.

**Status:** proposed · Experimental

## PE19

**AI Playground & Prompt Library** · Status: **Experimental** · Priority: **P2**

### PE19-S01 — Experiment with prompts without affecting production Workflows

**Description:** As a user, I can try prompts in a playground without mutating production Workflow runs.

**Acceptance criteria:**
  - Playground isolated from production WorkflowRun state.
  - Prompt Library entries local-only.
  - Experimental labeling.

**Dependencies:** PE05-S01

**Priority:** P2

**Technical notes:** AI Playground; Prompt Library.

**Testing notes:** Isolation test.

**Status:** proposed · Experimental

## PE20

**Email Integration** · Status: **Experimental** · Priority: **P2**

### PE20-S01 — Sync email via channel adapter (opt-in)

**Description:** As a user, I can opt into email sync via a channel adapter I control.

**Acceptance criteria:**
  - Opt-in only; no JobJitsu mail cloud.
  - Classification/draft replies stay local drafts.
  - Send still goes through send policy for outbound career mail.

**Dependencies:** PE10-S01, PE04-S01

**Priority:** P2

**Technical notes:** Email Integration; channel adapter.

**Testing notes:** Opt-in + no auto-send test.

**Status:** proposed · Experimental

---

## PE21

**Outcomes & Reflection** · Status: **Future** · Priority: **P3**

### PE21-S01 — Record application outcome without guilt metrics

**Description:** As a user, I can record outcomes locally without vanity dashboards.

**Acceptance criteria:**
  - Outcome stored locally and linkable to an application id.
  - No streak / guilt / leaderboard UX.
  - No JobJitsu cloud analytics.

**Dependencies:** PE08-S03

**Priority:** P3

**Technical notes:** FEATURES Future; backlog E15.

**Testing notes:** Persist + copy review.

**Status:** deferred · Future

## PE22

**Interview Readiness** · Status: **Future** · Priority: **P3**

### PE22-S01 — Practice interview prep locally

**Description:** As a user, I can practice interview prep on-device.

**Acceptance criteria:**
  - Content stays local.
  - No guaranteed-offer claims.
  - Deferred until Core H1 stable.

**Dependencies:** PE05-S01, PE03-S01

**Priority:** P3

**Technical notes:** Interview Agent; Future.

**Testing notes:** Deferred stub — AC locked when admitted.

**Status:** deferred · Future

## PE23

**Narrative Studio** · Status: **Future** · Priority: **P3**

### PE23-S01 — Keep story consistent across materials

**Description:** As a user, I can keep narrative consistency across materials locally.

**Acceptance criteria:**
  - Local drafts only.
  - No auto-publish to networks.
  - Deferred stub.

**Dependencies:** PE03-S01

**Priority:** P3

**Technical notes:** FEATURES Future.

**Testing notes:** Deferred.

**Status:** deferred · Future

## PE24

**Recruiter & Network Nudges** · Status: **Future** · Priority: **P3**

### PE24-S01 — Track recruiter relationships locally

**Description:** As a user, I can track recruiter relationships on-device.

**Acceptance criteria:**
  - Local records only.
  - Nudges calm; no spam automation by default.
  - Deferred stub.

**Dependencies:** PE02-S01

**Priority:** P3

**Technical notes:** Recruiter Management; LinkedIn Messaging Future.

**Testing notes:** Deferred.

**Status:** deferred · Future

## PE25

**Plugins (Agent Skills)** · Status: **Future** · Priority: **P3**

### PE25-S01 — Enable an official sample plugin skill

**Description:** As a user, I can enable an official sample plugin (Agent Skill) under capability gates.

**Acceptance criteria:**
  - Capability-gated; Plugin ≠ Extension.
  - Sample cannot call Send except via send package APIs if allowed.
  - Deferred until plugin host lands.

**Dependencies:** PE06-S01, PE02-S02

**Priority:** P3

**Technical notes:** Plugin Architecture; E18.

**Testing notes:** Capability fence when admitted.

**Status:** deferred · Future

## PE26

**Extensions & Portability** · Status: **Future** · Priority: **P3**

### PE26-S01 — Export my data on request

**Description:** As a user, I can export my data on request.

**Acceptance criteria:**
  - Explicit user action.
  - Export is local file(s); no forced cloud upload.
  - Includes profile/applications at minimum when implemented.

**Dependencies:** PE02-S01, PE03-S01

**Priority:** P3

**Technical notes:** E19 Export.

**Testing notes:** Export fixture test when admitted.

**Status:** deferred · Future

### PE26-S02 — Host extension contribution point (discovery/send)

**Description:** As a developer, I can register a capability-gated Host Extension contribution for discovery or send.

**Acceptance criteria:**
  - Contribution points documented.
  - Capability-gated; Extension ≠ Plugin.
  - Cannot bypass Send fences.
  - Deferred stub (FEATURES Host Extensions).

**Dependencies:** PE10-S01, PE07-S01

**Priority:** P3

**Technical notes:** FEATURES Future; PACKAGE_BOUNDARIES.

**Testing notes:** Deferred fence test.

**Status:** deferred · Future

## PE27

**Multi-profile / Career Path** · Status: **Future** · Priority: **P3**

> Day-to-day Fullstack / Mobile faces live under **PE03-S05 Paths**.
> PE27 is for **hard multi-identity** (separate identities), not path variants.

### PE27-S01 — Maintain multiple local identities

**Description:** As a user, I can maintain multiple local **identities** for hard career pivots (not path variants under one person).

**Acceptance criteria:**
  - Identities local-only.
  - Switch does not sync to JobJitsu cloud.
  - Does not replace PE03-S05 Paths for Fullstack vs Mobile under one identity.
  - Deferred stub until FEATURES admits deep multi-identity.

**Dependencies:** PE03-S01, PE03-S05

**Priority:** P3

**Technical notes:** FEATURES Future — Multi-profile / multi-path.

**Testing notes:** Deferred.

**Status:** deferred · Future

## PE28

**Role-fit compass** · Status: **Future** · Priority: **P3**

### PE28-S01 — Reflect skills/values against roles

**Description:** As a user, I can reflect skills and values against roles as guidance — not destiny.

**Acceptance criteria:**
  - Local reflection only.
  - No destiny assignment / guaranteed fit claims.
  - Deferred stub (FEATURES).

**Dependencies:** PE03-S01, PE07-S01

**Priority:** P3

**Technical notes:** FEATURES Role-fit compass.

**Testing notes:** Deferred.

**Status:** deferred · Future

## PE29

**Offer & decision journal** · Status: **Future** · Priority: **P3**

### PE29-S01 — Compare offers calmly

**Description:** As a user, I can journal and compare offers without high-pressure countdown UX.

**Acceptance criteria:**
  - Local journal only.
  - No countdown / scarcity UX.
  - Deferred stub (FEATURES).

**Dependencies:** PE08-S03

**Priority:** P3

**Technical notes:** FEATURES Offer & decision journal.

**Testing notes:** Deferred.

**Status:** deferred · Future

## PE30

**Skills & learning map** · Status: **Future** · Priority: **P3**

### PE30-S01 — Link gaps to intentional growth

**Description:** As a user, I can map skill gaps to intentional growth (optional; not a course marketplace).

**Acceptance criteria:**
  - Local map only.
  - No embedded course marketplace.
  - Deferred stub (FEATURES).

**Dependencies:** PE03-S01

**Priority:** P3

**Technical notes:** FEATURES Skills & learning map.

**Testing notes:** Deferred.

**Status:** deferred · Future

---

## Coverage note (PLATFORM_SPEC agents)

Specialized PLATFORM_SPEC “agents” (Resume Tailoring Agent, Cover Letter Agent, Job Analysis Agent, etc.) map to **Workflow / package roles** under PE06 + PE16 — not separate Core epics.

---

## Story counts

| Band | Epics | Stories |
|------|-------|---------|
| Core · H1 (PE01–PE13) | 13 | 42 |
| Experimental (PE14–PE20) | 7 | 10 |
| Future (PE21–PE30) | 10 | 11 |
| **Total** | **30** | **63** |
)
