# Dependency Graph

How backlog work unlocks. Prefer finishing an earlier **wave** before starting the next. Within a wave, tasks can proceed in parallel if their `Depends` are satisfied.

Full task deps: [TECHNICAL_TASKS.md](./TECHNICAL_TASKS.md).

---

## Epic-level graph

```mermaid
flowchart TB
  E01[E01 Platform]
  E02[E02 Storage and Events]
  E03[E03 Shell and IPC]
  E04[E04 Identity]
  E05[E05 Prefs and Privacy Chrome]
  E06[E06 Local Intelligence]
  E07[E07 Discovery]
  E08[E08 Applications]
  E09[E09 Queue]
  E10[E10 Send]
  E11[E11 Follow-ups and Scheduler]
  E12[E12 Agent]
  E13[E13 Timeline]
  E14[E14 Onboarding]
  E15[E15 Outcomes H2]
  E16[E16 Timeline Depth H2]
  E17[E17 Career Craft H3]
  E18[E18 Plugins H4]
  E19[E19 Extensions H4]

  E01 --> E02
  E01 --> E03
  E02 --> E04
  E02 --> E05
  E03 --> E05
  E04 --> E06
  E05 --> E06
  E02 --> E07
  E05 --> E07
  E04 --> E08
  E06 --> E08
  E07 --> E08
  E08 --> E09
  E05 --> E09
  E09 --> E10
  E10 --> E11
  E02 --> E11
  E05 --> E11
  E07 --> E12
  E08 --> E12
  E09 --> E12
  E10 -.->|fence only: agent must not call send| E12
  E02 --> E13
  E10 --> E13
  E09 --> E13
  E04 --> E14
  E05 --> E14
  E12 --> E14
  E08 --> E14
  E08 --> E15
  E13 --> E16
  E03 --> E17
  E06 --> E18
  E12 --> E18
  E07 --> E19
  E10 --> E19
  E04 --> E19
```

Dashed edge E10→E12 means **policy/fence dependency** (tests proving agent does not import/execute send), not a feature call edge.

---

## Feature critical path (H1 spine)

```mermaid
flowchart LR
  tokens[E01 tokens]
  storage[E02 storage]
  events[E02 events]
  ipc[E03 IPC]
  identity[E04 identity]
  prefs[E05 prefs]
  ai[E06 AI]
  discovery[E07 discovery]
  apps[E08 apps]
  queue[E09 queue]
  send[E10 send]
  agent[E12 agent]
  follow[E11 follow-ups]
  timeline[E13 timeline]
  onboard[E14 onboarding]

  tokens --> ipc
  storage --> identity
  storage --> prefs
  events --> ai
  events --> queue
  events --> send
  ipc --> prefs
  identity --> ai
  prefs --> ai
  ai --> apps
  discovery --> apps
  apps --> queue
  prefs --> queue
  queue --> send
  send --> follow
  send --> timeline
  queue --> agent
  apps --> agent
  discovery --> agent
  identity --> onboard
  prefs --> onboard
  agent --> onboard
```

---

## Build waves

### Wave 0 — Repo boots
**Goal:** Dev can run UI shell with tokens.  
**Epics:** E01  
**Exit:** Tauri window + React + dark canvas.

### Wave 1 — Data & chrome spine
**Goal:** Persist data; navigate app; talk host↔UI.  
**Epics:** E02, E03 (parallel after E01)  
**Exit:** Storage roundtrip; event bus test; nav + IPC ping; JjButton.

### Wave 2 — User trust surface
**Goal:** Résumé local; prefs; honest pill.  
**Epics:** E04, E05  
**Exit:** Import resume; approval default on; Local LLM pill mounted.

### Wave 3 — Intelligence & craft objects
**Goal:** Tailor drafts from local roles.  
**Epics:** E06, E07, then E08  
**Exit:** Fake provider tailor; CSV roles; applications list/detail.

### Wave 4 — Sovereignty path
**Goal:** Review → approve → egress audited.  
**Epics:** E09, E10, E13 (timeline sink)  
**Exit:** canSend enforced; file-export channel; egress on timeline; agent̸→send fence green.

### Wave 5 — Agent & nudges
**Goal:** Preparative agent + polite follow-ups.  
**Epics:** E12, E11 (scheduler can start once E02+E05 ready; full send hook after E10)  
**Exit:** Pause/resume; prep enqueues; follow-up due caution; no auto-send.

### Wave 6 — First-run polish & must-pass
**Goal:** Ship-quality H1 companion.  
**Epics:** E14 + QA tasks  
**Exit:** Three-beat onboarding; empty states; privacy must-pass tests green.

### Wave 7 — H2 depth
**Epics:** E15, E16  
**Exit:** Outcomes + deeper timeline without guilt UX.

### Wave 8 — H3 shells
**Epics:** E17 (admission test per module before deep tasks)

### Wave 9 — H4 ecosystem
**Epics:** E18, E19  
**Exit:** Sample plugin fail-closed; export on demand.

---

## Parallelization tips

| Parallel tracks | After |
|-----------------|-------|
| Storage ‖ Events ‖ UI tokens | Wave 0 |
| Identity ‖ Preferences UI | Wave 1 |
| AI fake provider ‖ CSV discovery | Wave 2 |
| Applications UI ‖ Queue domain | Wave 3 (apps entity first) |
| Timeline UI ‖ Send toasts | Wave 4 |
| Agent UI ‖ Scheduler core | Wave 4/5 |

---

## Hard constraints (never invert)

1. **E10 before any “auto apply” idea** — and still never auto apply.  
2. **E09 policy before E10 execute** when approval default on.  
3. **E06 fake provider before real local runner** for unblocking UI.  
4. **E12 must not gain a dependency on E10 execute** — only shared policy types/tests.  
5. **No H3/H4 work that violates non-goals** to “go faster.”

---

## Mapping to ADRs

| Wave | ADRs exercised |
|------|----------------|
| 0 | 0001 Tauri, 0002 React, 0008 monorepo, 0011 TS |
| 1 | 0003 events, 0006 storage, 0013 IPC |
| 2–3 | 0005 AI |
| 4 | 0009 send boundary, 0007 testing |
| 5 | 0010 scheduler |
| 9 | 0004 plugins, 0012 extensions |
