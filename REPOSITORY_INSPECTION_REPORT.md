# Repository Inspection Report — JobJitsu

> **Phase 1** · Generated 2026-07-23  
> Scope: inspect local `/docs` + live GitHub. **No creates/updates.**  
> Repo: [`ammar-tariq/jobjitsu`](https://github.com/ammar-tariq/jobjitsu) · Branch: `main`

---

## Documentation SSOT (read)

Primary planning sources under `/docs` (and root indexes):

| Area | Key docs |
|------|----------|
| Product | `PLATFORM_SPECIFICATION.md`, `FEATURES.md`, `NON_GOALS.md`, `ROADMAP.md`, `TERMINOLOGY.md` |
| Architecture | `OVERVIEW.md`, `SYSTEM_ARCHITECTURE.md`, `AI_ARCHITECTURE.md`, `EVENT_SYSTEM.md`, `PLUGIN_ARCHITECTURE.md`, `WORKFLOW_ENGINE.md`, … |
| Roadmap / PE* | `docs/roadmap/USER_STORIES.md`, `STORIES_REVIEW.md`, `IMPLEMENTATION_ROADMAP.md`, `IMPLEMENTATION_ORDER.md` |
| Backlog / E* | `EPICS.md`, `USER_STORIES.md`, `TECHNICAL_TASKS.md`, `DEPENDENCY_GRAPH.md`, `GITHUB_PROJECT_IMPORT.md`, `PROJECT_BOARD.md` |
| Prior project work | `PROJECT_CONFIGURATION_REPORT.md` |

**Rule observed:** FEATURES status (Core / Experimental / Future) gates commitment. Experimental/Future are documented but parking-gated until admission.

---

## GitHub — what already exists

### GitHub Project

| Property | Value |
|----------|--------|
| Title | **JobJitsu Development** |
| Number | `2` |
| URL | https://github.com/users/ammar-tariq/projects/2 |
| Linked repo | `ammar-tariq/jobjitsu` |
| Items | **55** |
| Public | Yes |

**Views (7):** Backlog (`-status:Done`), Board (group by Status), Roadmap (group by Milestone), Architecture (`epic:Architecture`), AI (`area:AI`), Documentation (`area:Documentation`), Testing (`area:Testing`).

### Custom Project fields (24 total)

| Field | Options / type | Fill rate (55 items) |
|-------|----------------|----------------------|
| Status | Todo, In Progress, In Review, Testing, Done | 100% |
| Epic | Foundation, Architecture, Core, AI Runtime, … Release | 100% |
| Area | Core, AI, Resume, Jobs, Automation, … Testing | 100% |
| Priority | P0–P4 | 100% |
| Complexity | XS–XL | 100% |
| Feature Status | Core · H1, Experimental, Future | 100% (all Core · H1 today) |
| Horizon | H1–H4 | 100% (all H1) |
| Wave | Number | 100% |
| AI Required | Yes / No | 100% |
| Package(s) | Text | **0%** (all empty) |
| Blocked by | Text | Partial (roots empty; dependents filled) |
| Phase | Planning…Done | **0%** (unused) |

### Milestones (10 — all open)

| # | Title | Open issues |
|---|-------|------------:|
| 1 | W0 — Shell boots | 6 |
| 2 | W1 — Data & event spine | 4 |
| 3 | W2 — Trust & identity | 9 |
| 4 | W3 — Local intelligence | 5 |
| 5 | W4 — Craft objects | 10 |
| 6 | W5 — Sovereignty path | 10 |
| 7 | W6 — Agent & nudges | 8 |
| 8 | W7 — First-run polish | 3 |
| 9 | W8 — Experimental (parked) | 0 |
| 10 | W9 — Future (parked) | 0 |

Exact titles match `GITHUB_PROJECT_IMPORT.md`.

### Labels (42)

Present: `type:epic`, `type:story`, `status:core-h1`, `priority:p0`–`p3`, `wave:w0`–`w9`, `area:*` (shell…onboarding), `fence:sovereignty`, `parked`, plus GitHub defaults.

**Missing vs import docs:** `type:task`, `status:experimental`, `status:future`.

### Issues

| Kind | Count | State |
|------|------:|-------|
| Total open | **55** | All open |
| Epics (`type:epic`) | **13** | PE01–PE13 `#1`–`#13` |
| Stories (`type:story`) | **42** | PE* stories + `PE-QA` `#14`–`#55` |
| Closed | 0 | — |
| Experimental / Future issues | **0** | W8/W9 empty (parked by design) |

**Story IDs present:** all **41 Core** PE01–PE13 stories + **PE-QA**.  
**Not present:** `PE05-S04` (Experimental), PE14–PE30 parked stories.

Tasks are **checklists inside story bodies** (not separate issues) — aligns with this prompt’s rule; differs from optional `type:task` rows in CSV.

### Issue templates

| Location | Status |
|----------|--------|
| `.github/ISSUE_TEMPLATE/` | **Absent** (`.github/` empty) |

Bodies follow `GITHUB_PROJECT_IMPORT.md` sections, not a GitHub form template.

### Body sections on sampled issues (#1, #14, #29, #44, #55)

| Section | Present? |
|---------|----------|
| Summary | Yes |
| Acceptance / Done when | Yes |
| Dependencies | Yes |
| Estimate / Labels / Twin | Yes |
| Technical tasks (checklist) | Yes |
| **User Story** (As a… / I want… / So that…) | **No** |
| **Description** (dedicated) | **No** |
| **Testing Requirements** (Unit / Integration / E2E) | **No** (only brief notes via AC/tasks) |
| **Documentation Updates** | **No** |
| **Definition of Done** | **No** |
| **Implementation Checklist** (Planning…Review) | **No** |

### Parent / GitHub dependency links

- Story bodies reference epic issue numbers (e.g. Epic `#1`).
- Project **Blocked by** text references story IDs + issue numbers.
- Native GitHub “blocked by” / sub-issue graph: **not systematically set**.

---

## Reuse policy (for later Phase 4)

| Artifact | Action |
|----------|--------|
| Project #2 + views + fields | **Reuse** — do not recreate |
| Milestones W0–W9 | **Reuse** |
| Issues #1–#55 | **Reuse** — update bodies/fields if approved; do not duplicate PE IDs |
| Labels present | **Reuse**; add only missing documented labels |
| Parked W8/W9 | Keep empty until FEATURES admission **or** file stubs only if explicitly approved |

---

## Inspection verdict

The GitHub Project is **already populated for Core · H1 planning** (milestones, epics, stories, fields, views). Primary residual gaps are **story body completeness** vs this prompt’s required template, empty **Package(s)** / **Phase**, missing experimental/future labels, missing issue templates, and intentional absence of parked Experimental/Future work.

→ Continue in [PROJECT_GAP_ANALYSIS.md](./PROJECT_GAP_ANALYSIS.md).
