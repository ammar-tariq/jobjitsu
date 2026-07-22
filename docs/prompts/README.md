# JobJitsu documentation pipeline

> Turn Cursor into a **documentation pipeline** with clear checkpoints before implementation.

When a contributor says:

```text
Execute docs/prompts/00_PROJECT_WORKFLOW.md
```

or

```text
Execute docs/prompts/05_generate_user_stories.md
```

the agent must open that file and follow it exactly.

| Prompt | Phase |
|--------|--------|
| [00_PROJECT_WORKFLOW.md](./00_PROJECT_WORKFLOW.md) | Orchestration (all phases, approvals) |
| [01_cleanup_docs.md](./01_cleanup_docs.md) | Normalize existing docs |
| [02_validate_documentation.md](./02_validate_documentation.md) | Full architecture readiness validation |
| [03_generate_architecture.md](./03_generate_architecture.md) | Architecture docs (**how**) |
| [04_review_architecture.md](./04_review_architecture.md) | Architecture review |
| [05_generate_user_stories.md](./05_generate_user_stories.md) | Backlog stories |
| [06_review_user_stories.md](./06_review_user_stories.md) | Story review |
| [07_generate_roadmap.md](./07_generate_roadmap.md) | Roadmap / backlog structure |
| [08_generate_project_board.md](./08_generate_project_board.md) | GitHub Projects shape |
| [09_generate_implementation_order.md](./09_generate_implementation_order.md) | Build waves / [IMPLEMENTATION_ORDER.md](../../IMPLEMENTATION_ORDER.md) |

**Hard rule:** Do not write product feature code until phases **01–09** are complete (or the user explicitly waives remaining phases for a narrow, already-documented slice). Day-to-day coding after the pipeline uses [AI_DEVELOPMENT_WORKFLOW.md](../development/AI_DEVELOPMENT_WORKFLOW.md).
