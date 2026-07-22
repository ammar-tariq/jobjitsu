# GitHub Project Import — JobJitsu

> Converted from [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) + [../roadmap/USER_STORIES.md](../roadmap/USER_STORIES.md).
>
> **Hierarchy:** Milestone → Epic → Story → Task  
> **Task rules:** independently mergeable · **one PR** · **≤ 1 working day**  
> **Canonical order:** [IMPLEMENTATION_ORDER.md](../../IMPLEMENTATION_ORDER.md)  
> **Board:** [PROJECT_BOARD.md](./PROJECT_BOARD.md) · **Existing day-tasks:** [TECHNICAL_TASKS.md](./TECHNICAL_TASKS.md)

Flat CSV (issues): [import/github-issues.csv](./import/github-issues.csv)

---

## Import conventions

| Level | GitHub artifact | Title pattern | Parent |
|-------|-----------------|---------------|--------|
| Milestone | Milestone | `W{n} — {name}` | — |
| Epic | Issue + label `type:epic` | `PE{nn} — {epic name}` | Milestone |
| Story | Issue + label `type:story` | `PE{nn}-S{nn} — {title}` | Epic (sub-issue / tracked in body) |
| Task | Issue + label `type:task` | `PE{nn}-S{nn}-T{nn} — {title}` | Story |

**Body template (every issue):**

```markdown
## Summary
{one sentence}

## Acceptance / Done when
- …

## Dependencies
Blocked by: {IDs or none}

## Estimate
{Nd} ({hours})

## Labels
{copied for humans}

## Twin (optional)
Backlog: {E##-F##-S##-T##} — prefer one implementation path; close the twin as duplicate if both filed.
```

**Estimate scale:** `0.5d` = half day · `1d` = one PR max. Never schedule `>1d` without splitting.

**Dependencies:** use GitHub “blocked by” / issue refs once numbers exist; until then keep IDs in body + CSV `blocked_by` column.

---

## Labels (create first)

| Label | Color hint | Purpose |
|-------|------------|---------|
| `type:epic` | `#6F42C1` | Epic issue |
| `type:story` | `#1D76DB` | User story |
| `type:task` | `#0E8A16` | One-PR task |
| `status:core-h1` | `#5319E7` | Core Horizon 1 |
| `status:experimental` | `#FBCA04` | Experimental (parked) |
| `status:future` | `#D4C5F9` | Future (parked) |
| `priority:p0` | `#B60205` | Must |
| `priority:p1` | `#D93F0B` | Should |
| `priority:p2` | `#FBCA04` | Nice |
| `priority:p3` | `#C5DEF5` | Deferred |
| `wave:w0` … `wave:w9` | `#C2E0C6` | Roadmap wave |
| `area:shell` | `#BFDADC` | Desktop shell / IPC |
| `area:storage` | `#BFDADC` | Persistence |
| `area:events` | `#BFDADC` | Event bus |
| `area:identity` | `#BFDADC` | Profile / resume |
| `area:prefs` | `#BFDADC` | Preferences / chrome |
| `area:ai` | `#BFDADC` | Local intelligence |
| `area:discovery` | `#BFDADC` | Job providers |
| `area:applications` | `#BFDADC` | Applications |
| `area:queue` | `#BFDADC` | Review Queue |
| `area:send` | `#BFDADC` | Egress |
| `area:agent` | `#BFDADC` | Preparative agent |
| `area:scheduler` | `#BFDADC` | Follow-ups |
| `area:timeline` | `#BFDADC` | Timeline / trust |
| `area:onboarding` | `#BFDADC` | Onboarding / empty |
| `fence:sovereignty` | `#E99695` | Agent↛send / approval gates |
| `parked` | `#FFFFFF` | Not Ready |

---

## Milestones

