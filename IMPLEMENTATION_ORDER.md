# Implementation Order

> **Canonical build sequence** for JobJitsu.
>
> Source: [GITHUB_PROJECT_IMPORT.md](docs/backlog/GITHUB_PROJECT_IMPORT.md) ·
> [import/github-issues.csv](docs/backlog/import/github-issues.csv) ·
> [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)
>
> **Rules:** Do not skip dependencies. One task = one PR ≤ 1 day.
> Experimental/Future tasks are **not** in this Core order (see Parked).

---

## How to read this document

| Mark | Meaning |
|------|---------|
| **CP** | On the **critical path** (longest dependency chain by estimate) |
| **‖** | May run **in parallel** with other ‖ tasks in the same batch (deps satisfied) |
| Seq | Must wait for listed `blocked_by` tasks |

Within each milestone, complete tasks in table order unless marked ‖ in the same **Parallel batch**.

---

## Critical path

**Length:** ~12.5 working days (serialized estimates along the longest chain).

```text
PE01-S01-T01 → PE01-S01-T02 → PE02-S01-T01 → PE02-S01-T02 → PE08-S01-T01 → PE09-S01-T01 → PE09-S02-T01 → PE10-S01-T01 → PE08-S03-T01 → PE11-S01-T01 → PE11-S03-T01 → PE11-S02-T01
```

| # | Task | Est | Milestone |
|---|------|-----|-----------|
| 1 | `PE01-S01-T01` Scaffold desktop window titled JobJitsu | 1d | W0 — Shell boots |
| 2 | `PE01-S01-T02` Wire UI entry (React) into host webview | 1d | W0 — Shell boots |
| 3 | `PE02-S01-T01` Storage interface packages/storage | 0.5d | W1 — Data & event spine |
| 4 | `PE02-S01-T02` Local adapter roundtrip temp dir | 1d | W1 — Data & event spine |
| 5 | `PE08-S01-T01` Application entity + repository | 1d | W4 — Craft objects |
| 6 | `PE09-S01-T01` Queue repository + enqueue | 1d | W5 — Sovereignty path |
| 7 | `PE09-S02-T01` approve reject + canSend policy | 1d | W5 — Sovereignty path |
| 8 | `PE10-S01-T01` packages/send API + enforce canSend | 1d | W5 — Sovereignty path |
| 9 | `PE08-S03-T01` StageChanged transitions post-send | 1d | W5 — Sovereignty path |
| 10 | `PE11-S01-T01` Follow-up entity + schedule after send | 1.5d | W6 — Agent & nudges |
| 11 | `PE11-S03-T01` Scheduler job store + time-travel test | 1.5d | W6 — Agent & nudges |
| 12 | `PE11-S02-T01` Due notify + quiet hours defer | 1d | W6 — Agent & nudges |

**Sovereignty spine** (must stay green even when parallelizing around it):

```text
PE01 launch → PE02 storage+events → PE03/PE04 trust → PE05 AI →
PE08 apps → PE09 queue → PE10 send → PE10/PE12 egress audit
```

Agent (`PE06`) is **not** on the Send critical path (fence-only). Follow-ups (`PE11`) extend the path after Send.

---

## Global parallel batches

Tasks in the same batch have all dependencies satisfied and may proceed concurrently
(respect package ownership / WIP limits).

### Batch 0 (1 task)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE01-S01-T01` Scaffold desktop window titled JobJitsu | W0 | 1d | CP | — |

### Batch 1 (2 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE01-S01-T02` Wire UI entry (React) into host webview | W0 | 1d | CP | `PE01-S01-T01` |
| `PE01-S03-T01` Define IPC allowlist enum | W0 | 0.5d |  | `PE01-S01-T01` |

### Batch 2 (6 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE01-S01-T03` Smoke: launch with no career egress | W0 | 0.5d |  | `PE01-S01-T02` |
| `PE01-S02-T01` Shell layout sidebar main status | W0 | 1d |  | `PE01-S01-T02` |
| `PE01-S03-T02` Host dispatcher fails closed on unknown | W0 | 1d |  | `PE01-S03-T01` |
| `PE01-S04-T01` Design tokens + dark semantic theme | W0 | 1d |  | `PE01-S01-T02` |
| `PE02-S01-T01` Storage interface packages/storage | W1 | 0.5d | CP | `PE01-S01-T02` |
| `PE02-S02-T01` Event name catalog EVENT_SYSTEM | W1 | 1d |  | `PE01-S01-T02` |

