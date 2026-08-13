# User stories — epic catalog

Compact map of JobJitsu's platform epics (PE01–PE13, plus admitted PE20) and their stories.

> **SSOT:** the [JobJitsu Development board](https://github.com/users/ammar-tariq/projects/2) owns
> acceptance-criteria detail and live status. This file is the map, not the spec.

**Status legend:** **Shipped** — issue closed or verified in code · **Partial** — open issue, some
code landed · **Todo** — not started.

Build order: [DEPENDENCY_GRAPH.md](./DEPENDENCY_GRAPH.md) · Delivery process: [VERTICAL_SLICES.md](./VERTICAL_SLICES.md)

## PE01 — Desktop Shell & Foundation ([#1](https://github.com/ammar-tariq/jobjitsu/issues/1))

Calm desktop shell: window, primary navigation, deny-by-default IPC, dark-first appearance.

| Story | Summary | Status |
| --- | --- | --- |
| PE01-S01 | Open JobJitsu as a desktop app with calm chrome | Shipped · [#14](https://github.com/ammar-tariq/jobjitsu/issues/14) |
| PE01-S02 | Move between Applications, Queue, Follow-ups, Agent, Preferences, Timeline | Shipped · [#16](https://github.com/ammar-tariq/jobjitsu/issues/16) |
| PE01-S03 | UI calls only allowlisted host commands; unknown commands fail closed | Shipped · [#15](https://github.com/ammar-tariq/jobjitsu/issues/15) |
| PE01-S04 | Default to a calm dark theme; Appearance persists across restarts | Shipped · [#17](https://github.com/ammar-tariq/jobjitsu/issues/17) |

## PE02 — Storage & Event Spine ([#2](https://github.com/ammar-tariq/jobjitsu/issues/2))

On-device persistence and the typed local event bus every package rides on.

| Story | Summary | Status |
| --- | --- | --- |
| PE02-S01 | Persist profile and application documents under the user data dir | Shipped · [#19](https://github.com/ammar-tariq/jobjitsu/issues/19) |
| PE02-S02 | Publish and subscribe typed `Domain.Action` events in-process | Shipped · [#20](https://github.com/ammar-tariq/jobjitsu/issues/20) |
| PE02-S03 | Durable event hook persists the Timeline allowlist | Shipped · [#21](https://github.com/ammar-tariq/jobjitsu/issues/21) |

## PE03 — Identity & Resume Library ([#3](https://github.com/ammar-tariq/jobjitsu/issues/3))

One local identity with career paths and a résumé library: import → review → attach → tailor.

| Story | Summary | Status |
| --- | --- | --- |
| PE03-S01 | Create and edit an on-device profile | Shipped · [#22](https://github.com/ammar-tariq/jobjitsu/issues/22) |
| PE03-S02 | Import a résumé file into the local library | Shipped · [#23](https://github.com/ammar-tariq/jobjitsu/issues/23) |
| PE03-S03 | Keep multiple résumé versions and pick one per application | Shipped · [#24](https://github.com/ammar-tariq/jobjitsu/issues/24) |
| PE03-S04 | Request a tailored résumé draft for a job — draft only, never sends | Shipped · [#39](https://github.com/ammar-tariq/jobjitsu/issues/39) |
| PE03-S05 | Maintain career paths (Fullstack, Mobile, …) under one identity | Shipped · [#77](https://github.com/ammar-tariq/jobjitsu/issues/77) |
| PE03-S06 | Review and edit every import before anything attaches | Shipped · [#78](https://github.com/ammar-tariq/jobjitsu/issues/78) |
| PE03-S07 | Attach a reviewed import to identity, a path, or both | Shipped · [#79](https://github.com/ammar-tariq/jobjitsu/issues/79) |
| PE03-S08 | Import LinkedIn via exported PDF with calm guidance | Shipped · [#80](https://github.com/ammar-tariq/jobjitsu/issues/80) |
| PE03-S09 | Create a path from an existing résumé version without AI | Shipped · [#81](https://github.com/ammar-tariq/jobjitsu/issues/81) |
| PE03-S10 | Pre-fill import review with on-device AI parse; still editable | Shipped · [#82](https://github.com/ammar-tariq/jobjitsu/issues/82) |

## PE04 — Preferences & Privacy Chrome ([#4](https://github.com/ammar-tariq/jobjitsu/issues/4))

Preferences with approval-before-send on by default and honest Agent · On-device chrome.

| Story | Summary | Status |
| --- | --- | --- |
| PE04-S01 | Approval-before-send on by default, editable in Preferences | Shipped · [#25](https://github.com/ammar-tariq/jobjitsu/issues/25) |
| PE04-S02 | Set quiet hours so nudges do not interrupt (schema only; no UI yet) | Partial · [#27](https://github.com/ammar-tariq/jobjitsu/issues/27) |
| PE04-S03 | Honest Agent · On-device status chrome | Shipped · [#18](https://github.com/ammar-tariq/jobjitsu/issues/18) |
| PE04-S04 | Set fit, tone, and constraint preferences for curation and Agent | Shipped · [#26](https://github.com/ammar-tariq/jobjitsu/issues/26) |
| PE04-S05 | See and change the on-device data folder | Shipped · [#68](https://github.com/ammar-tariq/jobjitsu/issues/68) |
| PE04-S06 | Profile, résumés, and preferences persist as files under that folder | Shipped · [#72](https://github.com/ammar-tariq/jobjitsu/issues/72) |

## PE05 — Local Intelligence ([#5](https://github.com/ammar-tariq/jobjitsu/issues/5))

Local-first intelligence: provider, Context Builder, model management, offline path, real on-device models.

| Story | Summary | Status |
| --- | --- | --- |
| PE05-S01 | Run health and complete against a local AI Provider | Shipped · [#29](https://github.com/ammar-tariq/jobjitsu/issues/29) |
| PE05-S02 | Point at an on-device model path with calm misconfig recovery | Shipped · [#32](https://github.com/ammar-tariq/jobjitsu/issues/32) |
| PE05-S03 | Context Builder includes only task-needed slices in prompts | Shipped · [#30](https://github.com/ammar-tariq/jobjitsu/issues/30) |
| PE05-S04 | Optional remote provider with user-owned keys (Experimental; no board issue yet) | Todo |
| PE05-S05 | Local AI keeps working offline; no silent remote fallback | Shipped · [#31](https://github.com/ammar-tariq/jobjitsu/issues/31) |
| PE05-S06 | Run a real local model through loopback Ollama | Shipped · [#102](https://github.com/ammar-tariq/jobjitsu/issues/102) |
| PE05-S07 | Pick an installed local model from a list in Preferences | Shipped · [#112](https://github.com/ammar-tariq/jobjitsu/issues/112) |

## Local Craft Studio — board epic PE28 ([#101](https://github.com/ammar-tariq/jobjitsu/issues/101))

JD → résumé + cover letter craft on this device; shipped alongside PE05.

| Story | Summary | Status |
| --- | --- | --- |
| PE28-S01 | Paste résumé + job description; generate editable drafts on-device | Shipped · [#103](https://github.com/ammar-tariq/jobjitsu/issues/103) |
| PE28-S02 | Preview a résumé as HTML and save a PDF on this device | Shipped · [#104](https://github.com/ammar-tariq/jobjitsu/issues/104) |
| PE28-S03 | Chat-refine drafts; Agent asks clarifying questions instead of inventing | Shipped · [#105](https://github.com/ammar-tariq/jobjitsu/issues/105) |

## PE06 — Agent (preparative) ([#6](https://github.com/ammar-tariq/jobjitsu/issues/6))

Preparative agent: start, pause, and orchestrate drafts into the review Queue — never send.

| Story | Summary | Status |
| --- | --- | --- |
| PE06-S01 | Start preparative work and pause anytime; Queue stays intact | Todo · [#48](https://github.com/ammar-tariq/jobjitsu/issues/48) |
| PE06-S02 | Orchestrate drafts into the review Queue without sending | Todo · [#49](https://github.com/ammar-tariq/jobjitsu/issues/49) |

## PE07 — Discovery & Job Providers ([#7](https://github.com/ammar-tariq/jobjitsu/issues/7))

Discovery through registered job providers (local/CSV first), curated toward fit — not a feed.

| Story | Summary | Status |
| --- | --- | --- |
| PE07-S01 | Register a Job Provider source with list / sync / normalize (fake source exists; no registry) | Partial · [#35](https://github.com/ammar-tariq/jobjitsu/issues/35) |
| PE07-S02 | Curate roles toward fit using preferences | Todo · [#36](https://github.com/ammar-tariq/jobjitsu/issues/36) |
| PE07-S03 | Analyze a job against the profile — local and advisory | Todo · [#40](https://github.com/ammar-tariq/jobjitsu/issues/40) |
| PE07-S04 | Browse curated roles and start an application draft | Todo · [#37](https://github.com/ammar-tariq/jobjitsu/issues/37) |

## PE08 — Applications & Pipeline ([#8](https://github.com/ammar-tariq/jobjitsu/issues/8))

Application drafts and pipeline: create/edit, cover letters, list/detail, post-send tracking.

| Story | Summary | Status |
| --- | --- | --- |
| PE08-S01 | Create and edit application drafts linked to résumés | Shipped · [#33](https://github.com/ammar-tariq/jobjitsu/issues/33) |
| PE08-S02 | Generate an editable cover letter draft | Shipped · [#38](https://github.com/ammar-tariq/jobjitsu/issues/38) |
| PE08-S03 | Track status after send (Submitted → … → Archived) | Todo · [#46](https://github.com/ammar-tariq/jobjitsu/issues/46) |
| PE08-S04 | List applications and open a detail view | Shipped · [#34](https://github.com/ammar-tariq/jobjitsu/issues/34) |

## PE09 — Queue & Human Review ([#9](https://github.com/ammar-tariq/jobjitsu/issues/9))

Human review Queue — distinct from the AI Task Queue; the approval gate before egress.

| Story | Summary | Status |
| --- | --- | --- |
| PE09-S01 | Enqueue an application awaiting approval | Shipped · [#41](https://github.com/ammar-tariq/jobjitsu/issues/41) |
| PE09-S02 | Approve or reject queued items (queue view works; no `canSend` policy yet) | Partial · [#42](https://github.com/ammar-tariq/jobjitsu/issues/42) |

## PE10 — Send (Egress Boundary) ([#10](https://github.com/ammar-tariq/jobjitsu/issues/10))

The sole egress boundary: policy-checked send with honest success / failed / unknown outcomes.

| Story | Summary | Status |
| --- | --- | --- |
| PE10-S01 | Career payloads leave only via the send package after policy checks (channel exists; no host path) | Partial · [#44](https://github.com/ammar-tariq/jobjitsu/issues/44) |
| PE10-S02 | Audit on the Timeline what left the machine | Todo · [#45](https://github.com/ammar-tariq/jobjitsu/issues/45) |

## PE11 — Follow-ups & Scheduler ([#11](https://github.com/ammar-tariq/jobjitsu/issues/11))

Polite follow-ups on a durable scheduler that respects quiet hours.

| Story | Summary | Status |
| --- | --- | --- |
| PE11-S01 | Schedule a follow-up for a submitted application (application fields only; no scheduler arm) | Partial · [#50](https://github.com/ammar-tariq/jobjitsu/issues/50) |
| PE11-S02 | Calm nudge when a follow-up is due, outside quiet hours | Todo · [#52](https://github.com/ammar-tariq/jobjitsu/issues/52) |
| PE11-S03 | Scheduled follow-ups survive restart | Todo · [#51](https://github.com/ammar-tariq/jobjitsu/issues/51) |
| PE11-S04 | Dismiss or send a due follow-up under approval policy (dismiss works; no send-under-policy) | Partial · [#53](https://github.com/ammar-tariq/jobjitsu/issues/53) |

## PE12 — Timeline & Trust ([#12](https://github.com/ammar-tariq/jobjitsu/issues/12))

Local activity timeline and sanitized logs that earn trust.

| Story | Summary | Status |
| --- | --- | --- |
| PE12-S01 | Inspect a local timeline of meaningful events (session-only; not durable) | Partial · [#43](https://github.com/ammar-tariq/jobjitsu/issues/43) |
| PE12-S02 | Sanitized logs view without secrets or résumé bodies | Todo · [#47](https://github.com/ammar-tariq/jobjitsu/issues/47) |

## PE13 — Onboarding & Empty States ([#13](https://github.com/ammar-tariq/jobjitsu/issues/13))

Calm first run and empty states that invite one next step.

| Story | Summary | Status |
| --- | --- | --- |
| PE13-S01 | Complete first-run onboarding without pressure (missing résumé import + approval steps) | Partial · [#54](https://github.com/ammar-tariq/jobjitsu/issues/54) |
| PE13-S02 | Calm empty states for primary lists (inline empties; no shared component) | Partial · [#28](https://github.com/ammar-tariq/jobjitsu/issues/28) |

## PE20 — Email Integration ([#117](https://github.com/ammar-tariq/jobjitsu/issues/117))

Opt-in inbound mailbox sync. Extends existing Application drafts. Never sends.

| Story | Summary | Status |
| --- | --- | --- |
| PE20-S01 | Opt-in mailbox sync, classify/match, incremental cursors | Partial · [#118](https://github.com/ammar-tariq/jobjitsu/issues/118) · [PR #120](https://github.com/ammar-tariq/jobjitsu/pull/120) |
| PE20-S02 | Complete Gmail/Outlook OAuth loopback | Todo · [#119](https://github.com/ammar-tariq/jobjitsu/issues/119) |

## PE21 — Shell information architecture ([#128](https://github.com/ammar-tariq/jobjitsu/issues/128))

Untangle Preferences; Profile → Job Mail → Paths → Applications; Sources stub; Reset with backup. Plan: [SHELL_IA.md](../product/SHELL_IA.md).

| Story | Summary | Status |
| --- | --- | --- |
| PE21-S01 | Document shell IA, platform spec, terminology, backlog | In Progress · [#129](https://github.com/ammar-tariq/jobjitsu/issues/129) |
| PE21-S02 | Nav groups + Job Mail view; move mailbox out of Preferences; Profile connect CTA | Todo · [#130](https://github.com/ammar-tariq/jobjitsu/issues/130) |
| PE21-S03 | Preferences Reset: selective wipe, backup, restore; keep `.env` | Todo · [#131](https://github.com/ammar-tariq/jobjitsu/issues/131) |
| PE21-S04 | Sources Coming soon stub + cross-links to Craft / Job Mail | Todo · [#132](https://github.com/ammar-tariq/jobjitsu/issues/132) |
| PE21-S05 | Icon accent tokens (cyan + marigold) + calm motion polish | Todo · [#133](https://github.com/ammar-tariq/jobjitsu/issues/133) |

## Cross-cutting

| Story | Summary | Status |
| --- | --- | --- |
| PE-QA | H1 must-pass privacy gates: egress, approval, pause, honest outcomes (suites partial) | Partial · [#55](https://github.com/ammar-tariq/jobjitsu/issues/55) |

## Beyond H1

PE14–PE19 (Experimental: knowledge base, AI validation, workflows, automation, playground)
and PE22–PE30 (Future) are roadmap bands only. **PE21** (Shell IA) is admitted above.
Stories join this catalog when a board issue exists.

**Tally:** 35 shipped · 11 partial · 17 todo — 63 tracked stories (PE21 admitted).
