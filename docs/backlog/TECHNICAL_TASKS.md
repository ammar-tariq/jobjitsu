# Technical Tasks

Each task = **1 working day**. Independently implementable after its **Depends on** tasks are done.  
Output should be reviewable in isolation (PR-sized).

Legend: `Depends: none | T-ids | Epic feature`

---

## E01 Platform Foundation

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E01-F01-S01-T01 | Create pnpm workspace root + `packages/core` stub | none | Install works; core exports a version string |
| E01-F01-S01-T02 | Add shared TSConfig/eslint baselines for packages | T01 | `pnpm exec tsc -p packages/core` passes |
| E01-F01-S01-T03 | Document monorepo install in README | T01 | Clone→install steps accurate |
| E01-F02-S01-T01 | Scaffold Tauri app under `app/` (empty window) | E01-F01-S01-T01 | Window launches titled JobJitsu |
| E01-F02-S01-T02 | Wire app workspace package.json scripts (dev/build) | T01 | Scripts documented and run |
| E01-F03-S01-T01 | Add React+Vite (or Tauri-recommended) UI entry | E01-F02-S01-T01 | React hello renders in webview |
| E01-F03-S01-T02 | Enable TypeScript strict for `app/ui` | T01 | `tsc --noEmit` clean |
| E01-F04-S01-T01 | Create `packages/ui` with CSS variables from design tokens (primitives) | E01-F01-S01-T01 | Token file exists with indigo/teal/midnight |
| E01-F04-S01-T02 | Implement dark semantic theme map | T01 | Canvas background Midnight in UI |
| E01-F04-S01-T03 | Implement light semantic theme map (unused by default) | T01 | `data-theme=light` switches canvas to Soft Cloud |
| E01-F04-S01-T04 | Load Inter + JetBrains Mono in UI shell | E01-F03-S01-T01 | Fonts applied to body/mono preview |

---

## E02 Storage & Event Spine

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E02-F01-S01-T01 | Define storage interface (get/set/delete/list) in `packages/storage` | E01-F01-S01-T01 | Types exported |
| E02-F01-S01-T02 | Implement SQLite-class (or equivalent) local adapter | T01 | Write/read roundtrip test on temp dir |
| E02-F01-S01-T03 | Implement blob file put/get under user-data path | T01 | File bytes survive restart test |
| E02-F01-S01-T04 | Add storage path resolution helper (app data dir) | T01 | Paths documented; unit tested |
| E02-F02-S01-T01 | Create `packages/events` with event name union (core catalog) | E01-F01-S01-T01 | Catalog compiles |
| E02-F02-S01-T02 | Define payload types for Queue/Send/Ai/Agent (ID-centric) | T01 | No résumé body on Progress type |
| E02-F03-S01-T01 | Implement in-process pub/sub bus | E02-F02-S01-T01 | Subscribe test passes |
| E02-F03-S01-T02 | Add typed publish helper per domain | T01 | `publishQueueEnqueued(id)` works |
| E02-F04-S01-T01 | Add durable sink interface + memory sink for tests | E02-F03-S01-T01 | Sink invoked on flagged events |
| E02-F04-S01-T02 | Mark egress/approval/pause events as durable-by-default | T01 | Config list unit-tested |

---

## E03 Desktop Shell & IPC

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E03-F01-S01-T01 | Define IPC command enum (ping, theme.get/set stubs) | E01-F02-S01-T01 | Enum in shared types |
| E03-F01-S01-T02 | Implement host allowlist dispatcher | T01 | Unknown command errors |
| E03-F01-S01-T03 | Expose typed client in UI bridge module | T02 | UI can ping host |
| E03-F01-S01-T04 | Contract test: deny unknown command | T02 | Test green |
| E03-F02-S01-T01 | Build shell layout: sidebar + main + status | E01-F03-S01-T01, E01-F04-S01-T02 | Layout renders |
| E03-F02-S01-T02 | Implement nav items + route/state for 5 sections | T01 | Switching sections works |
| E03-F02-S01-T03 | Add status bar placeholder for privacy pill | T01 | Region reserved |
| E03-F03-S01-T01 | Theme preference read/write via IPC+storage | E02-F01-S01-T02, E03-F01-S01-T03 | Persists restart |
| E03-F03-S01-T02 | Theme toggle control in Preferences stub | T01 | Toggles dark/light |
| E03-F04-S01-T01 | Implement `JjButton` variants primary/secondary/ghost | E01-F04-S01-T02 | Story/demo page or fixture |
| E03-F04-S01-T02 | Implement `JjBadge` tones neutral/accent/success/caution/danger | E01-F04-S01-T02 | Demo renders |
| E03-F04-S01-T03 | Implement `JjInput` default/focus/error styles | E01-F04-S01-T02 | Keyboard focus ring visible |