### Batch 3 (12 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE01-S02-T02` Nav H1 section routes | W0 | 1d |  | `PE01-S02-T01` |
| `PE01-S03-T03` Typed UI bridge client | W0 | 0.5d |  | `PE01-S03-T02` |
| `PE01-S03-T04` Contract test: deny unknown + no UI AI | W0 | 0.5d |  | `PE01-S03-T02` |
| `PE01-S04-T02` Persist appearance preference | W0 | 1d |  | `PE01-S04-T01` |
| `PE01-S04-T03` AA contrast smoke primary text | W0 | 0.5d |  | `PE01-S04-T01` |
| `PE04-S03-T01` Agent On-device badge in status region | W0 | 1d |  | `PE01-S02-T01` |
| `PE02-S01-T02` Local adapter roundtrip temp dir | W1 | 1d | CP | `PE02-S01-T01` |
| `PE02-S01-T03` Blob put/get user-data path | W1 | 1d |  | `PE02-S01-T01` |
| `PE02-S01-T04` Path resolution helper | W1 | 0.5d |  | `PE02-S01-T01` |
| `PE02-S02-T02` ID-centric payload types | W1 | 0.5d |  | `PE02-S02-T01` |
| `PE02-S02-T03` In-process pub/sub bus | W1 | 1d |  | `PE02-S02-T01` |
| `PE13-S02-T01` JjEmptyState component | W2 | 0.5d |  | `PE01-S02-T01` |

### Batch 4 (11 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE04-S03-T02` Unavailable ready states without model | W0 | 0.5d |  | `PE04-S03-T01` |
| `PE02-S03-T01` Durable sink interface + memory sink | W1 | 0.5d |  | `PE02-S02-T03` |
| `PE03-S01-T01` Profile schema + repository | W2 | 1d |  | `PE02-S01-T02` |
| `PE04-S01-T01` Preferences schema + repository | W2 | 1d |  | `PE02-S01-T02` |
| `PE13-S02-T02` Wire Applications Queue Follow-ups empties | W2 | 1d |  | `PE13-S02-T01` |
| `PE05-S01-T01` AI provider interface + registry | W3 | 1d |  | `PE02-S02-T03` |
| `PE07-S01-T01` DiscoverySource types + registry | W4 | 1d |  | `PE02-S02-T03` |
| `PE08-S01-T01` Application entity + repository | W4 | 1d | CP | `PE02-S01-T02` |
| `PE12-S01-T01` Timeline repository append list | W5 | 1d |  | `PE02-S01-T02` |
| `PE06-S01-T01` Agent state machine + events | W6 | 1d |  | `PE02-S02-T03` |
| `PE-QA-T03` Badge honesty remote not On-device | W7 | 0.5d |  | `PE04-S03-T01` |

### Batch 5 (19 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE02-S03-T02` Durable allowlist config | W1 | 0.5d |  | `PE02-S03-T01` |
| `PE03-S01-T02` Profile update API + UI form | W2 | 1d |  | `PE03-S01-T01` |
| `PE03-S02-T01` Host import resume blob+metadata | W2 | 1d |  | `PE03-S01-T01`, `PE01-S03-T02` |
| `PE04-S01-T02` Seed approval-before-send true + IPC | W2 | 0.5d |  | `PE04-S01-T01` |
| `PE04-S02-T01` Quiet hours schema + UI inputs | W2 | 0.5d |  | `PE04-S01-T01` |
| `PE04-S04-T01` Fit tone constraint fields + Changed | W2 | 1d |  | `PE04-S01-T01` |
| `PE05-S01-T02` FakeProvider health complete | W3 | 1d |  | `PE05-S01-T01` |
| `PE05-S01-T03` Emit Ai.LocalModel readiness events | W3 | 0.5d |  | `PE05-S01-T01`, `PE02-S02-T03` |
| `PE05-S02-T01` LocalProvider stub model path pref | W3 | 1d |  | `PE05-S01-T01`, `PE04-S01-T01` |
| `PE05-S03-T01` ContextAssembler allowlist + budget | W3 | 1d |  | `PE05-S01-T01`, `PE03-S01-T01` |
| `PE07-S01-T02` CSV fixture source + RolesFound | W4 | 1d |  | `PE07-S01-T01`, `PE02-S01-T02` |
| `PE08-S01-T02` Create update draft use-cases | W4 | 1d |  | `PE08-S01-T01` |
| `PE08-S01-T03` Duplicate soft-warn | W4 | 0.5d |  | `PE08-S01-T01` |
| `PE08-S04-T01` Applications list UI | W4 | 1d |  | `PE08-S01-T01`, `PE01-S02-T02` |
| `PE09-S01-T01` Queue repository + enqueue | W5 | 1d | CP | `PE08-S01-T01` |
| `PE12-S01-T02` Wire durable sink to timeline | W5 | 0.5d |  | `PE12-S01-T01`, `PE02-S03-T01` |
| `PE12-S01-T03` Timeline UI list | W5 | 0.5d |  | `PE12-S01-T01`, `PE01-S02-T02` |
| `PE06-S01-T02` IPC start pause + Agent UI | W6 | 1d |  | `PE06-S01-T01`, `PE01-S03-T02` |
| `PE13-S01-T01` First-run flag + step shell | W7 | 0.5d |  | `PE04-S01-T01` |

