# Backlog epic features

Build-order features grouped by epic (implementation backlog). These are **not** the product module map — for modules and Horizons, see [../product/FEATURES.md](../product/FEATURES.md).

Stories live in [USER_STORIES.md](./USER_STORIES.md).

---

## E01 Platform Foundation

| ID | Feature | Description |
|----|---------|-------------|
| E01-F01 | Monorepo workspace | pnpm workspaces, `app` + `packages/*` stubs, tooling baselines |
| E01-F02 | Tauri application shell | Minimal Tauri window boots |
| E01-F03 | React UI bootstrap | React+TS mount inside webview |
| E01-F04 | Design tokens package | `--jj-*` tokens, dark theme default CSS |

## E02 Storage & Event Spine

| ID | Feature | Description |
|----|---------|-------------|
| E02-F01 | Storage package | Local DB + blob paths API |
| E02-F02 | Event contracts | Typed `Domain.Action` event defs |
| E02-F03 | In-process event bus | Publish/subscribe in host |
| E02-F04 | Durable event sink hook | Interface to persist subset → timeline later |

## E03 Desktop Shell & IPC

| ID | Feature | Description |
|----|---------|-------------|
| E03-F01 | IPC bridge allowlist | Deny-by-default commands |
| E03-F02 | App navigation chrome | Sidebar + main + status region |
| E03-F03 | Theme switching | Dark default; light switch |
| E03-F04 | Jj UI primitives (core) | Button, input, badge scaffolding |

## E04 Identity & Resume

| ID | Feature | Description |
|----|---------|-------------|
| E04-F01 | Resume import + review/attach | Local file; review before attach; LinkedIn PDF guidance |
| E04-F02 | Profile + Paths | Identity fields; career Paths (Fullstack, Mobile) under one person |
| E04-F03 | Identity read API | Packages can read without egress |
| E04-F04 | AI parse import (after E06) | Pre-fill review only; edit still mandatory |

## E05 Preferences & Privacy Chrome

| ID | Feature | Description |
|----|---------|-------------|
| E05-F01 | Preferences store | Persist prefs locally |
| E05-F02 | Approval & quiet-hours prefs | Defaults match philosophy |
| E05-F03 | Agent · On-device chrome | Honest status component in chrome (`JjAgentPrivacyPill`) |
| E05-F04 | Preferences UI | Calm settings view |

## E06 Local Intelligence

| ID | Feature | Description |
|----|---------|-------------|
| E06-F01 | AI provider interface | health/complete/(embed) |
| E06-F02 | Fake provider | Deterministic test/dev provider |
| E06-F03 | Local adapter stub | Path-configured local runtime wiring |
| E06-F04 | Context assembler | Minimal local context builder |
| E06-F05 | AI status events | Ai.LocalModel* → Agent · On-device chrome |

## E07 Discovery & Curation

| ID | Feature | Description |
|----|---------|-------------|
| E07-F01 | Discovery source interface | Pluggable sources |
| E07-F02 | Manual/CSV source | First non-board source |
| E07-F03 | Curation filter | Preference-based fit filter |
| E07-F04 | Discovery UI list | Roles list for review |

## E08 Applications

| ID | Feature | Description |
|----|---------|-------------|
| E08-F01 | Application entity & store | CRUD drafts locally |
| E08-F02 | Tailor draft | AI-assisted tailor into application |
| E08-F03 | Applications UI | List + detail editor |

## E09 Queue & Review

| ID | Feature | Description |
|----|---------|-------------|
| E09-F01 | Queue domain | Enqueue / approve / reject |
| E09-F02 | Policy enforcement | Respect approval-before-send |
| E09-F03 | Queue UI | Review ritual screens |

## E10 Send (Egress Boundary)

| ID | Feature | Description |
|----|---------|-------------|
| E10-F01 | Send service API | Sole egress entry |
| E10-F02 | Stub/file channel | First safe channel (export/mailto stub) |
| E10-F03 | Honest outcomes | success/failed/unknown |
| E10-F04 | Egress audit emit | Privacy.EgressRecorded |

## E11 Follow-ups & Scheduler

| ID | Feature | Description |
|----|---------|-------------|
| E11-F01 | Follow-up domain | Schedule / due / dismiss |
| E11-F02 | Local scheduler | Persist & run jobs |
| E11-F03 | Due notifications | Calm in-app (OS optional later) |
| E11-F04 | Follow-ups UI | Calendar/list |

## E12 Agent

| ID | Feature | Description |
|----|---------|-------------|
| E12-F01 | Agent runtime | Start/pause/resume |
| E12-F02 | Preparative pipeline | Discover→tailor→enqueue (no send) |
| E12-F03 | Agent UI & idle copy | Status + belt-tied idle |

## E13 Timeline & Trust

| ID | Feature | Description |
|----|---------|-------------|
| E13-F01 | Timeline store | Append-only local history |
| E13-F02 | Event→timeline wiring | Durable subset |
| E13-F03 | Timeline & logs UI | Inspectable trust |

## E14 Onboarding & Empty States

| ID | Feature | Description |
|----|---------|-------------|
| E14-F01 | First-run wizard | Identity → import → review → first Path → prefs; agent chrome |
| E14-F02 | Empty states | Brand patterns per surface |

## E15 Outcomes & Reflection (H2)

| ID | Feature | Description |
|----|---------|-------------|
| E15-F01 | Outcome capture | Interview/reject/offer notes |
| E15-F02 | Reflection view | Calm insights, no guilt |

## E16 Timeline Depth (H2)

| ID | Feature | Description |
|----|---------|-------------|
| E16-F01 | Notes on applications | Freeform local notes |
| E16-F02 | Filters & search | Local timeline query |

## E17 Career Craft Modules (H3)

| ID | Feature | Description |
|----|---------|-------------|
| E17-F01 | Interview readiness room | Practice aid module shell |
| E17-F02 | Narrative studio shell | Consistency drafts on-device |
| E17-F03 | Role-fit compass shell | Guidance not destiny |

## E18 Plugin System (H4)

| ID | Feature | Description |
|----|---------|-------------|
| E18-F01 | Plugin SDK & manifest | Capabilities schema |
| E18-F02 | Plugin host loader | Enable/disable fail-closed |
| E18-F03 | Sample official skill | One inspectable skill |

## E19 Extensions & Portability (H4)

| ID | Feature | Description |
|----|---------|-------------|
| E19-F01 | Extension SDK contributions | discovery/send/ui points |
| E19-F02 | Data export | User-triggered portability |