---

## E04 Identity & Resume

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E04-F01-S01-T01 | Identity schema + repository on storage | E02-F01-S01-T02 | CRUD unit tests |
| E04-F01-S01-T02 | Host command: import resume (copy blob + metadata) | T01, E03-F01-S01-T02 | Import from path works |
| E04-F01-S01-T03 | UI: import resume button + on-device confirmation copy | T02 | Matches brand honesty |
| E04-F02-S01-T01 | Profile field update API | E04-F01-S01-T01 | Save/load name/email |
| E04-F02-S01-T02 | Preferences/Identity form section UI | T01, E03-F04-S01-T03 | Edits persist |
| E04-F03-S01-T01 | `identity.read` package API for other packages | E04-F01-S01-T01 | Agent/AI can import type |
| E04-F03-S01-T02 | Guard test: identity package has no fetch/send deps | T01 | Dependency lint/test |

---

## E05 Preferences & Privacy Chrome

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E05-F01-S01-T01 | Preferences schema + repository | E02-F01-S01-T02 | Roundtrip test |
| E05-F01-S01-T02 | IPC get/set preferences | T01, E03-F01-S01-T02 | UI can read/write |
| E05-F02-S01-T01 | Seed defaults: approval-before-send=true | E05-F01-S01-T01 | Fresh DB assertion |
| E05-F02-S01-T02 | Quiet hours fields in schema | T01 | Stored start/end |
| E05-F03-S01-T01 | Build `JjLocalLlmPill` component | E03-F04-S01-T02, E01-F04-S01-T02 | Renders states |
| E05-F03-S01-T02 | Mount pill in status bar | T01, E03-F02-S01-T03 | Always visible |
| E05-F03-S01-T03 | Wire pill to AI health subscription (stub events ok) | T02, E02-F03-S01-T01 | State changes on event |
| E05-F04-S01-T01 | Preferences view: approval toggle + model path field | E05-F01-S01-T02, E03-F04-S01-T03 | Calm copy |
| E05-F04-S01-T02 | Preferences view: quiet hours inputs | E05-F02-S01-T02 | Saves |

---

## E06 Local Intelligence

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E06-F01-S01-T01 | `packages/ai` provider interface | E01-F01-S01-T01 | Types export |
| E06-F01-S01-T02 | Provider registry (getActiveProvider) | T01 | Returns configured provider |
| E06-F02-S01-T01 | FakeProvider deterministic complete+health | E06-F01-S01-T01 | Unit tests |
| E06-F03-S01-T01 | LocalProvider stub reading model path pref | E05-F01-S01-T01, E06-F01-S01-T01 | health unavailable if missing |
| E06-F03-S01-T02 | Document how to plug a real local runner later | T01 | Doc in package README |
| E06-F04-S01-T01 | ContextAssembler with explicit field allowlist | E04-F03-S01-T01, E06-F01-S01-T01 | Unit test minimization |
| E06-F04-S01-T02 | `tailorDraft` use-case function (no UI) | T01, E06-F02-S01-T01 | Returns text via fake |
| E06-F05-S01-T01 | Emit Ai.LocalModelLoading/Ready/Failed from registry | E02-F03-S01-T01, E06-F01-S01-T02 | Events observed in test |
| E06-F05-S01-T02 | Map events→pill states in UI | T01, E05-F03-S01-T03 | Ready/Unavailable accurate |

