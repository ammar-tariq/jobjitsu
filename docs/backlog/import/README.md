# GitHub import files

| File | Purpose |
|------|---------|
| [github-issues.csv](./github-issues.csv) | Flat import: milestones, epics, stories, tasks |
| [../GITHUB_PROJECT_IMPORT.md](../GITHUB_PROJECT_IMPORT.md) | Hierarchy, labels, estimates, dependencies (SSOT) |
| [../PROJECT_BOARD.md](../PROJECT_BOARD.md) | Project columns / views |

## Suggested import flow

1. Create labels from GITHUB_PROJECT_IMPORT.md  
2. Create milestones W0–W9  
3. Import or manually create issues from CSV (`type` = epic → story → task)  
4. Attach to GitHub Project; set custom fields Wave / Estimate / Blocked by  
5. Dedup against existing `E*` backlog twins  

**Do not** auto-Ready rows with label `parked`.
