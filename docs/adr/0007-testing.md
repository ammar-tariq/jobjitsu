# ADR 0007: Privacy-First Testing Strategy

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Testing strategy](../architecture/TESTING_STRATEGY.md) · [Testing rule](../../.cursor/rules/testing.mdc)

---

## Context

Correctness alone is insufficient. Regressions that auto-send, spoof “Local LLM,” or exfiltrate résumé text are product-breaking. Tests must encode user guarantees, not vanity throughput.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **Layered tests with privacy must-pass suite** | Protects promises | Slightly more fixtures/discipline |
| UI-only E2E | Looks real | Slow; misses package fences |
| Metric-driven “apply volume” benchmarks | Growth theater | Violates leverage-over-volume |

---

## Decision

**Adopt a layered testing strategy** with an explicit **privacy & sovereignty must-pass** set.

Layers: unit → contract → integration → privacy/boundary → UI a11y → plugin capability denial.

Must-pass guarantees include:

1. No résumé egress without `send` path  
2. Approval gates honored  
3. Agent pause leaves queue intact and cannot send  
4. Honest send outcomes (`unknown` ≠ success)  
5. Local badge truthfulness  
6. Capabilities fail closed  
7. No inactivity-shame scheduler jobs  

Tooling posture (implementation may pin versions later): unit/contract in TypeScript packages; host integration tests; UI smoke for badge/focus/live regions. Test names describe user guarantees calmly.

---

## Consequences

### Positive
- Architecture laws stay enforceable as code lands.
- Plugins/extensions get deny-by-default proof.
- Aligns engineering culture with brand calm.

### Negative / tradeoffs
- Boundary tests need careful network mocking.
- Full Tauri E2E may be sparse early — prioritize package-level proofs.

### Follow-ups
- Keep synthetic fixtures in `examples/` only — never real user data in git.
- CI gates must-pass suite on mainline once code exists.
