# ADR 0003: Local Typed Event Bus

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Event system](../architecture/EVENT_SYSTEM.md) · [Package boundaries](../architecture/PACKAGE_BOUNDARIES.md)

---

## Context

Agent, Queue, Send, Follow-ups, Timeline, Scheduler, and UI need loose coupling while preserving inspectability and egress audit. Remote event streaming of career data would violate privacy-as-architecture. Polling everything from the UI would create a cockpit, not a calm OS.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **In-process typed bus + durable subset** | Local, testable, audit-friendly | Need discipline on payload PII |
| Redux-only UI state | Familiar for UI | Doesn’t span host domain well |
| Cloud event pipeline | Scale multi-device | Non-goal; privacy defect |
| Ad-hoc callbacks | Fast early | Tangled boundaries; agent→send risk |

---

## Decision

**Adopt a local, typed domain event bus** owned by `packages/events`, running in the host.

- Event names follow `Domain.Action` (see event catalog).
- High-volume payloads carry IDs/counts — not résumé bodies.
- Durable subset (egress, approvals, pause, preference changes) lands in Timeline storage.
- UI subscribes via IPC and **batches** progress for calm toasts/status.
- Events never stream career payloads to a JobJitsu cloud by default.

---

## Consequences

### Positive
- Enforces package decoupling; Agent can progress without calling Send.
- Natural feed for Timeline “what left / what stayed.”
- Matches notification batching and calm UX.

### Negative / tradeoffs
- Schema evolution requires versioned event contracts.
- Over-publishing progress events can still spam UI if batching is skipped.

### Follow-ups
- Contract tests for egress events and PII minimization ([ADR 0007](./0007-testing.md)).
- Document plugin event subscription capabilities in plugin ADR.