| Milestone | Due (suggested) | Wave | Exit |
|-----------|-----------------|------|------|
| `W0 — Shell boots` | +2 w | 0 | Launch + IPC deny + nav + dark default + Agent chrome region |
| `W1 — Data & event spine` | +3 w | 1 | Persist + typed bus + durable hook |
| `W2 — Trust & identity` | +5 w | 2 | Profile/resume; approval default; fit prefs; empty states |
| `W3 — Local intelligence` | +7 w | 3 | Fake/local provider; Context Builder; offline-primary |
| `W4 — Craft objects` | +9 w | 4 | Roles + application drafts list/detail |
| `W5 — Sovereignty path` | +11 w | 5 | Queue → Send stub → Timeline egress; fence green |
| `W6 — Agent & nudges` | +13 w | 6 | Agent prep enqueue; follow-ups under policy |
| `W7 — First-run polish` | +14 w | 7 | Onboarding + H1 must-pass |
| `W8 — Experimental (parked)` | — | 8 | Admit via FEATURES only |
| `W9 — Future (parked)` | — | 9 | Stubs only |

---

## Epic index (file as `type:epic`)

| Epic | Milestone | Status | Est. (stories) | Backlog twin |
|------|-----------|--------|----------------|--------------|
| PE01 — Desktop Shell & Foundation | W0 | Core · H1 | 5 stories | E01, E03 |
| PE02 — Storage & Event Spine | W1 | Core · H1 | 3 | E02 |
| PE03 — Identity & Resume Library | W2 (+ craft in W4) | Core · H1 | 4 | E04 |
| PE04 — Preferences & Privacy Chrome | W0/W2 | Core · H1 | 4 | E05 |
| PE05 — Local Intelligence | W3 | Core · H1 | 4 Core + 1 Exp | E06 |
| PE06 — Agent (preparative) | W6 | Core · H1 | 2 | E12 |
| PE07 — Discovery & Job Providers | W4 | Core · H1 | 4 | E07 |
| PE08 — Applications & Pipeline | W4/W5 | Core · H1 | 4 | E08 |
| PE09 — Queue & Human Review | W5 | Core · H1 | 2 | E09 |
| PE10 — Send (Egress Boundary) | W5 | Core · H1 | 2 | E10 |
| PE11 — Follow-ups & Scheduler | W6 | Core · H1 | 4 | E11 |
| PE12 — Timeline & Trust | W5 | Core · H1 | 2 | E13 |
| PE13 — Onboarding & Empty States | W2/W7 | Core · H1 | 2 | E14 |
| PE14–PE20 | W8 | Experimental | parked | — |
| PE21–PE30 | W9 | Future | parked | E15–E19 partial |

---

## Wave 0 — Shell boots

### Epic PE01 — Desktop Shell & Foundation
**Milestone:** W0 · **Labels:** `type:epic` `status:core-h1` `wave:w0` `area:shell` `priority:p0`

#### Story PE01-S01 — Launch desktop host
**Est:** 3d · **Depends:** none · **Labels:** `type:story` `priority:p0` `wave:w0` `area:shell`

| Task ID | Title | Est | Depends | Labels | Done when | Twin |
|---------|-------|-----|---------|--------|-----------|------|
| PE01-S01-T01 | Scaffold desktop window titled JobJitsu | 1d | none | `type:task` `area:shell` | Window launches titled JobJitsu | E01-F02-S01-T01 |
| PE01-S01-T02 | Wire UI entry (React) into host webview | 1d | T01 | `type:task` `area:shell` | Calm chrome shell renders | E01-F03-S01-T01 |
| PE01-S01-T03 | Smoke: launch with no career egress | 0.5d | T02 | `type:task` `fence:sovereignty` | Assert no Send at launch | — |

#### Story PE01-S03 — Deny-by-default IPC
**Est:** 2.5d · **Depends:** PE01-S01 · **Labels:** `type:story` `priority:p0` `wave:w0` `area:shell`