### Batch 6 (15 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE03-S02-T02` UI import + Resume.Imported id only | W2 | 1d |  | `PE03-S02-T01` |
| `PE03-S03-T01` Version list API select without send | W2 | 1d |  | `PE03-S02-T01` |
| `PE05-S02-T02` Preferences model path + recovery copy | W3 | 0.5d |  | `PE05-S02-T01` |
| `PE05-S03-T02` Minimization unit test | W3 | 0.5d |  | `PE05-S03-T01` |
| `PE05-S05-T01` Offline local provider test | W3 | 0.5d |  | `PE05-S01-T02` |
| `PE03-S04-T01` tailorDraft use-case no send | W4 | 1d |  | `PE05-S03-T01`, `PE05-S01-T02` |
| `PE07-S02-T01` Curation filter + RolesCurated | W4 | 1d |  | `PE07-S01-T01`, `PE04-S04-T01` |
| `PE07-S03-T01` Advisory job analysis use-case | W4 | 1d |  | `PE07-S01-T01`, `PE05-S03-T01` |
| `PE08-S02-T01` Cover letter draft via FakeProvider | W4 | 1d |  | `PE08-S01-T01`, `PE05-S01-T02` |
| `PE08-S04-T02` Detail editor + save | W4 | 0.5d |  | `PE08-S01-T02` |
| `PE09-S01-T02` Queue.Enqueued + list UI stub | W5 | 0.5d |  | `PE09-S01-T01`, `PE02-S02-T03` |
| `PE09-S02-T01` approve reject + canSend policy | W5 | 1d | CP | `PE09-S01-T01`, `PE04-S01-T02` |
| `PE12-S02-T01` Redaction helper + sanitized logs panel | W5 | 1d |  | `PE12-S01-T03` |
| `PE06-S02-T01` Prep orchestration draft tailor enqueue | W6 | 1.5d |  | `PE06-S01-T01`, `PE08-S01-T02`, `PE09-S01-T01` |
| `PE13-S01-T03` Onboarding step approval + Agent chrome | W7 | 1d |  | `PE13-S01-T01`, `PE04-S01-T02`, `PE04-S03-T01` |

### Batch 7 (6 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE05-S05-T02` No silent remote fallback assertion | W3 | 0.5d |  | `PE05-S05-T01` |
| `PE03-S04-T02` Fence test tailor not send | W4 | 0.5d |  | `PE03-S04-T01` |
| `PE07-S04-T01` Roles list UI + draft CTA no send | W4 | 1d |  | `PE07-S02-T01`, `PE01-S02-T02` |
| `PE09-S02-T02` Queue UI actions + policy contract test | W5 | 1d |  | `PE09-S02-T01` |
| `PE10-S01-T01` packages/send API + enforce canSend | W5 | 1d | CP | `PE09-S02-T01` |
| `PE13-S01-T02` Onboarding step resume import | W7 | 1d |  | `PE13-S01-T01`, `PE03-S02-T02` |

### Batch 8 (5 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE08-S03-T01` StageChanged transitions post-send | W5 | 1d | CP | `PE10-S01-T01`, `PE08-S01-T01` |
| `PE10-S01-T02` Agent must not depend on send fence | W5 | 0.5d |  | `PE10-S01-T01` |
| `PE10-S01-T03` File-export or mailto channel stub | W5 | 1d |  | `PE10-S01-T01` |
| `PE-QA-T02` Approval gate integration test | W7 | 0.5d |  | `PE10-S01-T01`, `PE09-S02-T01` |
| `PE-QA-T04` Keyboard approve path | W7 | 0.5d |  | `PE09-S02-T02` |

### Batch 9 (5 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE10-S01-T04` Host approveAndSend + outcome toasts | W5 | 1d |  | `PE10-S01-T03`, `PE01-S03-T02` |
| `PE10-S02-T01` EgressRecorded + unknown not success | W5 | 1d |  | `PE10-S01-T03`, `PE12-S01-T02` |
| `PE06-S02-T02` Integration prep never calls send | W6 | 1d |  | `PE06-S02-T01`, `PE10-S01-T02` |
| `PE11-S01-T01` Follow-up entity + schedule after send | W6 | 1.5d | CP | `PE08-S03-T01`, `PE02-S01-T02` |
| `PE-QA-T01` Resume not sent without send path | W7 | 0.5d |  | `PE10-S01-T03` |

