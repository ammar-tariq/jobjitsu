# AI Development Workflow — JobJitsu

Canonical path for day-to-day AI-assisted implementation.

Root pointer: [AI_DEVELOPMENT_WORKFLOW.md](../../AI_DEVELOPMENT_WORKFLOW.md) (redirects here).

Cursor rule: [`.cursor/rules/git-branching.mdc`](../../.cursor/rules/git-branching.mdc) (auto-branch + Project Status).

Before writing any code:

0. If documentation itself is incomplete or you are bootstrapping the project,
   prefer the documentation pipeline: [docs/prompts/00_PROJECT_WORKFLOW.md](../prompts/00_PROJECT_WORKFLOW.md)
   (execute phases with approval checkpoints). Day-to-day feature work resumes below
   after docs phases are done (or the user waives remaining phases for a narrow slice).

1. Read:
   - docs/brand/
   - docs/product/
   - docs/architecture/
   - docs/adr/
   - .cursor/rules/
   - docs/product/TERMINOLOGY.md

2. Understand the request.

3. Produce a detailed implementation plan.

4. Identify affected packages.

5. Generate or update user stories if needed.

6. Break the work into small tasks.

7. Explain trade-offs and architectural decisions.

8. Wait until the plan is complete.

9. **Create a feature branch** from `origin/main` (do not build on `main` unless asked).  
   Set the related GitHub issue Project **Status → In Progress**:
   `pnpm project:status -- <issue> "In Progress"`  
   (see [Branching & board status](#branching--board-status)).

10. Implement only one task.

11. Add or update tests.

12. Verify all tests pass.

13. Update documentation.

14. Ensure the implementation aligns with the JobJitsu brand, product philosophy, and engineering standards.

15. Satisfy the full [Definition of Done](../../DEFINITION_OF_DONE.md) before starting the next task:
    documented · tested · typed · reviewed · follows architecture · passes lint · passes build.

16. Commit the completed work with a [Conventional Commit](../../.cursor/rules/commit-messages.mdc)
    (see `.cursor/rules/commit-after-completion.mdc`).  
    Set Project **Status → In Review**.

17. **PR gate (required before the next slice):** ensure an open PR exists for this
    branch/commit (`Closes #N` when applicable). Push if needed, then create the PR.
    Set **Status → Testing**. Do **not** start the next story until that PR exists.
    If the user asks to “move ahead” without a PR, open the PR first.

18. Merge to `main` sets **Done** via Actions (or manually).

19. After a **major milestone** (issue closed, wave/CP advanced, or human request), run
    [Article Milestone Detection](#article-milestone-detection).

Never skip planning.
Never bypass tests.
Never violate architecture.
Never introduce unnecessary complexity.
Never call a task done without meeting the Definition of Done.
Never leave completed work uncommitted when the change set is ready.
Never invent article topics for trivial changes.
Never implement feature slices directly on `main` unless the user opts in.
Never start the next vertical slice until a relevant PR for the completed slice is open.

---

## Branching & board status

```
Issue (Todo)
      ↓
Create branch + Status: In Progress
      ↓
Implement / tests / docs / commit
      ↓
Status: In Review
      ↓
PR opened (+ Closes #N) → Status: Testing   ← gate: no next slice until PR exists
      ↓
Merge to main → Status: Done  (workflow: project-status-on-merge)
```

| Command | Effect |
| ------- | ------ |
| `pnpm project:status -- 14 "In Progress"` | Board status for issue #14 |
| `./scripts/set-project-status.sh 14 "Done"` | Same |

Valid statuses: `Todo` · `In Progress` · `In Review` · `Testing` · `Done`  
Project: **JobJitsu Development** (#2, owner `ammar-tariq`).

For merge automation, add repo secret **`PROJECTS_TOKEN`** (PAT with Projects write).  
Workflow: [`.github/workflows/project-status-on-merge.yml`](../../.github/workflows/project-status-on-merge.yml).

---

## Normal development cycle (with content)

```
Issue Created (Todo)
      ↓
Feature branch + In Progress
      ↓
Implementation
      ↓
Tests + DoD + commit → In Review
      ↓
PR → Testing   ← do not start next story until PR is open
      ↓
Merge → Done
      ↓
Issue Closed
      ↓
Milestone Progress Updated
      ↓
AI Article Review
      ↓
Article Proposal Created (if needed)
      ↓
Human Approval
      ↓
Article Written
```

Article process detail: [docs/articles/ARTICLE_SYSTEM.md](../articles/ARTICLE_SYSTEM.md).  
Historian prompt: [`.cursor/prompts/article-review.md`](../../.cursor/prompts/article-review.md).

---

## Article Milestone Detection

After completing a major milestone, the AI agent should analyze:

- What changed?
- Why does this matter?
- Does this represent a significant engineering story?
- Would the community benefit from understanding this?

**If no** → stop. Set or leave project **Content Status** as `Not Needed` when relevant.

**If yes:**

Create:

`docs/articles/proposals/<number>-<title>.md`

Containing:

- Proposed title
- Reason for article
- Related milestone
- Technical topics
- Required documentation
- Suggested diagrams

Then:

1. Append a row to [docs/articles/proposals/future-proposals.md](../articles/proposals/future-proposals.md).  
2. Optionally open a GitHub issue titled `Write Article: <short name>` with label `article-needed`.  
3. Set project field **Content Status** to `Potential Article`.  

Do **not** write the full article until a human applies `article-approved`.

Do **not** create proposals for bug fixes, dependency bumps, small refactors, or minor docs edits.
