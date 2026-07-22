# JobJitsu Backlog

> Epics → Features → User Stories → Acceptance Criteria → Technical Tasks → Dependencies  
> Every technical task is sized for **one working day** and is independently implementable once its listed dependencies are done.

**Anchors:** [Product vision](../product/PRODUCT_VISION.md) · [Product modules](../product/FEATURES.md) · [Epic features](./EPIC_FEATURES.md) · [Architecture](../architecture/OVERVIEW.md) · [Brand philosophy](../brand/PRODUCT_PHILOSOPHY.md) · [Definition of Done](../../DEFINITION_OF_DONE.md)

**Current focus:** Follow [IMPLEMENTATION_ORDER.md](../../IMPLEMENTATION_ORDER.md). Next after PE02-S01: PE02-S02 (typed event bus hardening) or PE04 prefs. Sprint ledger: [sprint-1.md](./sprint-1.md) · [VERTICAL_SLICES.md](./VERTICAL_SLICES.md).

---

## Rules

1. **One day max** per technical task (`T*`). If larger, split.
2. **Independently implementable** — clear inputs/outputs; no “finish half of X.”
3. **Privacy & sovereignty** — tasks must not violate [NON_GOALS](../product/NON_GOALS.md).
4. **Agent ≠ Send** — preparative work and egress stay separate packages/tasks.
5. **Calm product** — no streak, guilt, or spray-and-pray tasks.

---

## ID scheme

| Level | Pattern | Example |
|-------|---------|---------|
| Epic | `E##` | `E01` |
| Feature | `E##-F##` | `E01-F02` |
| Story | `E##-F##-S##` | `E01-F02-S01` |
| Task | `E##-F##-S##-T##` | `E01-F02-S01-T03` |

---

## Document map

| Doc | Contents |
|-----|----------|
| [EPICS.md](./EPICS.md) | All epics |
| [FEATURES.md](./FEATURES.md) | Features by epic |
| [USER_STORIES.md](./USER_STORIES.md) | Stories + acceptance criteria |
| [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) | AC checklist index |
| [TECHNICAL_TASKS.md](./TECHNICAL_TASKS.md) | Day-sized tasks |
| [DEPENDENCY_GRAPH.md](./DEPENDENCY_GRAPH.md) | Dependency graph & waves |
| [PROJECT_BOARD.md](./PROJECT_BOARD.md) | GitHub Projects columns / Roadmap views |
| [GITHUB_PROJECT_IMPORT.md](./GITHUB_PROJECT_IMPORT.md) | Milestones → Epics → Stories → Tasks (import) |
| [../../IMPLEMENTATION_ORDER.md](../../IMPLEMENTATION_ORDER.md) | Canonical task order (deps, ‖, CP) |
| [import/](./import/) | CSV + import README |
| [VERTICAL_SLICES.md](./VERTICAL_SLICES.md) | One-story-at-a-time process & status |
| [sprint-1.md](./sprint-1.md) | Sprint 1 — Desktop Foundation (shell, DI, events, settings; **no AI**) |

---

## Horizon coverage

| Horizon | Epics | Depth |
|---------|-------|-------|
| **H1 — Application Dojo** | E01–E14 | Full stories + day tasks |
| **H2 — Full hunt loop** | E15–E16 | Stories + key tasks |
| **H3 — Career craft** | E17 | Stories (tasks TBD at admission) |
| **H4 — Sovereign ecosystem** | E18–E19 | Stories + foundation tasks |

---

## Suggested build order (waves)

See [DEPENDENCY_GRAPH.md](./DEPENDENCY_GRAPH.md). Short version:

1. Platform + tokens + storage + events  
2. Identity + preferences + privacy chrome + IPC shell  
3. AI runtime + applications + discovery  
4. Queue + send boundary + timeline audit  
5. Agent + follow-ups + scheduler  
6. Onboarding polish + privacy must-pass tests  
7. Plugin/extension foundations → H2+
