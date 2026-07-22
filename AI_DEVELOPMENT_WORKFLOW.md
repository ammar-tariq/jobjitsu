Before writing any code:

0. If documentation itself is incomplete or you are bootstrapping the project,
   prefer the documentation pipeline: [docs/prompts/00_PROJECT_WORKFLOW.md](./docs/prompts/00_PROJECT_WORKFLOW.md)
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

14. Satisfy the full [Definition of Done](./DEFINITION_OF_DONE.md) before starting the next task:
    documented · tested · typed · reviewed · follows architecture · passes lint · passes build.

15. Commit the completed work with a [Conventional Commit](./.cursor/rules/commit-messages.mdc)
    (see `.cursor/rules/commit-after-completion.mdc`). Do not push unless asked.

Never skip planning.
Never bypass tests.
Never violate architecture.
Never introduce unnecessary complexity.
Never call a task done without meeting the Definition of Done.
Never leave completed work uncommitted when the change set is ready.