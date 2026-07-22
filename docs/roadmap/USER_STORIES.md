# JobJitsu User Stories (Roadmap Decomposition)
> Generated from the **documented** platform only — [PLATFORM_SPECIFICATION.md](../product/PLATFORM_SPECIFICATION.md),
> [FEATURES.md](../product/FEATURES.md), and architecture contracts.
>
> **Do not invent features.** Status labels (Core / Experimental / Future) gate commitment.
>
> Execution IDs for day-to-day delivery also live in [../backlog/USER_STORIES.md](../backlog/USER_STORIES.md)
> (E01–E19). This file is the **platform decomposition** roadmap (`PE*` epics).

**Architecture:** [../architecture/SYSTEM_ARCHITECTURE.md](../architecture/SYSTEM_ARCHITECTURE.md) · **Terms:** [../product/TERMINOLOGY.md](../product/TERMINOLOGY.md)

---

## Epic index

| Epic | Name | Feature status | Priority | Source |
|------|------|----------------|----------|--------|
| [PE01](#pe01) | Desktop Shell & Foundation | Core · H1 | P0 | PLATFORM_SPEC Performance/Accessibility; architecture DESKTOP; sprint foundation |
| [PE02](#pe02) | Storage & Event Spine | Core · H1 | P0 | PLATFORM_SPEC Local Storage, Event-Driven AI, Logging |
| [PE03](#pe03) | Identity & Resume Library | Core · H1 | P0 | PLATFORM_SPEC User Profile, Resume Library/Import/Versioning/Templates/Tailoring/Analysis |
| [PE04](#pe04) | Preferences & Privacy Chrome | Core · H1 | P0 | PLATFORM_SPEC Settings, Human Approval, Privacy Settings, Appearance |
| [PE05](#pe05) | Local Intelligence | Core · H1 | P0 | PLATFORM_SPEC AI Provider Architecture, Context Retrieval, Model Manager, Resource Management, Offline |
| [PE06](#pe06) | Agent (preparative) | Core · H1 | P0 | PLATFORM_SPEC The AI Agent, Responsibilities, Human Approval; architecture agent package |
| [PE07](#pe07) | Discovery & Job Providers | Core · H1 | P1 | PLATFORM_SPEC Job Discovery, Job Providers, Search Profiles, Synchronization, Analysis, Match Score |
| [PE08](#pe08) | Applications & Pipeline | Core · H1 | P0 | PLATFORM_SPEC Application Pipeline, Tracking, Duplicate Detection, Cover Letter Generation |
| [PE09](#pe09) | Queue & Human Review | Core · H1 | P0 | PLATFORM_SPEC Human Review, Human Approval |
| [PE10](#pe10) | Send (Egress Boundary) | Core · H1 | P0 | PLATFORM_SPEC Human Approval submit path; ADR 0009 |
| [PE11](#pe11) | Follow-ups & Scheduler | Core · H1 | P1 | PLATFORM_SPEC Follow-up Tracking; SCHEDULER |
| [PE12](#pe12) | Timeline & Trust | Core · H1 | P0 | PLATFORM_SPEC Activity Timeline; Event-Driven AI unload |
| [PE13](#pe13) | Onboarding & Empty States | Core · H1 | P1 | PLATFORM_SPEC + brand EMPTY_STATES |
| [PE14](#pe14) | Knowledge Base | Experimental | P1 | PLATFORM_SPEC Career Knowledge Base, Achievement/Story Library, Knowledge Retrieval |
| [PE15](#pe15) | AI Validation | Experimental | P1 | PLATFORM_SPEC Validate Output; WORKFLOW_ENGINE validation pipeline |
| [PE16](#pe16) | Workflow Engine & AI Task Queue | Experimental | P1 | PLATFORM_SPEC AI Workflow Planner & Engine, AI Execution Lifecycle |
| [PE17](#pe17) | Browser Automation Apply Assist | Experimental | P2 | PLATFORM_SPEC Browser Automation |
| [PE18](#pe18) | Trusted Automation | Experimental | P2 | PLATFORM_SPEC Automation Settings; EVENT_SYSTEM TA path |
| [PE19](#pe19) | AI Playground & Prompt Library | Experimental | P2 | PLATFORM_SPEC AI Playground, Prompt Library, Prompt Templates |
| [PE20](#pe20) | Email Integration | Experimental | P2 | PLATFORM_SPEC Email Integration, Gmail Synchronization, Classification, Draft Replies |
| [PE21](#pe21) | Outcomes & Reflection | Future | P3 | FEATURES Future; PLATFORM progress/analytics carefully local |
| [PE22](#pe22) | Interview Readiness | Future | P3 | PLATFORM_SPEC Interview Agent |
| [PE23](#pe23) | Narrative Studio | Future | P3 | FEATURES Future |
| [PE24](#pe24) | Recruiter & Network Nudges | Future | P3 | PLATFORM_SPEC Recruiter Management, LinkedIn Messaging |
| [PE25](#pe25) | Plugins (Agent Skills) | Future | P3 | PLATFORM_SPEC Plugin Architecture; E18 |
| [PE26](#pe26) | Extensions & Portability | Future | P3 | PLATFORM_SPEC + E19 Export |
| [PE27](#pe27) | Multi-profile / Career Path | Future | P3 | FEATURES Future |

---

## PE01

**Desktop Shell & Foundation** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC Performance/Accessibility; architecture DESKTOP; sprint foundation

### PE01-S01 — Launch desktop host

**Description:** As a user, I can open JobJitsu as a desktop app with calm chrome.

**Acceptance criteria:**
  - App launches to a main window titled JobJitsu.
  - Status region reserved for Agent · On-device.
  - No career data leaves the machine at launch.

**Dependencies:** None

**Priority:** P0

**Technical notes:** app host + ui; Tauri target / Vite-first per TAURI_TS_RUNTIME.

**Testing notes:** Smoke launch test; no network egress assertions.

**Status:** proposed

### PE01-S02 — Navigate primary H1 sections

**Description:** As a user, I can move between Applications, Queue, Follow-ups, Agent, Preferences, Timeline.

**Acceptance criteria:**
  - Nav uses product nouns (not Pipeline).
  - One primary view at a time.
  - Placeholder Sprint-1 labels migrate to H1 nouns when E03 ships.

**Dependencies:** PE01-S01

**Priority:** P0

**Technical notes:** DESKTOP_ARCHITECTURE IA; IPC deny-by-default.

**Testing notes:** Nav a11y + keyboard smoke.

**Status:** proposed

### PE01-S03 — Deny-by-default IPC

**Description:** As the platform, UI can only call allowlisted host commands.

**Acceptance criteria:**
  - Unknown commands fail closed.
  - UI cannot call AI Provider complete/embed.
  - No raw filesystem from renderer.

**Dependencies:** PE01-S01

**Priority:** P0

**Technical notes:** ADR 0013; DESKTOP IPC catalog.

**Testing notes:** Contract test deny path.

**Status:** proposed

## PE02

**Storage & Event Spine** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC Local Storage, Event-Driven AI, Logging

### PE02-S01 — Persist documents on-device

**Description:** As the host, I can store profile/application docs under user data dir.

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
  - No network I/O on bus.
  - PII-minimized payloads on Progress.

**Dependencies:** PE02-S01

**Priority:** P0

**Technical notes:** packages/events.

**Testing notes:** Pub/sub unit tests.

**Status:** proposed

### PE02-S03 — Durable event hook

**Description:** As Timeline, I can persist the durable allowlist.

**Acceptance criteria:**
  - Send/Queue approve/Agent.Paused/Preferences durable.
  - Default sink no-op until Timeline package.

**Dependencies:** PE02-S02

**Priority:** P1

**Technical notes:** DURABLE_EVENT_NAMES.

**Testing notes:** Callback invocation test.

**Status:** proposed

## PE03

**Identity & Resume Library** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC User Profile, Resume Library/Import/Versioning/Templates/Tailoring/Analysis

### PE03-S01 — Maintain local profile

**Description:** As a user, I can create and edit my on-device profile.

**Acceptance criteria:**
  - Profile fields persist locally.
  - UI never implies JobJitsu cloud sync.
  - Emits Preferences-independent profile updates via identity APIs.

**Dependencies:** PE02-S01

**Priority:** P0

**Technical notes:** DATA_MODELS Profile; identity package.

**Testing notes:** CRUD unit tests.

**Status:** proposed

### PE03-S02 — Import resume into Resume Library

**Description:** As a user, I can import a resume file into the local library.

**Acceptance criteria:**
  - Resume.Imported emitted (id only).
  - Version stored with label.
  - Import failure is calm and recoverable.

**Dependencies:** PE03-S01

**Priority:** P0

**Technical notes:** Resume Import section.

**Testing notes:** Fixture import test.

**Status:** proposed

### PE03-S03 — Version and select resumes

**Description:** As a user, I can keep multiple resume versions and pick one for an application.

**Acceptance criteria:**
  - Parent/child version refs optional.
  - List/query via identity public surface.

**Dependencies:** PE03-S02

**Priority:** P1

**Technical notes:** Resume Versioning.

**Testing notes:** Version graph unit test.

**Status:** proposed

### PE03-S04 — Tailor resume via Agent/AI (no send)

**Description:** As a user, I can request a tailored resume draft for a job without sending anything.

**Acceptance criteria:**
  - Uses Context Builder + AI Provider.
  - Output is a draft/version; user remains author.
  - Does not call Send.

**Dependencies:** PE03-S02, PE05-S01, PE06-S01

**Priority:** P0

**Technical notes:** Resume Tailoring; agent≠send.

**Testing notes:** Fence test agent↛send.

**Status:** proposed

## PE04

**Preferences & Privacy Chrome** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC Settings, Human Approval, Privacy Settings, Appearance

### PE04-S01 — Set approval-before-send default on

**Description:** As a user, approval-before-send is on by default and editable in Preferences.

**Acceptance criteria:**
  - Default on for new installs.
  - Preferences.Changed emitted.
  - config store SSOT; preferences façade.

**Dependencies:** PE02-S01

**Priority:** P0

**Technical notes:** PACKAGE_BOUNDARIES preferences.

**Testing notes:** Default policy unit test.

**Status:** proposed

### PE04-S02 — Quiet hours and calm notifications

**Description:** As a user, I can set quiet hours so nudges do not interrupt.

**Acceptance criteria:**
  - Scheduler respects quiet hours.
  - No urgency copy.

**Dependencies:** PE04-S01

**Priority:** P1

**Technical notes:** SCHEDULER laws.

**Testing notes:** Quiet-hours unit test.

**Status:** proposed

### PE04-S03 — Show Agent · On-device status

**Description:** As a user, I always see honest Agent · On-device chrome when local.

**Acceptance criteria:**
  - Never default label Local LLM in status bar.
  - Remote provider labeled honestly.
  - Unavailable/ready states calm.

**Dependencies:** PE05-S02

**Priority:** P0

**Technical notes:** TERMINOLOGY; ADR 0005.

**Testing notes:** Badge semantics UI test.

**Status:** proposed

## PE05

**Local Intelligence** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC AI Provider Architecture, Context Retrieval, Model Manager, Resource Management, Offline

### PE05-S01 — AI Provider health and complete

**Description:** As the host, I can run complete/health against a local AI Provider.

**Acceptance criteria:**
  - Provider interface health/complete/(optional embed).
  - No silent cloud fallback.
  - Ai.LocalModel* events for readiness.

**Dependencies:** PE02-S02

**Priority:** P0

**Technical notes:** AI_ARCHITECTURE; packages/ai.

**Testing notes:** Fake provider contract tests.

**Status:** proposed

### PE05-S02 — Configure local model path

**Description:** As a user, I can point JobJitsu at my on-device model path.

**Acceptance criteria:**
  - Misconfigured path → Ai.LocalModelFailed + recovery to Preferences.
  - Lazy load models.

**Dependencies:** PE05-S01, PE04-S01

**Priority:** P0

**Technical notes:** Model Manager in packages/ai.

**Testing notes:** Misconfig recovery test.

**Status:** proposed

### PE05-S03 — Context Builder minimizes prompt context

**Description:** As the platform, prompts include only task-needed slices.

**Acceptance criteria:**
  - Profile→Resume→…→Current Job budgeted by task.
  - No full Timeline dump.
  - KnowledgeReader port for reads.

**Dependencies:** PE05-S01, PE03-S01

**Priority:** P0

**Technical notes:** Context Builder contract.

**Testing notes:** Minimization unit test.

**Status:** proposed

### PE05-S04 — Optional remote AI Provider (Experimental labeling)

**Description:** As a user, I may configure a remote AI Provider with my own keys.

**Acceptance criteria:**
  - Never shown as Agent · On-device.
  - Keys local secrets only.
  - Feature status Experimental.

**Dependencies:** PE05-S01

**Priority:** P2

**Technical notes:** User-Owned API Keys; FEATURES Experimental.

**Testing notes:** Chrome honesty test.

**Status:** proposed

## PE06

**Agent (preparative)** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC The AI Agent, Responsibilities, Human Approval; architecture agent package

### PE06-S01 — Start and pause agent work

**Description:** As a user, I can start preparative work and pause anytime.

**Acceptance criteria:**
  - Agent.Started / Agent.Paused emitted.
  - Pause leaves review Queue intact.
  - Idle microcopy: belt tied / waiting.

**Dependencies:** PE04-S01, PE05-S01

**Priority:** P0

**Technical notes:** packages/agent; never imports send.

**Testing notes:** Fence + pause AC tests.

**Status:** proposed

### PE06-S02 — Prepare drafts into review Queue

**Description:** As a user, the agent can tailor and enqueue items for my review without sending.

**Acceptance criteria:**
  - Queue.Enqueued after preparative success.
  - No Send.Attempted.
  - Progress batched calmly.

**Dependencies:** PE06-S01, PE08-S01, PE09-S01

**Priority:** P0

**Technical notes:** SYSTEM_ARCHITECTURE sequence 4.1.

**Testing notes:** Integration cascade test.

**Status:** proposed

## PE07

**Discovery & Job Providers** · Status: **Core · H1** · Priority: **P1**

**Source:** PLATFORM_SPEC Job Discovery, Job Providers, Search Profiles, Synchronization, Analysis, Match Score

### PE07-S01 — Register a Job Provider source

**Description:** As the platform, I can register a discovery Source / Job Provider.

**Acceptance criteria:**
  - list/sync/normalizeRole contract.
  - First source may be local/CSV/fixture.
  - Discovery.RolesFound emitted.

**Dependencies:** PE02-S02

**Priority:** P0

**Technical notes:** PACKAGE_BOUNDARIES discovery.

**Testing notes:** Fake source unit test.

**Status:** proposed

### PE07-S02 — Curate roles toward fit

**Description:** As a user, roles are filtered toward fit not feed addiction.

**Acceptance criteria:**
  - Discovery.RolesCurated emitted.
  - No infinite-scroll vanity product.

**Dependencies:** PE07-S01, PE04-S01

**Priority:** P1

**Technical notes:** NON_GOALS volume.

**Testing notes:** Curation unit test.

**Status:** proposed

### PE07-S03 — Analyze job vs profile (local)

**Description:** As a user, I can request a job analysis grounded in my profile.

**Acceptance criteria:**
  - Uses Context Builder.
  - Output is advisory; no guaranteed hire claims.

**Dependencies:** PE07-S01, PE05-S03

**Priority:** P1

**Technical notes:** Job Analysis section.

**Testing notes:** Honest-copy review.

**Status:** proposed

## PE08

**Applications & Pipeline** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC Application Pipeline, Tracking, Duplicate Detection, Cover Letter Generation

### PE08-S01 — Create and edit application drafts

**Description:** As a user, I can create application drafts linked to roles/resumes.

**Acceptance criteria:**
  - Application.DraftCreated emitted.
  - Stages follow DATA_MODELS mapping.
  - Duplicate soft-warn when keys match.

**Dependencies:** PE03-S02, PE07-S01

**Priority:** P0

**Technical notes:** applications package.

**Testing notes:** CRUD + duplicate test.

**Status:** proposed

### PE08-S02 — Generate cover letter draft

**Description:** As a user, I can generate a cover letter draft for an application.

**Acceptance criteria:**
  - Uses AI Provider + Context Builder.
  - User edits before queue/send.
  - No auto-send.

**Dependencies:** PE08-S01, PE05-S01

**Priority:** P1

**Technical notes:** Cover Letter Intelligence.

**Testing notes:** Draft-only assertion.

**Status:** proposed

### PE08-S03 — Track application status post-send

**Description:** As a user, I can update tracking status (Submitted → … → Archived).

**Acceptance criteria:**
  - Application.StageChanged emitted.
  - Tracking ≠ prep pipeline stages.

**Dependencies:** PE08-S01, PE10-S01

**Priority:** P1

**Technical notes:** DATA_MODELS pipeline map.

**Testing notes:** Stage transition unit test.

**Status:** proposed

## PE09

**Queue & Human Review** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC Human Review, Human Approval

### PE09-S01 — Enqueue application for review

**Description:** As the agent/user, I can enqueue an application awaiting approval.

**Acceptance criteria:**
  - Queue.Enqueued emitted.
  - Item visible in Queue view.
  - Distinct from AI Task Queue.

**Dependencies:** PE08-S01

**Priority:** P0

**Technical notes:** packages/queue.

**Testing notes:** Enqueue unit test.

**Status:** proposed

### PE09-S02 — Approve or reject queue items

**Description:** As a user, I can approve or reject queued items calmly.

**Acceptance criteria:**
  - Queue.Approved / Rejected emitted.
  - Reject does not send.
  - Approval required before Send when policy on.

**Dependencies:** PE09-S01, PE04-S01

**Priority:** P0

**Technical notes:** EVENT_SYSTEM sovereignty AC.

**Testing notes:** Policy gate test.

**Status:** proposed

## PE10

**Send (Egress Boundary)** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC Human Approval submit path; ADR 0009

### PE10-S01 — Send only through send package

**Description:** As the platform, career payloads leave only via Send after policy checks.

**Acceptance criteria:**
  - send.approveAndSend is UI egress command.
  - Agent cannot import send.
  - Honest success|failed|unknown.

**Dependencies:** PE09-S02

**Priority:** P0

**Technical notes:** SendChannel contract.

**Testing notes:** Fence + outcome tests.

**Status:** proposed

### PE10-S02 — Audit egress on Timeline

**Description:** As a user, I can see what left the machine.

**Acceptance criteria:**
  - Privacy.EgressRecorded / EgressRecord fields.
  - Application.Submitted after success path.
  - Unknown never shown as success.

**Dependencies:** PE10-S01, PE12-S01

**Priority:** P0

**Technical notes:** DATA_MODELS EgressRecord.

**Testing notes:** Timeline integration test.

**Status:** proposed

### PE10-S03 — First channel stub (file or mailto)

**Description:** As a user, I can complete an outbound action via a stub channel without SaaS.

**Acceptance criteria:**
  - Destination class recorded.
  - Failure keeps draft per policy.

**Dependencies:** PE10-S01

**Priority:** P1

**Technical notes:** H1 stub channel.

**Testing notes:** Channel adapter test.

**Status:** proposed

## PE11

**Follow-ups & Scheduler** · Status: **Core · H1** · Priority: **P1**

**Source:** PLATFORM_SPEC Follow-up Tracking; SCHEDULER

### PE11-S01 — Schedule a polite follow-up

**Description:** As a user, I can schedule a follow-up reminder for an application.

**Acceptance criteria:**
  - FollowUp.Scheduled emitted.
  - Respects quiet hours.
  - No auto-send without policy.

**Dependencies:** PE10-S01, PE04-S02

**Priority:** P1

**Technical notes:** followups + scheduler.

**Testing notes:** Schedule unit test.

**Status:** proposed

### PE11-S02 — Receive calm due notification

**Description:** As a user, when a follow-up is due I get a calm nudge.

**Acceptance criteria:**
  - FollowUp.Due emitted.
  - Copy is caution not error/urgency.

**Dependencies:** PE11-S01

**Priority:** P1

**Technical notes:** NOTIFICATIONS brand.

**Testing notes:** Copy review + event test.

**Status:** proposed

## PE12

**Timeline & Trust** · Status: **Core · H1** · Priority: **P0**

**Source:** PLATFORM_SPEC Activity Timeline; Event-Driven AI unload

### PE12-S01 — Inspect local timeline

**Description:** As a user, I can query a local timeline of approvals, egress, and pauses.

**Acceptance criteria:**
  - TimelineEvent stores ids not résumé bodies.
  - Filters by application optional.

**Dependencies:** PE02-S03

**Priority:** P0

**Technical notes:** timeline package.

**Testing notes:** Query unit test.

**Status:** proposed

### PE12-S02 — Sanitized logs view

**Description:** As a user, I can open sanitized logs without prompt bodies by default.

**Acceptance criteria:**
  - logs.tail redacts prompts.
  - Calm empty state when none.

**Dependencies:** PE01-S01

**Priority:** P1

**Technical notes:** Logging section.

**Testing notes:** Redaction unit test.

**Status:** proposed

## PE13

**Onboarding & Empty States** · Status: **Core · H1** · Priority: **P1**

**Source:** PLATFORM_SPEC + brand EMPTY_STATES

### PE13-S01 — Complete calm first-run onboarding

**Description:** As a new user, I can complete a short onboarding without pressure.

**Acceptance criteria:**
  - Three-beat max.
  - No spray-and-pray CTAs.
  - Ends with Agent ready / waiting for signal.

**Dependencies:** PE04-S03, PE03-S02

**Priority:** P1

**Technical notes:** Brand onboarding.

**Testing notes:** UI copy checklist.

**Status:** proposed

## PE14

**Knowledge Base** · Status: **Experimental** · Priority: **P1**

**Source:** PLATFORM_SPEC Career Knowledge Base, Achievement/Story Library, Knowledge Retrieval

### PE14-S01 — Store knowledge entries locally

**Description:** As a user, I can save achievements/stories/notes in the Knowledge Base.

**Acceptance criteria:**
  - KnowledgeEntry schema per DATA_MODELS.
  - Knowledge.Updated emitted.
  - Distinct from Timeline.

**Dependencies:** PE03-S01

**Priority:** P1

**Technical notes:** identity Knowledge surface.

**Testing notes:** CRUD test.

**Status:** proposed

### PE14-S02 — Retrieve knowledge into Context Builder

**Description:** As the platform, generation can pull grounded knowledge slices.

**Acceptance criteria:**
  - KnowledgeReader used by Context Builder.
  - Irrelevant context excluded.

**Dependencies:** PE14-S01, PE05-S03

**Priority:** P1

**Technical notes:** WORKFLOW retrieve step.

**Testing notes:** Retrieval selection test.

**Status:** proposed

## PE15

**AI Validation** · Status: **Experimental** · Priority: **P1**

**Source:** PLATFORM_SPEC Validate Output; WORKFLOW_ENGINE validation pipeline

### PE15-S01 — Validate generated resume before queue

**Description:** As the platform, generated resumes run Formatting → ATS → Missing Skills checks.

**Acceptance criteria:**
  - Ai.ValidationCompleted emitted.
  - Fail does not Queue.Enqueued for send.
  - Honest ATS language.

**Dependencies:** PE05-S01, PE03-S04

**Priority:** P1

**Technical notes:** AI Validation.

**Testing notes:** Fail-closed enqueue test.

**Status:** proposed

## PE16

**Workflow Engine & AI Task Queue** · Status: **Experimental** · Priority: **P1**

**Source:** PLATFORM_SPEC AI Workflow Planner & Engine, AI Execution Lifecycle

### PE16-S01 — Run Application Workflow steps

**Description:** As a user, Apply starts a documented Workflow without auto-send.

**Acceptance criteria:**
  - Workflow.Started/Completed events.
  - Ends at Wait for Approval → user-owned Send.
  - Unload models on cleanup.

**Dependencies:** PE06-S01, PE09-S01, PE10-S01

**Priority:** P1

**Technical notes:** WORKFLOW_ENGINE Application Workflow.

**Testing notes:** Cascade integration test.

**Status:** proposed

### PE16-S02 — Inspect AI Task Queue progress

**Description:** As a user, I can see Generating… and tasks remaining calmly.

**Acceptance criteria:**
  - getTaskQueueSnapshot.
  - States Pending…Cancelled.
  - Default concurrency 1.

**Dependencies:** PE16-S01

**Priority:** P2

**Technical notes:** Task Queue UI chrome.

**Testing notes:** Snapshot unit test.

**Status:** proposed

## PE17

**Browser Automation Apply Assist** · Status: **Experimental** · Priority: **P2**

**Source:** PLATFORM_SPEC Browser Automation

### PE17-S01 — Prepare automation without egress

**Description:** As a user, I can prepare browser automation for an application without submitting.

**Acceptance criteria:**
  - Prepare step only.
  - Never bypasses Queue→Send.
  - Owned as send.channel/extension stub.

**Dependencies:** PE09-S02, PE10-S01

**Priority:** P2

**Technical notes:** PACKAGE_BOUNDARIES orphan stub.

**Testing notes:** Capability deny test.

**Status:** proposed

## PE18

**Trusted Automation** · Status: **Experimental** · Priority: **P2**

**Source:** PLATFORM_SPEC Automation Settings; EVENT_SYSTEM TA path

### PE18-S01 — Enable Trusted Automation default off

**Description:** As a user, I can enable reduced per-action approval knowingly.

**Acceptance criteria:**
  - Default off.
  - Still emits Send.* + Timeline audit.
  - Can disable anytime.

**Dependencies:** PE04-S01, PE10-S01

**Priority:** P2

**Technical notes:** EVENT_SYSTEM Trusted Automation.

**Testing notes:** Default-off + audit tests.

**Status:** proposed

## PE19

**AI Playground & Prompt Library** · Status: **Experimental** · Priority: **P2**

**Source:** PLATFORM_SPEC AI Playground, Prompt Library, Prompt Templates

### PE19-S01 — Experiment with prompts without affecting production Workflows

**Description:** As a user, I can try prompts/providers in a playground isolated from production runs.

**Acceptance criteria:**
  - No silent mutation of production Workflow definitions.
  - Uses configured providers only.

**Dependencies:** PE05-S01

**Priority:** P2

**Technical notes:** Playground section.

**Testing notes:** Isolation test.

**Status:** proposed

## PE20

**Email Integration** · Status: **Experimental** · Priority: **P2**

**Source:** PLATFORM_SPEC Email Integration, Gmail Synchronization, Classification, Draft Replies

### PE20-S01 — Sync email via channel adapter (opt-in)

**Description:** As a user, I can sync mail through a user-configured channel.

**Acceptance criteria:**
  - Email.Synced counts only on bus.
  - No JobJitsu mail cloud.
  - Feature labeled Experimental.

**Dependencies:** PE02-S02, PE10-S01

**Priority:** P2

**Technical notes:** send/mail channel stub.

**Testing notes:** Fake channel test.

**Status:** proposed

## PE21

**Outcomes & Reflection** · Status: **Future** · Priority: **P3**

**Source:** FEATURES Future; PLATFORM progress/analytics carefully local

### PE21-S01 — Record application outcome without guilt metrics

**Description:** As a user, I can record outcomes for learning without streaks or shame.

**Acceptance criteria:**
  - No urgency scores.
  - Local only.

**Dependencies:** PE08-S03, PE12-S01

**Priority:** P3

**Technical notes:** H2 epic E15.

**Testing notes:** Deferred until Horizon 2.

**Status:** deferred

## PE22

**Interview Readiness** · Status: **Future** · Priority: **P3**

**Source:** PLATFORM_SPEC Interview Agent

### PE22-S01 — Practice interview prep locally

**Description:** As a user, I can use interview readiness aids without guaranteed-offer claims.

**Acceptance criteria:**
  - On-device drafts.
  - Honest copy.

**Dependencies:** PE05-S01

**Priority:** P3

**Technical notes:** Future module.

**Testing notes:** Deferred.

**Status:** deferred

## PE23

**Narrative Studio** · Status: **Future** · Priority: **P3**

**Source:** FEATURES Future

### PE23-S01 — Keep story consistent across materials

**Description:** As a user, I can align narrative across resume/letters.

**Acceptance criteria:**
  - User owns final voice.

**Dependencies:** PE03-S01

**Priority:** P3

**Technical notes:** Future.

**Testing notes:** Deferred.

**Status:** deferred

## PE24

**Recruiter & Network Nudges** · Status: **Future** · Priority: **P3**

**Source:** PLATFORM_SPEC Recruiter Management, LinkedIn Messaging

### PE24-S01 — Track recruiter relationships locally

**Description:** As a user, I can note recruiter interactions on-device.

**Acceptance criteria:**
  - Consent-heavy.
  - No spam-your-contacts.

**Dependencies:** PE12-S01

**Priority:** P3

**Technical notes:** Future.

**Testing notes:** Deferred.

**Status:** deferred

## PE25

**Plugins (Agent Skills)** · Status: **Future** · Priority: **P3**

**Source:** PLATFORM_SPEC Plugin Architecture; E18

### PE25-S01 — Enable an official sample plugin skill

**Description:** As a user, I can enable a capability-gated agent skill.

**Acceptance criteria:**
  - Manifest reviewed.
  - Disable revokes.
  - Cannot call raw send.

**Dependencies:** PE06-S01

**Priority:** P3

**Technical notes:** plugin-sdk.

**Testing notes:** Deferred to H4.

**Status:** deferred

## PE26

**Extensions & Portability** · Status: **Future** · Priority: **P3**

**Source:** PLATFORM_SPEC + E19 Export

### PE26-S01 — Export my data on request

**Description:** As a user, I can export my local data without ambient sync.

**Acceptance criteria:**
  - User-triggered only.
  - No JobJitsu cloud.

**Dependencies:** PE02-S01

**Priority:** P3

**Technical notes:** Portability Future.

**Testing notes:** Deferred.

**Status:** deferred

## PE27

**Multi-profile / Career Path** · Status: **Future** · Priority: **P3**

**Source:** FEATURES Future

### PE27-S01 — Maintain multiple local profiles

**Description:** As a user, I can switch career paths without account farms.

**Acceptance criteria:**
  - Still local-first.

**Dependencies:** PE03-S01

**Priority:** P3

**Technical notes:** Future.

**Testing notes:** Deferred.

**Status:** deferred

---

## Coverage notes

- Specialized PLATFORM_SPEC agents (Resume/Cover Letter/Job Research/…) map to **Workflow roles** under PE06/PE16, not separate epics.
- Settings categories map into PE04 (Preferences) + PE05 (AI settings).
- Secrets, logging, errors, testing requirements are cross-cutting ACs inside foundation/spine stories.
- Future AI Capabilities (voice/TTS/fine-tune/etc.) remain unspecified as stories until FEATURES promotes them.