### Batch 10 (2 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE11-S03-T01` Scheduler job store + time-travel test | W6 | 1.5d | CP | `PE11-S01-T01` |
| `PE11-S04-T01` Follow-ups UI list + dismiss | W6 | 1d |  | `PE11-S01-T01` |

### Batch 11 (2 tasks)

| Task | Milestone | Est | CP | Depends |
|------|-----------|-----|----|---------|
| `PE11-S02-T01` Due notify + quiet hours defer | W6 | 1d | CP | `PE11-S03-T01`, `PE04-S02-T01` |
| `PE11-S04-T02` Send follow-up via canSend path | W6 | 0.5d |  | `PE11-S04-T01`, `PE10-S01-T01` |

---

## By milestone

## W0 — Shell boots

**Tasks:** 14 · **Estimate sum:** 11d (not calendar time if parallelized)

### Parallel structure

- Batch L0: `PE01-S01-T01` **CP**
- Batch L1 **‖ parallel:** `PE01-S01-T02` **CP**, `PE01-S03-T01`
- Batch L2 **‖ parallel:** `PE01-S01-T03`, `PE01-S02-T01`, `PE01-S03-T02`, `PE01-S04-T01`
- Batch L3 **‖ parallel:** `PE01-S02-T02`, `PE01-S03-T03`, `PE01-S03-T04`, `PE01-S04-T02`, `PE01-S04-T03`, `PE04-S03-T01`
- Batch L4: `PE04-S03-T02`

| Seq | Task | Est | CP | ‖ | Depends | Twin |
|----:|------|-----|----|---|---------|------|
| 1 | `PE01-S01-T01` — Scaffold desktop window titled JobJitsu | 1d | CP |  | — | E01-F02-S01-T01 |
| 2 | `PE01-S01-T02` — Wire UI entry (React) into host webview | 1d | CP | ‖ | `PE01-S01-T01` | E01-F03-S01-T01 |
| 3 | `PE01-S03-T01` — Define IPC allowlist enum | 0.5d |  | ‖ | `PE01-S01-T01` | E03-F01-S01-T01 |
| 4 | `PE01-S01-T03` — Smoke: launch with no career egress | 0.5d |  | ‖ | `PE01-S01-T02` | — |
| 5 | `PE01-S02-T01` — Shell layout sidebar main status | 1d |  | ‖ | `PE01-S01-T02` | E03-F02-S01-T01 |
| 6 | `PE01-S03-T02` — Host dispatcher fails closed on unknown | 1d |  | ‖ | `PE01-S03-T01` | E03-F01-S01-T02 |
| 7 | `PE01-S04-T01` — Design tokens + dark semantic theme | 1d |  | ‖ | `PE01-S01-T02` | E01-F04-S01-T02 |
| 8 | `PE01-S02-T02` — Nav H1 section routes | 1d |  | ‖ | `PE01-S02-T01` | E03-F02-S01-T02 |
| 9 | `PE01-S03-T03` — Typed UI bridge client | 0.5d |  | ‖ | `PE01-S03-T02` | E03-F01-S01-T03 |
| 10 | `PE01-S03-T04` — Contract test: deny unknown + no UI AI | 0.5d |  | ‖ | `PE01-S03-T02` | E03-F01-S01-T04 |
| 11 | `PE01-S04-T02` — Persist appearance preference | 1d |  | ‖ | `PE01-S04-T01` | E03-F03-S01-T01 |
| 12 | `PE01-S04-T03` — AA contrast smoke primary text | 0.5d |  | ‖ | `PE01-S04-T01` | — |
| 13 | `PE04-S03-T01` — Agent On-device badge in status region | 1d |  | ‖ | `PE01-S02-T01` | E05-F03-S01-T01 |
| 14 | `PE04-S03-T02` — Unavailable ready states without model | 0.5d |  |  | `PE04-S03-T01` | — |

**Milestone exit:** see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) wave exit criteria.

---

## W1 — Data & event spine

**Tasks:** 9 · **Estimate sum:** 6.5d (not calendar time if parallelized)

### Parallel structure

- Batch L2 **‖ parallel:** `PE02-S01-T01` **CP**, `PE02-S02-T01`
- Batch L3 **‖ parallel:** `PE02-S01-T02` **CP**, `PE02-S01-T03`, `PE02-S01-T04`, `PE02-S02-T02`, `PE02-S02-T03`
- Batch L4: `PE02-S03-T01`
- Batch L5: `PE02-S03-T02`