---

## E07 Discovery & Curation

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E07-F01-S01-T01 | Role candidate types + DiscoverySource interface | E01-F01-S01-T01 | Types export |
| E07-F01-S01-T02 | Source registry in `packages/discovery` | T01 | Register/list sources |
| E07-F02-S01-T01 | CSV/fixture source implementation | E07-F01-S01-T01, E02-F01-S01-T02 | Imports N roles |
| E07-F02-S01-T02 | Host command + UI trigger import CSV | T01, E03-F01-S01-T02 | User can import |
| E07-F03-S01-T01 | Curation filter using preferences keywords | E05-F01-S01-T01, E07-F01-S01-T01 | Filter unit tests |
| E07-F03-S01-T02 | Emit Discovery.RolesCurated with counts | T01, E02-F03-S01-T01 | Event test |
| E07-F04-S01-T01 | Discovery/roles list UI | T02 wiring from import, E03-F02-S01-T02 | Lists roles |
| E07-F04-S01-T02 | Empty state for no roles matched | T01, E14 copy ok later | Calm empty |

---

## E08 Applications

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E08-F01-S01-T01 | Application entity + repository | E02-F01-S01-T02 | CRUD tests |
| E08-F01-S01-T02 | Create draft from role id use-case | T01, E07-F01-S01-T01 | Draft exists |
| E08-F01-S01-T03 | Update draft body use-case | T01 | Persists edits |
| E08-F01-S01-T04 | Delete draft with explicit confirm API | T01 | Soft/hard delete per choice |
| E08-F02-S01-T01 | Wire tailor use-case into application update | E06-F04-S01-T02, E08-F01-S01-T03 | Body tailored via fake |
| E08-F02-S01-T02 | Emit Application.Tailored | T01, E02-F03-S01-T01 | Event test |
| E08-F03-S01-T01 | Applications list UI | E08-F01-S01-T01, E03-F02-S01-T02 | Shows drafts |
| E08-F03-S01-T02 | Application detail editor UI + save | E08-F01-S01-T03, E03-F04-S01-T03 | Edit/save |
| E08-F03-S01-T03 | Tailor button on detail (calls host) | E08-F02-S01-T01, E03-F01-S01-T02 | Updates body |

---

## E09 Queue & Review

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E09-F01-S01-T01 | Queue repository + enqueue use-case | E08-F01-S01-T01 | Status queued |
| E09-F01-S01-T02 | Emit Queue.Enqueued | T01, E02-F03-S01-T01 | Event test |
| E09-F02-S01-T01 | approve/reject use-cases | E09-F01-S01-T01, E05-F02-S01-T01 | State transitions |
| E09-F02-S01-T02 | `canSend(applicationId)` policy helper | T01 | False if approval required & not approved |
| E09-F02-S01-T03 | Contract test: policy blocks send flag | T02 | Test green |
| E09-F03-S01-T01 | Queue list UI | E09-F01-S01-T01, E03-F02-S01-T02 | Lists queued |
| E09-F03-S01-T02 | Approve/Reject actions in UI | E09-F02-S01-T01, E03-F04-S01-T01 | Actions work |
| E09-F03-S01-T03 | Row settle animation (respect reduced motion) | T01, design-system motion | Motion/CSS done |

---

## E10 Send (Egress Boundary)

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E10-F01-S01-T01 | `packages/send` API skeleton (executeSend) | E01-F01-S01-T01 | Types + noop |
| E10-F01-S01-T02 | Enforce `canSend` before execute | E09-F02-S01-T02, T01 | Throws/returns denied |
| E10-F01-S01-T03 | Dependency fence test: agent must not depend on send | T01 | CI/test script |
| E10-F02-S01-T01 | File-export send channel (writes package locally) | E10-F01-S01-T01, E08-F01-S01-T01 | File created on disk |
| E10-F02-S01-T02 | Host command approveAndSend → send.execute | T01, E03-F01-S01-T02 | End-to-end stub |
| E10-F03-S01-T01 | Map channel results to success/failed/unknown | E10-F02-S01-T01 | Enum + tests |
| E10-F03-S01-T02 | UI toasts for outcomes (quiet success / plain error) | T01, E03-F04-S01-T02 | Copy brand-aligned |
| E10-F04-S01-T01 | Emit Send.* + Privacy.EgressRecorded | E02-F03-S01-T01, E10-F03-S01-T01 | Events tested |
| E10-F04-S01-T02 | Ensure unknown≠success in UI state mapper | E10-F03-S01-T01 | Unit test |