| Task ID | Title | Est | Depends | Labels | Done when | Twin |
|---------|-------|-----|---------|--------|-----------|------|
| PE01-S03-T01 | Define IPC allowlist enum (ping + stubs) | 0.5d | PE01-S01-T01 | `type:task` `area:shell` | Enum exported | E03-F01-S01-T01 |
| PE01-S03-T02 | Host dispatcher fails closed on unknown | 1d | T01 | `type:task` `area:shell` | Unknown command errors | E03-F01-S01-T02 |
| PE01-S03-T03 | Typed UI bridge client | 0.5d | T02 | `type:task` `area:shell` | UI can ping host | E03-F01-S01-T03 |
| PE01-S03-T04 | Contract test: deny unknown + no AI complete from UI | 0.5d | T02 | `type:task` `fence:sovereignty` | Tests green | E03-F01-S01-T04 |

#### Story PE01-S02 — Navigate primary H1 sections
**Est:** 2d · **Depends:** PE01-S01 · **Labels:** `type:story` `priority:p0` `wave:w0` `area:shell`

| Task ID | Title | Est | Depends | Labels | Done when | Twin |
|---------|-------|-----|---------|--------|-----------|------|
| PE01-S02-T01 | Shell layout: sidebar + main + status | 1d | PE01-S01-T02 | `type:task` `area:shell` | Layout renders | E03-F02-S01-T01 |
| PE01-S02-T02 | Nav routes: Applications, Queue, Follow-ups, Agent, Preferences, Timeline | 1d | T01 | `type:task` `area:shell` | One primary view; TERMINOLOGY nouns | E03-F02-S01-T02 |

#### Story PE01-S04 — Dark-default appearance
**Est:** 2.5d · **Depends:** PE01-S01 · **Labels:** `type:story` `priority:p1` `wave:w0` `area:shell`

| Task ID | Title | Est | Depends | Labels | Done when | Twin |
|---------|-------|-----|---------|--------|-----------|------|
| PE01-S04-T01 | Design tokens + dark semantic theme | 1d | PE01-S01-T02 | `type:task` `area:shell` | Dark canvas default | E01-F04-S01-T01/T02 |
| PE01-S04-T02 | Persist appearance via host + storage stub | 1d | T01, PE02-S01-T02* | `type:task` `area:shell` | Survives restart (*may soft-dep Wave 1) | E03-F03-S01-T01 |
| PE01-S04-T03 | AA contrast smoke on primary text | 0.5d | T01 | `type:task` `area:shell` | Documented check / test | — |

\*If storage not ready: in-memory theme OK for W0; harden in PE01-S04-T02 after PE02-S01.

#### Story PE04-S03 — Show Agent · On-device status
**Epic note:** ship under PE04 epic, **milestone W0** (chrome early).  
**Est:** 1.5d · **Depends:** PE01-S01 · **Labels:** `type:story` `priority:p0` `wave:w0` `area:prefs`

| Task ID | Title | Est | Depends | Labels | Done when | Twin |
|---------|-------|-----|---------|--------|-----------|------|
| PE04-S03-T01 | Status region + Agent · On-device badge component | 1d | PE01-S02-T01 | `type:task` `area:prefs` | Never labels “Local LLM” | E05-F03-S01-T01/T02 |
| PE04-S03-T02 | Unavailable/ready states without model config | 0.5d | T01 | `type:task` `area:prefs` | Calm unavailable default | E05-F03-S01-T03 stub |

---

## Wave 1 — Data & event spine

### Epic PE02 — Storage & Event Spine
**Milestone:** W1 · **Labels:** `type:epic` `status:core-h1` `wave:w1` `area:storage` `priority:p0`

#### Story PE02-S01 — Persist documents on-device
**Est:** 3d · **Depends:** PE01-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE02-S01-T01 | Storage interface in `packages/storage` | 0.5d | none | Types exported | E02-F01-S01-T01 |
| PE02-S01-T02 | Local adapter roundtrip (temp dir) | 1d | T01 | Write/read test | E02-F01-S01-T02 |
| PE02-S01-T03 | Blob put/get under user-data path | 1d | T01 | Bytes survive restart | E02-F01-S01-T03 |
| PE02-S01-T04 | Path resolution helper | 0.5d | T01 | Unit tested | E02-F01-S01-T04 |