| Seq | Task | Est | CP | ‖ | Depends | Twin |
|----:|------|-----|----|---|---------|------|
| 15 | `PE02-S01-T01` — Storage interface packages/storage | 0.5d | CP | ‖ | `PE01-S01-T02` | E02-F01-S01-T01 |
| 16 | `PE02-S02-T01` — Event name catalog EVENT_SYSTEM | 1d |  | ‖ | `PE01-S01-T02` | E02-F02-S01-T01 |
| 17 | `PE02-S01-T02` — Local adapter roundtrip temp dir | 1d | CP | ‖ | `PE02-S01-T01` | E02-F01-S01-T02 |
| 18 | `PE02-S01-T03` — Blob put/get user-data path | 1d |  | ‖ | `PE02-S01-T01` | E02-F01-S01-T03 |
| 19 | `PE02-S01-T04` — Path resolution helper | 0.5d |  | ‖ | `PE02-S01-T01` | E02-F01-S01-T04 |
| 20 | `PE02-S02-T02` — ID-centric payload types | 0.5d |  | ‖ | `PE02-S02-T01` | E02-F02-S01-T02 |
| 21 | `PE02-S02-T03` — In-process pub/sub bus | 1d |  | ‖ | `PE02-S02-T01` | E02-F03-S01-T01 |
| 22 | `PE02-S03-T01` — Durable sink interface + memory sink | 0.5d |  |  | `PE02-S02-T03` | E02-F04-S01-T01 |
| 23 | `PE02-S03-T02` — Durable allowlist config | 0.5d |  |  | `PE02-S03-T01` | E02-F04-S01-T02 |

**Milestone exit:** see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) wave exit criteria.

---

## W2 — Trust & identity

**Tasks:** 11 · **Estimate sum:** 9.5d (not calendar time if parallelized)

### Parallel structure

- Batch L3: `PE13-S02-T01`
- Batch L4 **‖ parallel:** `PE03-S01-T01`, `PE04-S01-T01`, `PE13-S02-T02`
- Batch L5 **‖ parallel:** `PE03-S01-T02`, `PE03-S02-T01`, `PE04-S01-T02`, `PE04-S02-T01`, `PE04-S04-T01`
- Batch L6 **‖ parallel:** `PE03-S02-T02`, `PE03-S03-T01`

| Seq | Task | Est | CP | ‖ | Depends | Twin |
|----:|------|-----|----|---|---------|------|
| 24 | `PE13-S02-T01` — JjEmptyState component | 0.5d |  |  | `PE01-S02-T01` | E14-F02-S01-T01 |
| 25 | `PE03-S01-T01` — Profile schema + repository | 1d |  | ‖ | `PE02-S01-T02` | E04-F01-S01-T01 |
| 26 | `PE04-S01-T01` — Preferences schema + repository | 1d |  | ‖ | `PE02-S01-T02` | E05-F01-S01-T01 |
| 27 | `PE13-S02-T02` — Wire Applications Queue Follow-ups empties | 1d |  | ‖ | `PE13-S02-T01` | E14-F02-S01-T02 |
| 28 | `PE03-S01-T02` — Profile update API + UI form | 1d |  | ‖ | `PE03-S01-T01` | E04-F02-S01-T01 |
| 29 | `PE03-S02-T01` — Host import resume blob+metadata | 1d |  | ‖ | `PE03-S01-T01`, `PE01-S03-T02` | E04-F01-S01-T02 |
| 30 | `PE04-S01-T02` — Seed approval-before-send true + IPC | 0.5d |  | ‖ | `PE04-S01-T01` | E05-F02-S01-T01 |
| 31 | `PE04-S02-T01` — Quiet hours schema + UI inputs | 0.5d |  | ‖ | `PE04-S01-T01` | E05-F02-S01-T02 |
| 32 | `PE04-S04-T01` — Fit tone constraint fields + Changed | 1d |  | ‖ | `PE04-S01-T01` | — |
| 33 | `PE03-S02-T02` — UI import + Resume.Imported id only | 1d |  | ‖ | `PE03-S02-T01` | E04-F01-S01-T03 |
| 34 | `PE03-S03-T01` — Version list API select without send | 1d |  | ‖ | `PE03-S02-T01` | — |

**Milestone exit:** see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) wave exit criteria.

---

## W3 — Local intelligence

**Tasks:** 9 · **Estimate sum:** 6.5d (not calendar time if parallelized)

### Parallel structure

- Batch L4: `PE05-S01-T01`
- Batch L5 **‖ parallel:** `PE05-S01-T02`, `PE05-S01-T03`, `PE05-S02-T01`, `PE05-S03-T01`
- Batch L6 **‖ parallel:** `PE05-S02-T02`, `PE05-S03-T02`, `PE05-S05-T01`
- Batch L7: `PE05-S05-T02`

