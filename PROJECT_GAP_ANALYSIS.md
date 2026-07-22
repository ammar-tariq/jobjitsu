# Project Gap Analysis — JobJitsu

> **Phase 2** · Generated 2026-07-23  
> Compares live GitHub (`JobJitsu Development` #2 + issues) to documentation SSOT.  
> **No invented features.** Missing = planning/process gaps only.  
> Related: [REPOSITORY_INSPECTION_REPORT.md](./REPOSITORY_INSPECTION_REPORT.md)

---

## Executive summary

| Band | Doc expectation | GitHub today | Gap |
|------|-----------------|--------------|-----|
| Core · H1 milestones W0–W7 | Present | Present | None |
| Parked milestones W8–W9 | Present (empty) | Present (empty) | None (intentional) |
| Core epics PE01–PE13 | 13 | 13 issues | None |
| Core stories | 41 (+ optional PE-QA) | 41 + PE-QA = 42 | None for Core IDs |
| Experimental PE14–PE20 + PE05-S04 | Parked / admission-gated | Not filed | Optional stubs only if approved |
| Future PE21–PE30 | Parked | Not filed | Optional stubs only if approved |
| Story body template (this PM prompt) | Full sections | Import template only | **Major — update bodies** |
| Metadata fields | Milestone, Epic, Area, Priority, Complexity, Status | Populated | Package(s) empty; Phase unused |
| Labels | Import set | Mostly present | Missing `status:experimental`, `status:future` (+ optional `type:task`) |
| Issue templates | Required by prompt | Missing | Add `.github/ISSUE_TEMPLATE` |
| FEATURES Core modules → stories | 11 modules | Covered via PE03–PE12 (+ PE04 chrome) | None |

**Verdict:** Do **not** create duplicate Core issues. Prefer **update** existing #1–#55. File Experimental/Future only after explicit admission (or as labeled `parked` stubs if approved).

---

## 1. Missing milestones

**None.** W0–W9 titles match `GITHUB_PROJECT_IMPORT.md`.

---

## 2. Missing epics (issues)

| Doc epic | GitHub | Gap |
|----------|--------|-----|
| PE01–PE13 | `#1`–`#13` | None |
| PE14–PE20 Experimental | Absent | Parked — **skip unless admitted** |
| PE21–PE30 Future | Absent | Parked — **skip unless admitted** |

**Prompt tension:** “Every GitHub Issue represents ONE User Story.” Live board also uses **epic issues**. Docs (`GITHUB_PROJECT_IMPORT`) endorse epic issues. **Recommendation:** keep epic issues as planning containers; treat **stories** as the implementable unit. Do not delete epics without approval.

---

## 3. Missing stories

### Core · H1 (must exist)

All 41 Core story IDs from `docs/roadmap/USER_STORIES.md` are present on GitHub, plus `PE-QA` (#55).

| ID | Status |
|----|--------|
| PE01-S01…S04, PE02-S01…S03, PE03-S01…S04, PE04-S01…S04, PE05-S01/S02/S03/S05, PE06–PE13 stories | Present |

### Explicitly not Core (do not invent; do not auto-file)

| ID | Feature status | Action |
|----|----------------|--------|
| PE05-S04 | Experimental (remote AI) | Parked |
| PE14-S01, PE14-S02 | Experimental (Knowledge Base) | Parked |
| PE15-S01 | Experimental (AI Validation) | Parked |
| PE16-S01…S03 | Experimental (Workflow / AI Task Queue) | Parked |
| PE17-S01 | Experimental (Browser Automation) | Parked |
| PE18-S01 | Experimental (Trusted Automation) | Parked |
| PE19-S01 | Experimental (Playground) | Parked |
| PE20-S01 | Experimental (Email) | Parked |
| PE21–PE30 stories | Future | Parked |

### Implementation-order themes vs Core coverage

| Theme (prompt flow) | Doc status | Core coverage |
|---------------------|------------|---------------|
| Foundation / Desktop UI / Settings | Core | PE01, PE04, PE13 |
| Architecture (docs/ADR work) | Process | No PE “Architecture” stories — Architecture **view** empty (field exists) |
| Core Infrastructure / Storage / Event System | Core | PE02 |
| Plugin Framework | Future (PE25) / empty registries in Sprint 1 | Not Core H1 product stories |
| Workflow Engine | Experimental PE16 | Parked |
| AI Runtime / Model Manager | Core PE05 | Present (`PE05-S01`, `PE05-S02`, …) |
| Knowledge Base | Experimental PE14 | Parked |
| Resume / Cover Letter / Discovery / Pipeline | Core PE03, PE07, PE08 | Present |
| Browser / Email | Experimental | Parked |
| Testing / Release | Cross-cutting | PE-QA present; Release field unused |

---

## 4. Missing labels

| Label | Doc source | Live | Gap |
|-------|------------|------|-----|
| `status:experimental` | GITHUB_PROJECT_IMPORT | Missing | Create when filing Exp |
| `status:future` | GITHUB_PROJECT_IMPORT | Missing | Create when filing Future |
| `type:task` | Import (optional) | Missing | **Not required** if tasks stay checklists |
| All other import labels | — | Present | None |

---

## 5. Missing / incomplete project fields

| Field | Gap |
|-------|-----|
| Package(s) | Empty on **all 55** items — should cite packages from architecture (`packages/ai`, `apps/desktop`, …) per story |
| Phase | Exists but unused — optional; not in PROJECT_BOARD.md required table |
| Status vocabulary | Live: Todo…Done vs board doc: Backlog/Ready/… — cosmetic; filters use Done correctly |
| Epic option values | Semantic names (Desktop UI, …) not `PE01` strings — OK if titles keep PE IDs |
| Architecture view | Filter `Epic = Architecture` matches **0** items — no stories tagged Architecture (docs have no Architecture epic) |

---

## 6. Missing dependencies

| Concern | Gap |
|---------|-----|
| Story → story deps in body + Blocked by text | Present for non-roots |
| Native GitHub blocked-by links | Not systematically applied |
| Sub-issue (parent epic) links | Bodies cite epic #; GitHub parent/sub-issue API not fully used |
| PE11-S02 vs PE11-S03 | Docs: story deps vs task-level dep skew noted in STORIES_REVIEW — keep story-level deps as SSOT |

---

## 7. Missing acceptance criteria / body quality

Docs (`docs/roadmap/USER_STORIES.md`) have AC per story. Live issues have **Acceptance / Done when** bullets (condensed).

**Missing vs this prompt’s required body:**

1. `# User Story` — As a… / I want… / So that…  
2. `# Description`  
3. `# Technical Notes` (dedicated; partially covered by Estimate/tasks)  
4. `# Testing Requirements` — Unit / Integration / E2E  
5. `# Documentation Updates`  
6. `# Definition of Done`  
7. `# Implementation Checklist` — Planning → Review  

**Also missing:** repository `.github/ISSUE_TEMPLATE` enforcing the above.

Phase 4 (if approved) should **edit** existing story issues to the full template using SSOT text from `docs/roadmap/USER_STORIES.md` — not create duplicates.

---

## 8. Missing documentation references

| Gap | Notes |
|-----|-------|
| Issue → docs link | Twin section points at roadmap; could add explicit paths (`docs/roadmap/USER_STORIES.md#…`) |
| FEATURES “backlog epic pending” wording | Stale vs PE14–PE16 existence — **docs hygiene**, not a new feature |
| Dual PE* / E* maps | Documented; contributors must use PE↔E table |
| Issue template file | Not in repo |

---

## 9. FEATURES coverage check (no invented modules)

| FEATURES Core module | Story coverage | Gap |
|----------------------|----------------|-----|
| Identity & Resume | PE03 | None |
| Preferences | PE04 | None |
| Local Intelligence | PE05 | None |
| Agent | PE06 | None |
| Discovery & Curation | PE07 | None |
| Applications | PE08 | None |
| Queue & Review | PE09 | None |
| Send | PE10 | None |
| Follow-ups | PE11 | None |
| Timeline & Memory | PE12 | None |
| Privacy & Trust Chrome | PE04 + PE12 | None |

Foundation PE01/PE02 and Onboarding PE13 are Core · H1 in roadmap (platform spine) though not FEATURES “Core modules” rows — already filed.

---

## 10. Recommended Phase 4 actions (awaiting approval)

**Do**

1. Add issue template(s) under `.github/ISSUE_TEMPLATE/`.  
2. Update **existing** story issues #14–#55 bodies to the full required template (from docs only).  
3. Optionally enrich epic #1–#13 bodies similarly (planning containers).  
4. Populate **Package(s)** from architecture package maps.  
5. Add labels `status:experimental`, `status:future` (ready for parked filing).  
6. Optionally set GitHub parent/sub-issue and native blocked-by.

**Do not (unless separately approved)**

1. Recreate PE01–PE13 / Core stories.  
2. Auto-file PE14–PE30 or PE05-S04 into Ready.  
3. Invent Architecture / Workflow / Email Core stories.

**Nice-to-have after admission**

- File parked stubs on W8/W9 with `parked` + Feature Status Experimental/Future.

---

## Gap priority

| P | Gap | Impact |
|---|-----|--------|
| P0 | Story body template incomplete | Implementation readiness / DoD clarity |
| P0 | No `.github/ISSUE_TEMPLATE` | Future issues drift |
| P1 | Package(s) empty | Weak package filtering |
| P1 | No native blocked-by / parent links | Weaker GitHub dependency UX |
| P2 | Missing experimental/future labels | Blocks clean parked filing |
| P2 | Architecture view empty | Expected until architecture chores tagged |
| P3 | Parked Experimental/Future unfiled | Intentional |

→ Backlog plan & validation: [PROJECT_BACKLOG_SUMMARY.md](./PROJECT_BACKLOG_SUMMARY.md) (pre-sync / awaiting approval).