**Labels (all tasks):** `type:task` `wave:w1` `area:storage` `status:core-h1` `priority:p0`

#### Story PE02-S02 — Typed local event bus
**Est:** 2.5d · **Depends:** PE01-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE02-S02-T01 | Event name catalog union (EVENT_SYSTEM) | 1d | none | Catalog compiles | E02-F02-S01-T01 |
| PE02-S02-T02 | ID-centric payload types (no resume bodies on Progress) | 0.5d | T01 | Types enforce minimization | E02-F02-S01-T02 |
| PE02-S02-T03 | In-process pub/sub bus | 1d | T01 | Subscribe test; no network I/O | E02-F03-S01-T01 |

**Labels:** `type:task` `wave:w1` `area:events` `priority:p0`

#### Story PE02-S03 — Durable event hook
**Est:** 1d · **Depends:** PE02-S02 · **Priority:** P1

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE02-S03-T01 | Durable sink interface + memory sink | 0.5d | PE02-S02-T03 | Sink invoked in test | E02-F04-S01-T01 |
| PE02-S03-T02 | Allowlist egress/approval/pause/prefs | 0.5d | T01 | Config list unit-tested | E02-F04-S01-T02 |

---

## Wave 2 — Trust & identity

### Epic PE03 — Identity & Resume Library
**Milestone:** W2 · **Labels:** `type:epic` `status:core-h1` `wave:w2` `area:identity`

#### Story PE03-S01 — Maintain local profile
**Est:** 2d · **Depends:** PE02-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE03-S01-T01 | Profile schema + repository | 1d | PE02-S01-T02 | CRUD tests | E04-F01-S01-T01 |
| PE03-S01-T02 | Profile update API + UI form section | 1d | T01 | Edits persist; no cloud copy | E04-F02-S01-T01/T02 |

#### Story PE03-S02 — Import resume into Resume Library
**Est:** 2d · **Depends:** PE03-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE03-S02-T01 | Host import resume (blob + metadata) | 1d | PE03-S01-T01, PE01-S03-T02 | Import from path | E04-F01-S01-T02 |
| PE03-S02-T02 | UI import + Resume.Imported (id only) | 1d | T01 | Calm failure path | E04-F01-S01-T03 |

#### Story PE03-S03 — Version and select resumes
**Est:** 1d · **Depends:** PE03-S02 · **Priority:** P1

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE03-S03-T01 | Version list API + select without send | 1d | PE03-S02-T01 | Versions listable | — |

### Epic PE04 — Preferences & Privacy Chrome
**Milestone:** W2 (chrome story already in W0) · **Labels:** `type:epic` `wave:w2` `area:prefs`

#### Story PE04-S01 — Approval-before-send default on
**Est:** 1.5d · **Depends:** PE02-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE04-S01-T01 | Preferences schema + repository | 1d | PE02-S01-T02 | Roundtrip | E05-F01-S01-T01 |
| PE04-S01-T02 | Seed approval-before-send=true + IPC get/set | 0.5d | T01 | Fresh DB assertion | E05-F02-S01-T01, E05-F01-S01-T02 |

#### Story PE04-S04 — Fit, tone, and constraint preferences
**Est:** 1d · **Depends:** PE04-S01 · **Priority:** P0

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE04-S04-T01 | Fit/tone/constraint fields + Preferences.Changed | 1d | PE04-S01-T01 | Persist; façade readable | — |

#### Story PE04-S02 — Quiet hours fields
**Est:** 0.5d · **Depends:** PE04-S01 · **Priority:** P1

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE04-S02-T01 | Quiet hours schema + Preferences UI inputs | 0.5d | PE04-S01-T01 | Stored start/end | E05-F02-S01-T02, E05-F04-S01-T02 |

#### Story PE13-S02 — Calm empty states
**Milestone:** W2 · **Est:** 1.5d · **Depends:** PE01-S02

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE13-S02-T01 | `JjEmptyState` component | 0.5d | PE01-S02-T01 | Title/body/CTA | E14-F02-S01-T01 |
| PE13-S02-T02 | Wire Applications/Queue/Follow-ups empties | 1d | T01 | One CTA each; no shame | E14-F02-S01-T02/T03 |