| Seq | Task | Est | CP | ‖ | Depends | Twin |
|----:|------|-----|----|---|---------|------|
| 35 | `PE05-S01-T01` — AI provider interface + registry | 1d |  |  | `PE02-S02-T03` | E06-F01-S01-T01 |
| 36 | `PE05-S01-T02` — FakeProvider health complete | 1d |  | ‖ | `PE05-S01-T01` | E06-F02-S01-T01 |
| 37 | `PE05-S01-T03` — Emit Ai.LocalModel readiness events | 0.5d |  | ‖ | `PE05-S01-T01`, `PE02-S02-T03` | E06-F05-S01-T01 |
| 38 | `PE05-S02-T01` — LocalProvider stub model path pref | 1d |  | ‖ | `PE05-S01-T01`, `PE04-S01-T01` | E06-F03-S01-T01 |
| 39 | `PE05-S03-T01` — ContextAssembler allowlist + budget | 1d |  | ‖ | `PE05-S01-T01`, `PE03-S01-T01` | E06-F04-S01-T01 |
| 40 | `PE05-S02-T02` — Preferences model path + recovery copy | 0.5d |  | ‖ | `PE05-S02-T01` | E05-F04-S01-T01 |
| 41 | `PE05-S03-T02` — Minimization unit test | 0.5d |  | ‖ | `PE05-S03-T01` | — |
| 42 | `PE05-S05-T01` — Offline local provider test | 0.5d |  | ‖ | `PE05-S01-T02` | — |
| 43 | `PE05-S05-T02` — No silent remote fallback assertion | 0.5d |  |  | `PE05-S05-T01` | — |

**Milestone exit:** see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) wave exit criteria.

---

## W4 — Craft objects

**Tasks:** 13 · **Estimate sum:** 11.5d (not calendar time if parallelized)

### Parallel structure

- Batch L4 **‖ parallel:** `PE07-S01-T01`, `PE08-S01-T01` **CP**
- Batch L5 **‖ parallel:** `PE07-S01-T02`, `PE08-S01-T02`, `PE08-S01-T03`, `PE08-S04-T01`
- Batch L6 **‖ parallel:** `PE03-S04-T01`, `PE07-S02-T01`, `PE07-S03-T01`, `PE08-S02-T01`, `PE08-S04-T02`
- Batch L7 **‖ parallel:** `PE03-S04-T02`, `PE07-S04-T01`

| Seq | Task | Est | CP | ‖ | Depends | Twin |
|----:|------|-----|----|---|---------|------|
| 44 | `PE07-S01-T01` — DiscoverySource types + registry | 1d |  | ‖ | `PE02-S02-T03` | E07-F01-S01-T01 |
| 45 | `PE08-S01-T01` — Application entity + repository | 1d | CP | ‖ | `PE02-S01-T02` | E08-F01-S01-T01 |
| 46 | `PE07-S01-T02` — CSV fixture source + RolesFound | 1d |  | ‖ | `PE07-S01-T01`, `PE02-S01-T02` | E07-F02-S01-T01 |
| 47 | `PE08-S01-T02` — Create update draft use-cases | 1d |  | ‖ | `PE08-S01-T01` | E08-F01-S01-T02 |
| 48 | `PE08-S01-T03` — Duplicate soft-warn | 0.5d |  | ‖ | `PE08-S01-T01` | — |
| 49 | `PE08-S04-T01` — Applications list UI | 1d |  | ‖ | `PE08-S01-T01`, `PE01-S02-T02` | E08-F03-S01-T01 |
| 50 | `PE03-S04-T01` — tailorDraft use-case no send | 1d |  | ‖ | `PE05-S03-T01`, `PE05-S01-T02` | E06-F04-S01-T02 |
| 51 | `PE07-S02-T01` — Curation filter + RolesCurated | 1d |  | ‖ | `PE07-S01-T01`, `PE04-S04-T01` | E07-F03-S01-T01 |
| 52 | `PE07-S03-T01` — Advisory job analysis use-case | 1d |  | ‖ | `PE07-S01-T01`, `PE05-S03-T01` | — |
| 53 | `PE08-S02-T01` — Cover letter draft via FakeProvider | 1d |  | ‖ | `PE08-S01-T01`, `PE05-S01-T02` | — |
| 54 | `PE08-S04-T02` — Detail editor + save | 0.5d |  | ‖ | `PE08-S01-T02` | E08-F03-S01-T02 |
| 55 | `PE03-S04-T02` — Fence test tailor not send | 0.5d |  | ‖ | `PE03-S04-T01` | — |
| 56 | `PE07-S04-T01` — Roles list UI + draft CTA no send | 1d |  | ‖ | `PE07-S02-T01`, `PE01-S02-T02` | E07-F04-S01-T01 |

