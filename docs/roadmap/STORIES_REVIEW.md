# User Stories Review (Step 7)

> Review of [USER_STORIES.md](./USER_STORIES.md) against Step 7 criteria.
> Regenerated until **implementation-ready**.

**Date:** 2026-07-22  
**Score:** **92 / 100** (was ~64)  
**Verdict:** **Implementation-ready** for platform decomposition (`PE*`).  
**Delivery SSOT** remains [../backlog/USER_STORIES.md](../backlog/USER_STORIES.md) (`E*`) + dependency waves.

---

## Criteria checklist

| Check | Result |
|-------|--------|
| Missing Core H1 stories | **Pass** — added appearance, fit prefs, offline, browse roles, app list/detail, empty states, scheduler persist/dismiss |
| Duplicates | **Pass** — ownership table; merged PE10 channel stub into PE10-S01; PE↔E map |
| Incorrect dependencies | **Pass** — fixed chrome/onboarding/event bus/applications/Workflow/tailor edges |
| Missing AC | **Pass** — Core stories have observable AC; Future remain thin stubs |
| Too large | **Pass** — split PE16 Workflow vs step runners; narrowed PE07 H1 source |
| Too small | **Pass** — quiet hours kept with “enforce when PE11” AC; channel stub merged |
| Experimental as Core blockers | **Pass** — remote AI labeled Experimental; KnowledgeReader optional until PE14 |
| Sovereignty / privacy / brand | **Pass** — Agent ↛ Send; no JobJitsu cloud; no Local LLM chrome; calm copy |

---

## Fixes applied (summary)

### P0
- Moved remote AI (PE05-S04) to Experimental commitment (not H1 gate).
- Softened PE05-S03 KnowledgeReader to optional/no-op until PE14.
- Added PE01-S04, PE04-S04, PE05-S05, PE07-S04, PE08-S04, PE13-S02.
- Fixed PE04-S03 / PE13-S01 deps (no model-path gate).

### P1
- PE02-S02 → PE01-S01; PE08-S01 → PE03-S02; PE03-S04 → AI+Context (not Agent lifecycle); PE16-S01 → Queue (not Send).
- Added PE11-S03 / PE11-S04; PE16-S03 split; PE07 H1 source narrowed.
- PE↔E coverage map + ownership table.
- PE01-S02 AC de-coupled from backlog E03 wording.

### P2 / Future
- PE26-S02 Host Extensions stub; PE28–PE30 FEATURES Future stubs.
- Strengthened curation / analysis AC where thin.

---

## Residual (non-blocking)

| Item | Notes |
|------|--------|
| Score −8 | Future stubs intentionally thin; Experimental backlog epics not yet admitted as `E*` |
| Dual ID system | PE* vs E* requires map discipline — documented; do not delete either file |
| Search Profiles / Match Score | Documented out of H1; admit Experimental stories when product prioritizes |

## Addendum (2026-07-23) — Career paths & import attach

- Added **PE03-S05…S09** (paths, review, attach, LinkedIn PDF, path-from-existing) — manual first.
- **PE03-S10** AI parse deferred until after PE05; PE03-S04 remains after PE05.
- **PE27** clarified as hard multi-identity; day-to-day faces = **Path** (PE03-S05).
- PE13-S01 deps → PE03-S07; terminology: Profile vs Path.

---

## Approve for Step 8?

**Yes — Step 8 done:** [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) + [PROJECT_BOARD.md](../backlog/PROJECT_BOARD.md). Next: pipeline [09](../prompts/09_generate_implementation_order.md) (align DEPENDENCY_GRAPH) or start **PE03-S05**.
