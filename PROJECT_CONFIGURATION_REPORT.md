# GitHub Project Configuration Report — JobJitsu

> Generated: 2026-07-22  
> Scope: configure GitHub Project fields + views only (no production code, no issue import)  
> Tools: GitHub CLI (`gh`) + Projects GraphQL API · GitHub MCP: not available

---

## Project identity

| Property | Value |
|----------|--------|
| Title | **JobJitsu Development** |
| Number | `2` |
| Node ID | `PVT_kwHOBK1pjs4BeKLL` |
| URL | https://github.com/users/ammar-tariq/projects/2 |
| Owner | `ammar-tariq` (user) |
| Visibility | Public |
| Short description | Official implementation roadmap for JobJitsu. |
| Linked repository | `ammar-tariq/jobjitsu` |
| Items | `0` (empty board; ready for issue import) |

Sources consulted under `/docs`: backlog (`PROJECT_BOARD.md`, `GITHUB_PROJECT_IMPORT.md`, import README), roadmap, architecture, product, ADR, brand, design-system, prompts (including `10_setup_github_project.md`).

---

## Summary

| Concern | Result |
|---------|--------|
| Existing project found | Yes — no new project created |
| Duplicate fields | Avoided — only missing `PROJECT_BOARD.md` fields were added |
| Duplicate views | Avoided — all seven requested views already existed |
| View create/update via API | **Not supported** by public GraphQL (no `createProjectV2View` / `updateProjectV2View`) |
| Views match requested config | **Verified** via read API |
| Manual steps required | **None** for fields/views in this report |

---

## Custom fields

### Already present (left unchanged)

| Field | Type | Options / notes |
|-------|------|-----------------|
| Title | Built-in | — |
| Assignees | Built-in | — |
| Status | Single select | `Todo`, `In Progress`, `In Review`, `Testing`, `Done` |
| Labels | Built-in | — |
| Linked pull requests | Built-in | — |
| Milestone | Built-in | Used by Roadmap group-by |
| Repository | Built-in | — |
| Reviewers | Built-in | — |
| Parent issue | Built-in | — |
| Sub-issues progress | Built-in | — |
| Created / Updated / Closed | Built-in | — |
| Epic | Single select | Includes `Architecture` (required by Architecture view) |
| Priority | Single select | `P0`–`P4` |
| Area | Single select | Includes `AI`, `Documentation`, `Testing` |
| Complexity | Single select | `XS`, `S`, `M`, `L`, `XL` |
| AI Required | Single select | `Yes`, `No` |
| Phase | Single select | Planning → Done |

### Created this session (from `docs/backlog/PROJECT_BOARD.md`)

| Field | Type | Options / notes | Field ID |
|-------|------|-----------------|----------|
| Wave | Number | `0`–`9` (value convention) | `PVTF_lAHOBK1pjs4BeKLLzhYmoC0` |
| Feature Status | Single select | `Core · H1`, `Experimental`, `Future` | `PVTSSF_lAHOBK1pjs4BeKLLzhYmoDs` |
| Package(s) | Text | e.g. `packages/events`, `apps/desktop` | `PVTF_lAHOBK1pjs4BeKLLzhYmoDw` |
| Blocked by | Text | Story IDs | `PVTF_lAHOBK1pjs4BeKLLzhYmoD0` |
| Horizon | Single select | `H1`, `H2`, `H3`, `H4` | `PVTSSF_lAHOBK1pjs4BeKLLzhYmoEs` |

### Not created (would duplicate)

- Status, Epic, Area, Priority, Complexity, Phase, AI Required — already on the project.
- Estimate — mentioned in import README for issue bodies / CSV; **not** listed as a Project field in `PROJECT_BOARD.md`.

---

## Views (verified)

Public GraphQL **cannot** create or mutate view layout/filter/group-by. Views were **already configured**; verification only.

| View | Layout | Filter | Group by | Verified |
|------|--------|--------|----------|----------|
| **Backlog** | Table (`TABLE_LAYOUT`) | `-status:Done` (Status ≠ Done) | — | Yes |
| **Board** | Board (`BOARD_LAYOUT`) | (none) | **Status** (`verticalGroupByFields`) | Yes |
| **Roadmap** | Roadmap (`ROADMAP_LAYOUT`) | (none) | **Milestone** (`groupByFields`) | Yes |
| **Architecture** | Table | `epic:Architecture` | — | Yes |
| **AI** | Table | `area:AI` | — | Yes |
| **Documentation** | Table | `area:Documentation` | — | Yes |
| **Testing** | Table | `area:Testing` | — | Yes |

Additional observed sort (pre-existing, not requested): Backlog and Roadmap sort by **Priority** descending.

---

## Status vs board spec note

`docs/backlog/PROJECT_BOARD.md` columns: **Backlog → Ready → In progress → In review → Done**.

Live **Status** options: **Todo → In Progress → In Review → Testing → Done**.

The requested Backlog filter (`Status != Done`) works with the live options. Status options were **not** renamed to avoid breaking the existing Board columns and filters. Aligning names is optional (UI-only; see checklist below).

---

## API capability note

Available Project v2 mutations include field create/update/delete and item operations. **No** public mutations for:

- `createProjectV2View`
- `updateProjectV2View`
- filter / layout / group-by configuration

If views had been missing, they would require the GitHub UI. In this repository they were already correct.

---

## Manual checklist (minimum)

**Required for this configuration: none.**

Optional alignment with `PROJECT_BOARD.md` Status vocabulary (UI only):

1. Open https://github.com/users/ammar-tariq/projects/2  
2. Project settings → **Status** field  
3. Rename/reorder options to `Backlog`, `Ready`, `In progress`, `In review`, `Done` if desired  
4. Confirm **Backlog** view filter still excludes Done (`-status:Done` or equivalent)  
5. Confirm **Board** still groups by Status  

Optional future views from the board spec (not requested in this task): Current sprint, H1 only, Parked.

---

## Verification commands

```bash
gh project field-list 2 --owner ammar-tariq --format json
gh api graphql -f query='
query {
  user(login: "ammar-tariq") {
    projectV2(number: 2) {
      title url
      views(first: 20) {
        nodes {
          name layout filter
          groupByFields(first: 3) { nodes { ... on ProjectV2FieldCommon { name } } }
          verticalGroupByFields(first: 3) { nodes { ... on ProjectV2FieldCommon { name } } }
        }
      }
    }
  }
}'
```

---

## Next recommended step (out of scope here)

Import / file issues per `docs/backlog/GITHUB_PROJECT_IMPORT.md` and `docs/backlog/import/github-issues.csv`, then set **Epic**, **Area**, **Wave**, **Feature Status**, **Priority**, **Horizon**, and **Milestone** on each item so the filtered views populate.