**Milestone exit:** see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) wave exit criteria.

---

## W5 — Sovereignty path

**Tasks:** 14 · **Estimate sum:** 12d (not calendar time if parallelized)

### Parallel structure

- Batch L4: `PE12-S01-T01`
- Batch L5 **‖ parallel:** `PE09-S01-T01` **CP**, `PE12-S01-T02`, `PE12-S01-T03`
- Batch L6 **‖ parallel:** `PE09-S01-T02`, `PE09-S02-T01` **CP**, `PE12-S02-T01`
- Batch L7 **‖ parallel:** `PE09-S02-T02`, `PE10-S01-T01` **CP**
- Batch L8 **‖ parallel:** `PE08-S03-T01` **CP**, `PE10-S01-T02`, `PE10-S01-T03`
- Batch L9 **‖ parallel:** `PE10-S01-T04`, `PE10-S02-T01`

| Seq | Task | Est | CP | ‖ | Depends | Twin |
|----:|------|-----|----|---|---------|------|
| 57 | `PE12-S01-T01` — Timeline repository append list | 1d |  |  | `PE02-S01-T02` | E13-F01-S01-T01 |
| 58 | `PE09-S01-T01` — Queue repository + enqueue | 1d | CP | ‖ | `PE08-S01-T01` | E09-F01-S01-T01 |
| 59 | `PE12-S01-T02` — Wire durable sink to timeline | 0.5d |  | ‖ | `PE12-S01-T01`, `PE02-S03-T01` | E13-F02-S01-T01 |
| 60 | `PE12-S01-T03` — Timeline UI list | 0.5d |  | ‖ | `PE12-S01-T01`, `PE01-S02-T02` | E13-F03-S01-T01 |
| 61 | `PE09-S01-T02` — Queue.Enqueued + list UI stub | 0.5d |  | ‖ | `PE09-S01-T01`, `PE02-S02-T03` | E09-F01-S01-T02 |
| 62 | `PE09-S02-T01` — approve reject + canSend policy | 1d | CP | ‖ | `PE09-S01-T01`, `PE04-S01-T02` | E09-F02-S01-T01 |
| 63 | `PE12-S02-T01` — Redaction helper + sanitized logs panel | 1d |  | ‖ | `PE12-S01-T03` | E13-F03-S01-T02 |
| 64 | `PE09-S02-T02` — Queue UI actions + policy contract test | 1d |  | ‖ | `PE09-S02-T01` | E09-F02-S01-T03 |
| 65 | `PE10-S01-T01` — packages/send API + enforce canSend | 1d | CP | ‖ | `PE09-S02-T01` | E10-F01-S01-T01 |
| 66 | `PE08-S03-T01` — StageChanged transitions post-send | 1d | CP | ‖ | `PE10-S01-T01`, `PE08-S01-T01` | — |
| 67 | `PE10-S01-T02` — Agent must not depend on send fence | 0.5d |  | ‖ | `PE10-S01-T01` | E10-F01-S01-T03 |
| 68 | `PE10-S01-T03` — File-export or mailto channel stub | 1d |  | ‖ | `PE10-S01-T01` | E10-F02-S01-T01 |
| 69 | `PE10-S01-T04` — Host approveAndSend + outcome toasts | 1d |  | ‖ | `PE10-S01-T03`, `PE01-S03-T02` | E10-F02-S01-T02 |
| 70 | `PE10-S02-T01` — EgressRecorded + unknown not success | 1d |  | ‖ | `PE10-S01-T03`, `PE12-S01-T02` | E10-F04-S01-T01 |

**Milestone exit:** see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) wave exit criteria.

---

## W6 — Agent & nudges

**Tasks:** 9 · **Estimate sum:** 10d (not calendar time if parallelized)

### Parallel structure

- Batch L4: `PE06-S01-T01`
- Batch L5: `PE06-S01-T02`
- Batch L6: `PE06-S02-T01`
- Batch L9 **‖ parallel:** `PE06-S02-T02`, `PE11-S01-T01` **CP**
- Batch L10 **‖ parallel:** `PE11-S03-T01` **CP**, `PE11-S04-T01`
- Batch L11 **‖ parallel:** `PE11-S02-T01` **CP**, `PE11-S04-T02`

