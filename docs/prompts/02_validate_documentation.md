# 02 — Validate documentation

Read every document inside the `/docs` directory.

Do not write code.

Your task is to perform a complete documentation validation.

Think like a Staff Software Architect reviewing documentation before a large engineering team begins implementation.

## Review every document for

- contradictions
- ambiguity
- duplicated concepts
- missing definitions
- inconsistent terminology
- missing workflows
- missing interfaces
- missing package boundaries
- missing data models
- missing events
- missing API contracts
- missing acceptance criteria
- unclear ownership
- unclear responsibilities

## Constraints

Do **NOT** invent new product features.

Only identify missing information required to implement the **existing** platform.

Also read root companions that define authority and structure (still no code):

- [MANIFESTO.md](../../MANIFESTO.md)
- [ARCHITECTURE_PRINCIPLES.md](../../ARCHITECTURE_PRINCIPLES.md)
- [ENGINEERING_CONSTITUTION.md](../../ENGINEERING_CONSTITUTION.md)
- [SYSTEM_ARCHITECTURE.md](../../SYSTEM_ARCHITECTURE.md)
- [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md)
- [docs/product/TERMINOLOGY.md](../product/TERMINOLOGY.md)

## For every issue provide

- severity
- affected documents
- recommended improvement
- rationale

## When complete, generate

[`ARCHITECTURE_READINESS_REPORT.md`](../../ARCHITECTURE_READINESS_REPORT.md) at the repository root.

Assign a readiness score from **1–100**.

If the score is below **95**, recommend documentation improvements.

## Hard stop

Do **not** modify documents until the report has been reviewed and approved.

After writing the report: **stop and wait for approval.**
