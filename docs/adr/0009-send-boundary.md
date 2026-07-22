# ADR 0009: Single Send Egress Boundary

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Package boundaries](../architecture/PACKAGE_BOUNDARIES.md) · [Architecture rule](../../.cursor/rules/architecture.mdc)

---

## Context

The product promise is: nothing intimate leaves the machine except what the user explicitly sends. If Agent, UI, plugins, or AI tools each open network sockets, sovereignty collapses and audits become impossible.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **Single `packages/send` egress** | Auditable, enforceable | All channels must plug in here |
| Each feature calls fetch | Fast demos | Privacy defects; unknown success states |
| Agent owns apply tools | “Autonomous” marketing | Violates agent-as-belt; non-goal |

---

## Decision

**All career-data egress goes through `packages/send`.**

- Channels (board submit, mail, export) register as send adapters / extension send channels.
- Flow: Queue (+ preferences approval) → `send` → honest `Send.Succeeded|Failed|Unknown` → Timeline `Privacy.EgressRecorded`.
- `agent`, `ai`, renderer, and plugins **must not** call egress directly; they may only enqueue or request intents under policy.
- Approval-before-send defaults on for high-stakes outbound.

---

## Consequences

### Positive
- Clear code review hotspot for privacy.
- Honest completion semantics centralized.
- Matches brand review ritual and microcopy.

### Negative / tradeoffs
- New outbound destinations require send-channel work — intentional friction.
- Misplaced `fetch` in other packages is a defect; needs lint/tests.

### Follow-ups
- Contract tests: approval gate + unknown≠success ([ADR 0007](./0007-testing.md)).
- Extension send façade must wrap this package ([ADR 0012](./0012-extension-system.md)).