| Seq | Task | Est | CP | ‖ | Depends | Twin |
|----:|------|-----|----|---|---------|------|
| 71 | `PE06-S01-T01` — Agent state machine + events | 1d |  |  | `PE02-S02-T03` | E12-F01-S01-T01 |
| 72 | `PE06-S01-T02` — IPC start pause + Agent UI | 1d |  |  | `PE06-S01-T01`, `PE01-S03-T02` | E12-F01-S01-T02 |
| 73 | `PE06-S02-T01` — Prep orchestration draft tailor enqueue | 1.5d |  |  | `PE06-S01-T01`, `PE08-S01-T02`, `PE09-S01-T01` | E12-F02-S01-T03 |
| 74 | `PE06-S02-T02` — Integration prep never calls send | 1d |  | ‖ | `PE06-S02-T01`, `PE10-S01-T02` | E12-F02-S01-T04 |
| 75 | `PE11-S01-T01` — Follow-up entity + schedule after send | 1.5d | CP | ‖ | `PE08-S03-T01`, `PE02-S01-T02` | E11-F01-S01-T01 |
| 76 | `PE11-S03-T01` — Scheduler job store + time-travel test | 1.5d | CP | ‖ | `PE11-S01-T01` | E11-F02-S01-T01 |
| 77 | `PE11-S04-T01` — Follow-ups UI list + dismiss | 1d |  | ‖ | `PE11-S01-T01` | E11-F04-S01-T01 |
| 78 | `PE11-S02-T01` — Due notify + quiet hours defer | 1d | CP | ‖ | `PE11-S03-T01`, `PE04-S02-T01` | E11-F03-S01-T01 |
| 79 | `PE11-S04-T02` — Send follow-up via canSend path | 0.5d |  | ‖ | `PE11-S04-T01`, `PE10-S01-T01` | E11-F04-S01-T03 |

**Milestone exit:** see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) wave exit criteria.

---

## W7 — First-run polish

**Tasks:** 7 · **Estimate sum:** 4.5d (not calendar time if parallelized)

### Parallel structure

- Batch L4: `PE-QA-T03`
- Batch L5: `PE13-S01-T01`
- Batch L6: `PE13-S01-T03`
- Batch L7: `PE13-S01-T02`
- Batch L8 **‖ parallel:** `PE-QA-T02`, `PE-QA-T04`
- Batch L9: `PE-QA-T01`

| Seq | Task | Est | CP | ‖ | Depends | Twin |
|----:|------|-----|----|---|---------|------|
| 80 | `PE-QA-T03` — Badge honesty remote not On-device | 0.5d |  |  | `PE04-S03-T01` | E13-QA-T03 |
| 81 | `PE13-S01-T01` — First-run flag + step shell | 0.5d |  |  | `PE04-S01-T01` | E14-F01-S01-T01 |
| 82 | `PE13-S01-T03` — Onboarding step approval + Agent chrome | 1d |  |  | `PE13-S01-T01`, `PE04-S01-T02`, `PE04-S03-T01` | E14-F01-S01-T03 |
| 83 | `PE13-S01-T02` — Onboarding step resume import | 1d |  |  | `PE13-S01-T01`, `PE03-S02-T02` | E14-F01-S01-T02 |
| 84 | `PE-QA-T02` — Approval gate integration test | 0.5d |  | ‖ | `PE10-S01-T01`, `PE09-S02-T01` | E13-QA-T02 |
| 85 | `PE-QA-T04` — Keyboard approve path | 0.5d |  | ‖ | `PE09-S02-T02` | E13-QA-T05 |
| 86 | `PE-QA-T01` — Resume not sent without send path | 0.5d |  |  | `PE10-S01-T03` | E13-QA-T01 |

**Milestone exit:** see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) wave exit criteria.

---

## Parked (not in Core order)

Do not schedule until FEATURES admits them. Listed for completeness only:

| Band | Stories |
|------|---------|
| Experimental W8 | PE05-S04, PE14–PE20 |
| Future W9 | PE21–PE30 |

Expand tasks on admission using [GITHUB_PROJECT_IMPORT.md](docs/backlog/GITHUB_PROJECT_IMPORT.md) Wave 8–9 stubs.

---

## Next task

| Field | Value |
|-------|--------|
| **Start** | `PE01-S01-T01` — Scaffold desktop window titled JobJitsu |
| **Batch** | 0 |
| **Parallel with** | (none — first) |
| **Then** | `PE01-S01-T02` (CP/spine) ‖ optionally prepare docs-only work |

---

## Authority

| Doc | Role |
|-----|------|
| **This file** | Canonical **task** implementation order |
| [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) | Wave / story ordering + GitHub mapping |
| [docs/backlog/DEPENDENCY_GRAPH.md](docs/backlog/DEPENDENCY_GRAPH.md) | `E*` epic waves |
| [docs/backlog/TECHNICAL_TASKS.md](docs/backlog/TECHNICAL_TASKS.md) | Legacy `E*` day-tasks (twins) |
| [docs/backlog/VERTICAL_SLICES.md](docs/backlog/VERTICAL_SLICES.md) | One-slice process |

If this file and a twin `E*` task conflict, **prefer this order** and close/link the duplicate.