---

## Wave 3 — Local intelligence

### Epic PE05 — Local Intelligence
**Milestone:** W3 · **Labels:** `type:epic` `wave:w3` `area:ai`  
**Park:** PE05-S04 → W8

#### Story PE05-S01 — AI Provider health and complete
**Est:** 2.5d · **Depends:** PE02-S02

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE05-S01-T01 | `packages/ai` provider interface + registry | 1d | none | Types + getActiveProvider | E06-F01-S01-T01/T02 |
| PE05-S01-T02 | FakeProvider health/complete | 1d | T01 | Deterministic unit tests | E06-F02-S01-T01 |
| PE05-S01-T03 | Emit Ai.LocalModel* readiness events | 0.5d | T01, PE02-S02-T03 | Events observed | E06-F05-S01-T01 |

#### Story PE05-S03 — Context Builder minimizes prompt context
**Est:** 1.5d · **Depends:** PE05-S01, PE03-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE05-S03-T01 | ContextAssembler allowlist + budget | 1d | PE05-S01-T01, PE03-S01-T01 | No Timeline dump; KnowledgeReader no-op OK | E06-F04-S01-T01 |
| PE05-S03-T02 | Minimization unit test | 0.5d | T01 | Test green | — |

#### Story PE05-S05 — Offline / local-primary path
**Est:** 1d · **Depends:** PE05-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE05-S05-T01 | Offline test: local provider with network disabled | 0.5d | PE05-S01-T02 | Passes offline | — |
| PE05-S05-T02 | No silent remote fallback assertion | 0.5d | T01 | Failure → calm prefs path | — |

#### Story PE05-S02 — Configure local model path
**Est:** 1.5d · **Depends:** PE05-S01, PE04-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE05-S02-T01 | LocalProvider stub reading model path pref | 1d | PE05-S01-T01, PE04-S01-T01 | Unavailable if missing | E06-F03-S01-T01 |
| PE05-S02-T02 | Preferences model path field + recovery copy | 0.5d | T01 | Calm misconfig | E05-F04-S01-T01 |

---

## Wave 4 — Craft objects

### Epic PE08 — Applications (critical track)

#### Story PE08-S01 — Create and edit application drafts
**Est:** 2.5d · **Depends:** PE03-S02

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE08-S01-T01 | Application entity + repository | 1d | PE02-S01-T02 | CRUD | E08-F01-S01-T01 |
| PE08-S01-T02 | Create/update draft use-cases (role optional) | 1d | T01 | DraftCreated; fixture role OK | E08-F01-S01-T02/T03 |
| PE08-S01-T03 | Duplicate soft-warn | 0.5d | T01 | Soft warn on key match | — |

#### Story PE08-S04 — List and open applications
**Est:** 1.5d · **Depends:** PE08-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE08-S04-T01 | Applications list UI | 1d | PE08-S01-T01, PE01-S02-T02 | Shows status | E08-F03-S01-T01 |
| PE08-S04-T02 | Detail editor + save | 0.5d | PE08-S01-T02 | Edit/save | E08-F03-S01-T02 |

### Epic PE07 — Discovery (parallel)

#### Story PE07-S01 — Register Job Provider source
**Est:** 2d · **Depends:** PE02-S02

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE07-S01-T01 | DiscoverySource types + registry | 1d | none | Register/list | E07-F01-S01-T01/T02 |
| PE07-S01-T02 | CSV/fixture source + RolesFound | 1d | T01, PE02-S01-T02 | Imports N roles | E07-F02-S01-T01 |

#### Story PE07-S02 — Curate roles toward fit
**Est:** 1d · **Depends:** PE07-S01, PE04-S04

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE07-S02-T01 | Curation filter + RolesCurated | 1d | PE07-S01-T01, PE04-S04-T01 | Unit tests; calm zero | E07-F03-S01-T01/T02 |