---

## E11 Follow-ups & Scheduler

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E11-F01-S01-T01 | Follow-up entity + repository | E02-F01-S01-T02 | CRUD tests |
| E11-F01-S01-T02 | scheduleFollowUp after successful send hook | T01, E10-F03-S01-T01 | Creates scheduled row |
| E11-F02-S01-T01 | `packages/scheduler` job store | E02-F01-S01-T02 | Persist jobs |
| E11-F02-S01-T02 | Scheduler tick + due transition | T01 | Time-travel test |
| E11-F02-S01-T03 | Honor quiet hours (defer notify) | E05-F02-S01-T02, T02 | Deferred in test |
| E11-F03-S01-T01 | In-app due notification (caution toast/inbox item) | E11-F02-S01-T02, E02-F03-S01-T01 | Appears on due |
| E11-F03-S01-T02 | Ensure sound default off | T01 | Pref/default test |
| E11-F04-S01-T01 | Follow-ups list UI | E11-F01-S01-T01, E03-F02-S01-T02 | Lists items |
| E11-F04-S01-T02 | Dismiss follow-up action | E11-F01-S01-T01 | Dismiss works |
| E11-F04-S01-T03 | Send follow-up via send policy path | E10-F01-S01-T02, T01 | Uses canSend |

---

## E12 Agent

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E12-F01-S01-T01 | Agent state machine (idle/running/paused) | E01-F01-S01-T01 | Unit tests |
| E12-F01-S01-T02 | IPC start/pause/resume | T01, E03-F01-S01-T02 | Commands work |
| E12-F01-S01-T03 | Emit Agent.Started/Paused/Resumed/Idle | T01, E02-F03-S01-T01 | Events tested |
| E12-F02-S01-T01 | Preparative step: select curated roles (fixture) | E07-F03-S01-T01, E12-F01-S01-T01 | Selects ≤N roles |
| E12-F02-S01-T02 | Preparative step: create+tailor drafts | E08-F02-S01-T01, T01 | Drafts created |
| E12-F02-S01-T03 | Preparative step: enqueue for review | E09-F01-S01-T01, T02 | Queued |
| E12-F02-S01-T04 | Integration test: full prep run never calls send | T03, E10-F01-S01-T03 | Assert no egress |
| E12-F03-S01-T01 | Agent view UI with start/pause | E12-F01-S01-T02, E03-F02-S01-T02 | Controls work |
| E12-F03-S01-T02 | Idle microcopy + batched progress toast helper | T01, E02-F03-S01-T01 | Batch helper tested |

---

## E13 Timeline & Trust

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E13-F01-S01-T01 | Timeline repository append/list | E02-F01-S01-T02 | Tests |
| E13-F01-S01-T02 | Timeline entry types (egress vs local) | T01 | Discriminated union |
| E13-F02-S01-T01 | Connect durable sink → timeline writes | E02-F04-S01-T01, E13-F01-S01-T01 | Send event creates row |
| E13-F02-S01-T02 | Record Queue.Approved & Agent.Paused | T01 | Rows created |
| E13-F03-S01-T01 | Timeline UI list | E13-F01-S01-T01, E03-F02-S01-T02 | Shows entries |
| E13-F03-S01-T02 | Sanitized logs panel (truncate/redact helper) | T01 | Redaction unit test |
| E13-F03-S01-T03 | “What left / what stayed” filter chips | E13-F01-S01-T02, T01 | Filter works |

---

