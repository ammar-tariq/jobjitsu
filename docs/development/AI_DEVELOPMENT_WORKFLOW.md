# AI Development Workflow — JobJitsu

Canonical path for day-to-day AI-assisted implementation.

Root pointer: [AI_DEVELOPMENT_WORKFLOW.md](../../AI_DEVELOPMENT_WORKFLOW.md) (redirects here).

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

9. Implement only one task.

10. Add or update tests.

11. Verify all tests pass.

12. Update documentation.

13. Ensure the implementation aligns with the JobJitsu brand, product philosophy, and engineering standards.

14. Satisfy the full [Definition of Done](../../DEFINITION_OF_DONE.md) before starting the next task:
    documented · tested · typed · reviewed · follows architecture · passes lint · passes build.

15. Commit the completed work with a [Conventional Commit](../../.cursor/rules/commit-messages.mdc)
    (see `.cursor/rules/commit-after-completion.mdc`). Do not push unless asked.

16. After a **major milestone** (issue closed, wave/CP advanced, or human request), run
    [Article Milestone Detection](#article-milestone-detection).

Never skip planning.
Never bypass tests.
Never violate architecture.
Never introduce unnecessary complexity.
Never call a task done without meeting the Definition of Done.
Never leave completed work uncommitted when the change set is ready.
Never invent article topics for trivial changes.

---

## Normal development cycle (with content)

```
Issue Created
      ↓
Implementation
      ↓
Tests
      ↓
PR
      ↓
Merge
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