#### Story PE07-S04 — Browse and select curated roles
**Est:** 1d · **Depends:** PE07-S02

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE07-S04-T01 | Roles list UI + draft CTA (no send) | 1d | PE07-S02-T01, PE01-S02-T02 | Title/company; CTA → draft | E07-F04-S01-T01 |

#### Story PE08-S02 — Cover letter draft
**Est:** 1d · **Depends:** PE08-S01, PE05-S01 · **Priority:** P1

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE08-S02-T01 | Cover letter draft use-case via FakeProvider | 1d | PE08-S01-T01, PE05-S01-T02 | Draft only; no send | — |

#### Story PE03-S04 — Tailor resume draft (no send)
**Milestone:** W4 · **Est:** 1.5d · **Depends:** PE03-S02, PE05-S01, PE05-S03

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE03-S04-T01 | tailorDraft use-case (no UI send) | 1d | PE05-S03-T01, PE05-S01-T02 | Returns draft text | E06-F04-S01-T02 |
| PE03-S04-T02 | Fence test: tailor ↛ send | 0.5d | T01 | CI green | E10-F01-S01-T03 partial |

#### Story PE07-S03 — Analyze job vs profile
**Est:** 1d · **Depends:** PE07-S01, PE05-S03 · **Priority:** P1

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE07-S03-T01 | Advisory job analysis use-case | 1d | PE07-S01-T01, PE05-S03-T01 | No hire guarantees; no send | — |

---

## Wave 5 — Sovereignty path

### Epic PE09 — Queue & Human Review

#### Story PE09-S01 — Enqueue application for review
**Est:** 1.5d · **Depends:** PE08-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE09-S01-T01 | Queue repository + enqueue | 1d | PE08-S01-T01 | Queued status | E09-F01-S01-T01 |
| PE09-S01-T02 | Emit Queue.Enqueued + Queue list UI stub | 0.5d | T01, PE02-S02-T03 | Distinct from AI Task Queue | E09-F01-S01-T02, E09-F03-S01-T01 |

#### Story PE09-S02 — Approve or reject
**Est:** 2d · **Depends:** PE09-S01, PE04-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE09-S02-T01 | approve/reject + canSend policy | 1d | PE09-S01-T01, PE04-S01-T02 | Policy blocks when required | E09-F02-S01-T01/T02 |
| PE09-S02-T02 | Queue UI actions + policy contract test | 1d | T01 | Reject ≠ send | E09-F02-S01-T03, E09-F03-S01-T02 |

### Epic PE12 — Timeline & Trust

#### Story PE12-S01 — Inspect local timeline
**Est:** 2d · **Depends:** PE02-S03

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE12-S01-T01 | Timeline repository append/list | 1d | PE02-S01-T02 | Tests | E13-F01-S01-T01 |
| PE12-S01-T02 | Wire durable sink → timeline | 0.5d | T01, PE02-S03-T01 | Rows on durable events | E13-F02-S01-T01 |
| PE12-S01-T03 | Timeline UI list | 0.5d | T01, PE01-S02-T02 | Local-only list | E13-F03-S01-T01 |

### Epic PE10 — Send

#### Story PE10-S01 — Send only through send package
**Est:** 3.5d · **Depends:** PE09-S02 · **Labels:** include `fence:sovereignty`

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE10-S01-T01 | `packages/send` API + enforce canSend | 1d | PE09-S02-T01 | Denied when policy blocks | E10-F01-S01-T01/T02 |
| PE10-S01-T02 | Agent↛send dependency fence test | 0.5d | T01 | CI green | E10-F01-S01-T03 |
| PE10-S01-T03 | File-export (or mailto) channel stub | 1d | T01 | Honest success\|failed\|unknown | E10-F02-S01-T01, E10-F03-S01-T01 |
| PE10-S01-T04 | Host approveAndSend + UI outcome toasts | 1d | T03, PE01-S03-T02 | End-to-end stub | E10-F02-S01-T02, E10-F03-S01-T02 |