## E14 Onboarding & Empty States

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E14-F01-S01-T01 | Onboarding state flag in prefs/storage | E05-F01-S01-T01 | First-run detection |
| E14-F01-S01-T02 | Step 1 UI: connect resume | E04-F01-S01-T03, T01 | Completes step |
| E14-F01-S01-T03 | Step 2 UI: preferences essentials | E05-F04-S01-T01, T01 | Completes step |
| E14-F01-S01-T04 | Step 3 UI: agent ready / belt tied | E12-F03-S01-T01, T01 | Completes onboarding |
| E14-F02-S01-T01 | `JjEmptyState` component | E03-F04-S01-T01 | Renders title/body/CTA |
| E14-F02-S01-T02 | Applications empty state content | T01, E08-F03-S01-T01 | Shown when empty |
| E14-F02-S01-T03 | Queue & Follow-ups empty states | T01, E09-F03-S01-T01, E11-F04-S01-T01 | Brand copy |

---

## Privacy must-pass / hardening (cross-cutting H1)

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E13-QA-T01 | Privacy test: résumé not sent without send path | E10-F02-S01-T01, E04-F01-S01-T02 | Mock network asserts |
| E13-QA-T02 | Approval gate e2e-style integration test | E10-F01-S01-T02, E09-F02-S01-T01 | Blocked then allowed |
| E13-QA-T03 | Local badge spoof test (remote label ≠ Local) | E06-F05-S01-T02 | Assertion |
| E13-QA-T04 | Reduced-motion: toast/row settle degrade | E09-F03-S01-T03, E10-F03-S01-T02 | Manual/automated check |
| E13-QA-T05 | Keyboard path: approve send without pointer | E09-F03-S01-T02 | Documented + tested |

---

## E15–E19 (day tasks, thinner)

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E15-F01-S01-T01 | Outcome field on application + UI select | E08-F01-S01-T01 | Saves outcome |
| E15-F01-S01-T02 | Outcome note textarea | T01 | Persists |
| E15-F02-S01-T01 | Reflection summary query (counts only) | E15-F01-S01-T01 | No streak logic |
| E15-F02-S01-T02 | Reflection view UI (calm) | T01 | Renders |
| E16-F01-S01-T01 | Notes entity linked to application | E13-F01-S01-T01 | CRUD |
| E16-F01-S01-T02 | Notes UI on detail | T01 | Saves |
| E16-F02-S01-T01 | Timeline filter by entry type API | E13-F01-S01-T02 | Query tests |
| E16-F02-S01-T02 | Filter UI controls | T01 | Works |
| E17-F01-S01-T01 | Interview module shell route + empty state | E03-F02-S01-T02 | Navigable |
| E17-F02-S01-T01 | Narrative studio shell route | E03-F02-S01-T02 | Navigable |
| E17-F03-S01-T01 | Role-fit shell route | E03-F02-S01-T02 | Navigable |
| E18-F01-S01-T01 | Plugin manifest Zod/JSON schema | E01-F01-S01-T01 | Validates sample |
| E18-F01-S01-T02 | Capability enum + docs | T01 | Listed in SDK README |
| E18-F02-S01-T01 | Plugin loader enable/disable store | E05-F01-S01-T01, T02 | Persist flags |
| E18-F02-S01-T02 | Fail-closed invoke guard | T01 | Missing cap denied test |
| E18-F03-S01-T01 | Official sample skill package | E18-F02-S01-T02, E06-F02-S01-T01 | Runs in prep only |
| E19-F01-S01-T01 | Extension contribution type stubs | E07-F01-S01-T01 | Types export |
| E19-F01-S01-T02 | Host registerContribution API | T01 | Registry test |
| E19-F02-S01-T01 | Export zip/archive of local data | E04-F01-S01-T01, E08-F01-S01-T01 | User-triggered file |
| E19-F02-S01-T02 | Export UI button + confirmation copy | T01 | No cloud wording |

---

## Task count (approx.)

| Horizon | Tasks |
|---------|-------|
| H1 (E01–E14 + QA) | ~120 day-tasks |
| H2–H4 seeded | ~20 day-tasks |

Split further if a task slips past one day — never merge tasks across package boundaries (especially agent↔send).
