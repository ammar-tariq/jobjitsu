# 04 — Review architecture

You are reviewing JobJitsu architecture documentation for correctness and discipline.

## Goal

Challenge the **how** docs without rewriting product vision. Output a review; apply fixes only after approval (or when asked to “fix P0”).

## Required reading

- [docs/architecture/](../architecture/)
- [docs/adr/](../adr/)
- [ARCHITECTURE_PRINCIPLES.md](../../ARCHITECTURE_PRINCIPLES.md)
- [PLATFORM_SPECIFICATION.md](../product/PLATFORM_SPECIFICATION.md)
- [PACKAGE_BOUNDARIES.md](../architecture/PACKAGE_BOUNDARIES.md)
- [EVENT_SYSTEM.md](../architecture/EVENT_SYSTEM.md)
- ADR 0009 (send boundary), 0005 (AI runtime), 0003 (event bus)

## Review questions

1. Does any package path let Agent call Send directly?
2. Is privacy chrome honest (**Agent · On-device** vs remote)?
3. Are events PII-minimized and calm (no urgency semantics)?
4. Are Plugins vs Extensions distinguished?
5. Is Task Queue confused with review Queue?
6. Do diagrams match prose?
7. Are ADRs stale vs repo reality (follow-ups)?
8. Any SaaS/cloud-backend leakage?
9. Any architecture that implements a [NON_GOAL](../product/NON_GOALS.md)?

## Output format

| Severity | Finding | File | Recommendation |
|----------|---------|------|----------------|
| P0/P1/P2 | … | path | … |

End with: **Approve fixes?** Then stop.

## Forbidden

- Expanding scope “to make architecture complete”
- Implementing code to “prove” the architecture during this phase