#### Story PE10-S02 — Audit egress on Timeline
**Est:** 1d · **Depends:** PE10-S01, PE12-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE10-S02-T01 | Emit Privacy.EgressRecorded + map unknown≠success | 1d | PE10-S01-T03, PE12-S01-T02 | Timeline shows egress | E10-F04-S01-T01/T02 |

#### Story PE08-S03 — Track status post-send
**Est:** 1d · **Depends:** PE08-S01, PE10-S01 · **Priority:** P1

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE08-S03-T01 | StageChanged transitions post-send | 1d | PE10-S01-T01, PE08-S01-T01 | Tracking ≠ prep stages | — |

#### Story PE12-S02 — Sanitized logs view
**Est:** 1d · **Depends:** PE12-S01 · **Priority:** P1

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE12-S02-T01 | Redaction helper + sanitized logs panel | 1d | PE12-S01-T03 | Secrets redacted | E13-F03-S01-T02 |

---

## Wave 6 — Agent & nudges

### Epic PE06 — Agent

#### Story PE06-S01 — Start and pause agent
**Est:** 2d · **Depends:** PE04-S01, PE05-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE06-S01-T01 | Agent state machine + events | 1d | PE02-S02-T03 | Started/Paused/Idle | E12-F01-S01-T01/T03 |
| PE06-S01-T02 | IPC start/pause + Agent UI | 1d | T01, PE01-S03-T02 | Pause keeps Queue | E12-F01-S01-T02, E12-F03-S01-T01 |

#### Story PE06-S02 — Orchestrate drafts into Queue
**Est:** 2.5d · **Depends:** PE06-S01, PE08-S01, PE09-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE06-S02-T01 | Prep steps: draft/tailor/enqueue orchestration | 1.5d | PE06-S01-T01, PE08-S01-T02, PE09-S01-T01 | Queue.Enqueued; no Send | E12-F02-S01-T01…T03 |
| PE06-S02-T02 | Integration: prep never calls send | 1d | T01, PE10-S01-T02 | Assert no egress | E12-F02-S01-T04 |

### Epic PE11 — Follow-ups

#### Story PE11-S01 — Schedule polite follow-up
**Est:** 1.5d · **Depends:** PE08-S03, PE02-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE11-S01-T01 | Follow-up entity + schedule after send hook | 1.5d | PE08-S03-T01, PE02-S01-T02 | FollowUp.Scheduled | E11-F01-S01-T01/T02 |

#### Story PE11-S03 — Scheduler survives restart
**Est:** 1.5d · **Depends:** PE11-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE11-S03-T01 | Scheduler job store + tick time-travel test | 1.5d | PE11-S01-T01 | Due after restart | E11-F02-S01-T01/T02 |

#### Story PE11-S02 — Calm due notification
**Est:** 1d · **Depends:** PE11-S01, PE04-S02

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE11-S02-T01 | Due notify + quiet hours defer | 1d | PE11-S03-T01, PE04-S02-T01 | Calm copy; sound off | E11-F02-S01-T03, E11-F03-S01-T01 |

#### Story PE11-S04 — Dismiss or send under policy
**Est:** 1.5d · **Depends:** PE11-S02, PE09-S02, PE10-S01

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE11-S04-T01 | Follow-ups UI list + dismiss | 1d | PE11-S01-T01 | Dismiss ≠ send | E11-F04-S01-T01/T02 |
| PE11-S04-T02 | Send follow-up via canSend path | 0.5d | T01, PE10-S01-T01 | Uses policy | E11-F04-S01-T03 |

---

## Wave 7 — First-run polish

### Epic PE13 — Onboarding

#### Story PE13-S01 — Calm first-run onboarding
**Est:** 2.5d · **Depends:** PE04-S01, PE03-S02, PE04-S03

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE13-S01-T01 | First-run flag + step shell | 0.5d | PE04-S01-T01 | Detects first run | E14-F01-S01-T01 |
| PE13-S01-T02 | Step: resume import path | 1d | T01, PE03-S02-T02 | Completes without model wall | E14-F01-S01-T02 |
| PE13-S01-T03 | Step: approval prefs + Agent chrome | 1d | T01, PE04-S01-T02, PE04-S03-T01 | Completes calmly | E14-F01-S01-T03 |

