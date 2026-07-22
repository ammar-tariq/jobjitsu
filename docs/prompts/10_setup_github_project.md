Read every document inside /docs.

Generate all GitHub Issues from the documentation.

Rules:

- One Epic per major feature.
- One Story per independently deliverable feature.
- Technical tasks remain as checklists inside the Story.
- Assign:
  - Milestone
  - Epic
  - Area
  - Priority
  - Complexity
- Generate issue bodies using the repository issue template.
- If GitHub CLI is available, create the issues automatically.
- If not, generate a folder named /generated/issues containing one Markdown file per issue and a shell script using `gh issue create` to import them.