# GitHub Project Board

> Spec for a **GitHub Projects** board (and Roadmap view) synced from
> [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) + [../roadmap/USER_STORIES.md](../roadmap/USER_STORIES.md).
>
> **Import SSOT:** [GITHUB_PROJECT_IMPORT.md](./GITHUB_PROJECT_IMPORT.md) · CSV: [import/github-issues.csv](./import/github-issues.csv)
>
> Does **not** invent product scope. Future/Experimental stay out of **Ready** until admitted in [FEATURES.md](../product/FEATURES.md).

---

## Columns

| Column | Meaning | Who moves |
|--------|---------|-----------|
| **Backlog** | Admitted stories not yet sequenced for a sprint | Maintainers |
| **Ready** | Dependencies satisfied; Core · H1 (or explicitly admitted Experimental) | Maintainers |
| **In progress** | Active vertical slice | Assignee |
| **In review** | PR open / AC check | Reviewer |
| **Done** | Merged + DoD met | Maintainer |

Do **not** name columns after velocity, streaks, or vanity metrics.

---

## Custom fields

| Field | Type | Values |
|-------|------|--------|
| Epic | Single select / text | `PE01`…`PE30` (and/or `E01`…`E19`) |
| Wave | Number | `0`–`9` |
| Feature Status | Single select | `Core · H1`, `Experimental`, `Future` |
| Priority | Single select | `P0`, `P1`, `P2`, `P3` |
| Package(s) | Text | e.g. `packages/events`, `apps/desktop` |
| Blocked by | Text | Story IDs |
| Horizon | Single select | `H1`, `H2`, `H3`, `H4` |

---

## Views

| View | Filter / layout |
|------|-----------------|
| **Current sprint** | In progress + Ready (limit WIP) |
| **H1 only** | Feature Status = Core · H1 |
| **Roadmap** | Board or roadmap layout grouped by **Wave** |
| **Parked** | Feature Status = Experimental **or** Future (hide from Ready) |

---

## Mapping rules

1. Create one Project item (or issue) per **story** (`PE##-S##`), not per epic.
2. Title: `PE##-S## — {short title}`.
3. Body: link to AC in [USER_STORIES.md](../roadmap/USER_STORIES.md); optional twin `E*` ID.
4. Set **Wave** from [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md).
5. **Ready** only if all **Blocked by** stories are Done **and** status is Core · H1 (or Experimental after admission).
6. Wave 8–9 items start in **Backlog** or **Parked**, never auto-Ready.
7. Closing an item requires [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md).

---

## Suggested first import (Wave 0)

| Story | Wave | Priority | Ready? |
|-------|------|----------|--------|
| PE01-S01 Launch desktop host | 0 | P0 | Yes (no deps) |
| PE01-S03 Deny-by-default IPC | 0 | P0 | After S01 |
| PE01-S02 Navigate primary H1 sections | 0 | P0 | After S01 |
| PE01-S04 Dark-default appearance | 0 | P1 | After S01 |
| PE04-S03 Agent · On-device status | 0 | P0 | After S01 |

---

## Creating the GitHub Project

After this markdown is approved, optionally:

```bash
# Example only — adjust org/repo and field IDs for your GitHub Project v2
gh project create --owner <owner> --title "JobJitsu H1" --body "See docs/backlog/PROJECT_BOARD.md"
```

Prefer linking existing issues to the project over bulk-inventing scope. Do not invent stories absent from USER_STORIES.

---

## Related

- [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) — ordered waves  
- [DEPENDENCY_GRAPH.md](./DEPENDENCY_GRAPH.md) — `E*` waves  
- [VERTICAL_SLICES.md](./VERTICAL_SLICES.md) — one-story process  
- [sprint-1.md](./sprint-1.md) — current foundation sprint  