### QA — H1 must-pass (cross-cutting)
**Milestone:** W7 · **Labels:** `type:task` `fence:sovereignty` `wave:w7`

| Task ID | Title | Est | Depends | Done when | Twin |
|---------|-------|-----|---------|-----------|------|
| PE-QA-T01 | Résumé not sent without send path | 0.5d | PE10-S01-T03 | Mock asserts | E13-QA-T01 |
| PE-QA-T02 | Approval gate integration | 0.5d | PE10-S01-T01, PE09-S02-T01 | Blocked then allowed | E13-QA-T02 |
| PE-QA-T03 | Badge honesty (remote ≠ Agent · On-device) | 0.5d | PE04-S03-T01 | Assertion | E13-QA-T03 |
| PE-QA-T04 | Keyboard approve path | 0.5d | PE09-S02-T02 | Documented + tested | E13-QA-T05 |

---

## Wave 8 — Experimental (parked)

> Label all with `parked` `status:experimental`. Do **not** put in Ready.

| Story | Tasks (stubs — expand on admission) | Depends |
|-------|-------------------------------------|---------|
| PE05-S04 Remote AI Provider | PE05-S04-T01 Chrome honesty · T02 Local secrets only | PE05-S01 |
| PE14-S01 Knowledge store | PE14-S01-T01 CRUD local entries | PE02-S01 |
| PE14-S02 KnowledgeReader | PE14-S02-T01 Wire Context Builder port | PE14-S01, PE05-S03 |
| PE15-S01 Validation pipeline | PE15-S01-T01 Formatting→ATS→skills order | PE03-S04 |
| PE16-S01 Workflow → Wait for Approval | PE16-S01-T01 WorkflowRun to Queue | PE06, PE08, PE09 |
| PE16-S02 AI Task Queue UI | PE16-S02-T01 States Pending…Cancelled | PE16-S01 |
| PE16-S03 Step runners + unload | PE16-S03-T01 Runner units + unload | PE16-S01 |
| PE17–PE20 | One stub task each (see USER_STORIES) | per story |

---

## Wave 9 — Future (parked)

| Story | Stub task | Twin |
|-------|-----------|------|
| PE21-S01 Outcomes | PE21-S01-T01 Local outcome field (no guilt UX) | E15 |
| PE22–PE24, PE27–PE30 | One shell/stub task each | — |
| PE25-S01 Sample plugin | PE25-S01-T01 Capability-gated sample | E18 |
| PE26-S01 Export | PE26-S01-T01 User-triggered local export | E19-F02 |
| PE26-S02 Host Extensions | PE26-S02-T01 Contribution point stub | E19-F01 |

---

## Counts (Core import target)

| Level | Count (approx.) |
|-------|-----------------|
| Milestones | 10 |
| Epics (Core) | 13 |
| Stories (Core H1) | 42 |
| Tasks (Core + QA) | ~95 |
| Parked stories | ~21 |

---

## Import order

1. Create **labels**  
2. Create **milestones** W0–W9  
3. Open **epic** issues (PE01–PE13; park PE14+)  
4. Open **story** issues; set milestone + `blocked by` stories  
5. Open **task** issues from tables / CSV; one PR each  
6. Project view: group by Milestone (Wave); filter out `parked`

**Dedup rule:** If an `E*`-twin already exists in GitHub, link it and **do not** file a second task—update title to include `PE*` ID.

---

## Next Ready task

| Field | Value |
|-------|--------|
| **Issue** | `PE01-S01-T01 — Scaffold desktop window titled JobJitsu` |
| **Milestone** | W0 — Shell boots |
| **Estimate** | 1d |
| **Blocked by** | none |
| **Labels** | `type:task` `status:core-h1` `wave:w0` `area:shell` `priority:p0` |
