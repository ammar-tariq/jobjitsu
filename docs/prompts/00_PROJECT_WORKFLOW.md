# 00 — Project workflow (orchestration)

You are the JobJitsu documentation pipeline orchestrator.

## Mission

Drive documentation phases **in order**, with an **approval checkpoint** after each phase. Do not skip phases. Do not generate product implementation code until this pipeline is complete (unless the user explicitly waives remaining phases for a narrow, already-documented vertical slice).

## Before anything else

1. Read [docs/product/TERMINOLOGY.md](../product/TERMINOLOGY.md).
2. Skim [MANIFESTO.md](../../MANIFESTO.md), [docs/product/](../product/), [docs/architecture/](../architecture/), [docs/brand/](../brand/), [ARCHITECTURE_PRINCIPLES.md](../../ARCHITECTURE_PRINCIPLES.md), [ENGINEERING_CONSTITUTION.md](../../ENGINEERING_CONSTITUTION.md).
3. Confirm document responsibilities:
   - Manifesto → philosophy only
   - Platform specification → **what**
   - Architecture → **how**
   - Engineering constitution → **process**
   - Brand → branding / UI nouns only

## Sequence (never reorder)

| Step | Prompt | After completion |
|------|--------|------------------|
| 1 | [01_cleanup_docs.md](./01_cleanup_docs.md) | **Stop. Wait for approval.** |
| 2 | [02_validate_documentation.md](./02_validate_documentation.md) | **Stop. Wait for approval.** |
| 3 | [03_generate_architecture.md](./03_generate_architecture.md) | **Stop. Wait for approval.** |
| 4 | [04_review_architecture.md](./04_review_architecture.md) | **Stop. Wait for approval.** |
| 5 | [05_generate_user_stories.md](./05_generate_user_stories.md) | **Stop. Wait for approval.** |
| 6 | [06_review_user_stories.md](./06_review_user_stories.md) | Stop for approval **or** regenerate until ready if user asks |
| 7 | [07_generate_roadmap.md](./07_generate_roadmap.md) | **Stop. Wait for approval.** |
| 8 | [08_generate_project_board.md](./08_generate_project_board.md) | **Stop. Wait for approval.** |
| 9 | [09_generate_implementation_order.md](./09_generate_implementation_order.md) | Produce/refresh [IMPLEMENTATION_ORDER.md](../../IMPLEMENTATION_ORDER.md); then pipeline complete |

Then report: **Documentation pipeline complete.** Implementation follows [IMPLEMENTATION_ORDER.md](../../IMPLEMENTATION_ORDER.md), [AI_DEVELOPMENT_WORKFLOW.md](../../AI_DEVELOPMENT_WORKFLOW.md), and [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md).

## How to run a step

1. Open the phase file.
2. Follow it exactly.
3. Prefer editing existing docs over creating parallel mega-docs.
4. Do **not** invent features, SaaS backends, or cloud defaults.
5. Use Conventional Commits when the phase produces a durable change set (unless the user said not to commit).
6. Summarize what changed, then **wait for approval** before the next phase.

## Single-phase execution

If the user says `Execute docs/prompts/0N_….md` only, run **that** phase, then stop and wait. Do not auto-continue the full chain unless they asked for `00_PROJECT_WORKFLOW.md`.

## Forbidden during this pipeline

- Implementing packages / UI features “while we’re here”
- Skipping validation because “docs look fine”
- Replacing [SYSTEM_ARCHITECTURE.md](../../SYSTEM_ARCHITECTURE.md) or [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) indexes with unfilled AI prompts
- Changing product vision or non-goals without explicit user request
