# JobJitsu Engineering Constitution

Version: 1.0

> This document defines **how software is built** on JobJitsu — process, quality, and contributor expectations.
>
> It is the engineering-process authority. It does **not** override product vision, brand, or architecture structure docs.
>
> If implementation process conflicts with this document, the process should be corrected.

See also: [Definition of Done](DEFINITION_OF_DONE.md) · [AI development workflow](docs/development/AI_DEVELOPMENT_WORKFLOW.md) · [Architecture principles](ARCHITECTURE_PRINCIPLES.md) · [Terminology](docs/product/TERMINOLOGY.md) · [Backlog](docs/backlog/README.md) · [Article system](docs/articles/ARTICLE_SYSTEM.md)

---

## Purpose

The purpose of this constitution is to ensure that JobJitsu remains:

- High quality
- Consistent
- Predictable
- Testable
- Maintainable
- Extensible
- Beginner friendly
- AI-assistant friendly
- Open-source friendly

This document defines **how software is built**, not **what software is built**.

Product scope: [docs/product/](docs/product/). Structure: [docs/architecture/](docs/architecture/).

---

## Guiding Principles

Every contribution should improve at least one of the following:

- Maintainability
- Readability
- Testability
- Performance
- User Experience
- Documentation
- Extensibility

No contribution should intentionally make these worse.

---

## Planning Before Coding

No implementation should begin immediately.

Before writing code, contributors must:

1. Understand the feature.
2. Read all relevant documentation.
3. Identify affected modules.
4. Identify dependencies.
5. Create an implementation plan.
6. Break work into small tasks.
7. Consider edge cases.
8. Consider testing strategy.
9. Consider rollback strategy.

Only after planning is complete should implementation begin.

---

## Documentation First

Documentation is part of the product.

For large documentation initiatives, use the Cursor prompt pipeline:

- [docs/prompts/00_PROJECT_WORKFLOW.md](docs/prompts/00_PROJECT_WORKFLOW.md)
- Index: [docs/prompts/README.md](docs/prompts/README.md)

Whenever behavior changes:

- Documentation must be updated.
- Architecture diagrams must remain accurate.
- API documentation must remain accurate.
- Public interfaces must be documented.

Code is not considered complete until documentation reflects reality.

---

## Small, Incremental Changes

Large pull requests are discouraged.

Every feature should be broken into small, independently reviewable changes.

Each pull request should solve one problem.

---

## One Task at a Time

AI coding assistants should never attempt multiple unrelated tasks simultaneously.

Each implementation should:

- Solve one problem.
- Add corresponding tests.
- Update documentation.
- Verify correctness.

Only then should the next task begin.

---

## Architecture Before Features

Infrastructure should exist before business logic.

Examples:

- Event system before event consumers.
- Plugin framework before plugins.
- AI provider abstraction before AI providers.
- Browser automation framework before browser automation implementations.

Avoid shortcuts that introduce future technical debt.

---

## Business Logic First

Business logic should be implemented before user interface.

Preferred order:

Domain

↓

Application

↓

Infrastructure

↓

UI

The interface should consume business capabilities rather than contain them.

---

## Test-Driven Mindset

Every feature should include automated tests.

Preferred testing order:

1. Unit Tests
2. Integration Tests
3. End-to-End Tests

Critical business logic should have comprehensive unit test coverage.

---

## Definition of Done

A task is complete only when it meets the canonical checklist in [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md).

Do not maintain a parallel Done list here.

---

## Code Quality

Code should prioritize clarity over cleverness.

Prefer:

- Descriptive names
- Small functions
- Small files
- Predictable control flow
- Explicit behavior

Avoid:

- Magic numbers
- Hidden side effects
- Deep nesting
- Duplicate logic
- Premature optimization

---

## Single Responsibility

Every module should have one primary responsibility.

When a module grows beyond its responsibility, it should be decomposed.

---

## Reuse Before Creation

Before introducing new code, contributors should determine whether similar functionality already exists.

Avoid unnecessary duplication.

---

## Keep the Core Small

The application core should remain lightweight.

Platform-specific functionality, integrations, and providers should live behind extension points whenever practical.

---

## Dependency Rules

Dependencies should only point inward toward abstractions.

Higher-level modules must never depend directly on implementation details.

Circular dependencies are prohibited.

---

## Public APIs

Every public API should be:

- Minimal
- Stable
- Well documented
- Intentionally designed

Avoid exposing internal implementation details.

---

## Error Handling

Every recoverable error should provide:

- A clear explanation.
- Suggested recovery steps where appropriate.
- Useful diagnostic information.

The application should fail gracefully whenever possible.

---

## Logging Standards

Logs should assist debugging without exposing sensitive information.

Never log:

- API Keys
- Passwords
- OAuth Tokens
- Resume contents
- Email bodies
- Personal identifiable information

Sensitive values should always be redacted.

---

## Security

Security should never be an afterthought.

Every new feature should consider:

- Data exposure
- Permission boundaries
- Secrets management
- Safe defaults
- User consent

---

## Privacy

JobJitsu is a privacy-first application.

Contributors should always ask:

"Can this be done locally?"

If the answer is yes, local execution should be preferred.

---

## AI Usage Principles

Artificial Intelligence is an implementation tool, not business logic.

AI should assist with:

- Writing
- Classification
- Analysis
- Summarization
- Planning

Business rules should remain deterministic wherever possible.

---

## AI Coding Assistant Rules

When an AI coding assistant contributes to the project, it must:

1. Read all relevant documentation before coding.
2. Produce an implementation plan.
3. Explain architectural decisions.
4. Implement one task at a time.
5. Generate tests alongside implementation.
6. Update documentation.
7. Verify correctness before moving forward.

AI should never begin coding immediately after reading a feature request.

---

## Performance

Performance is a feature.

Contributors should consider:

- Startup time
- Memory usage
- CPU usage
- GPU usage
- Disk usage
- Battery usage

Avoid unnecessary background work.

---

## Accessibility

Accessibility should be considered during implementation.

Do not postpone accessibility until after feature completion.

---

## Backward Compatibility

Public interfaces should evolve carefully.

Breaking changes should be documented and justified.

Avoid unnecessary API churn.

---

## Open Source Contributions

The project should remain approachable for new contributors.

Every contribution should strive to:

- Improve readability.
- Improve documentation.
- Reduce complexity.
- Encourage collaboration.

---

## Pull Request Expectations

Every pull request should include:

- A clear description.
- Related documentation updates.
- Relevant tests.
- Architectural justification if applicable.

Large, unrelated changes should be split into separate pull requests.

---

## Continuous Refactoring

Refactoring is encouraged when it:

- Reduces complexity.
- Improves readability.
- Improves maintainability.

Refactoring should preserve existing behavior unless behavior changes are intentional and documented.

---

## Project Decision Process

When multiple implementation approaches exist, contributors should evaluate them based on:

1. Simplicity
2. Maintainability
3. Testability
4. Extensibility
5. Performance
6. Developer Experience

The simplest correct solution should usually be preferred.

---

## Long-Term Thinking

Every architectural decision should consider:

- Future contributors
- Future maintainers
- Plugin developers
- AI coding assistants

Avoid designs that create unnecessary coupling or hidden complexity.

---

## Engineering Ethos

JobJitsu is not built to be the fastest project to develop.

It is built to become a long-lived, high-quality open-source platform.

Every contribution should leave the codebase in a better state than it was found.

---

## Final Principle

Before writing code, ask:

> **Will this decision make JobJitsu easier to understand, easier to maintain, easier to test, and easier for the next contributor to improve?**

If the answer is **no**, reconsider the implementation.