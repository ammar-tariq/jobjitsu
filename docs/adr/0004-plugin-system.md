# ADR 0004: Capability-Gated Plugin System

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Plugin architecture](../architecture/PLUGIN_ARCHITECTURE.md) · [Non-goals](../product/NON_GOALS.md)

---

## Context

Horizon 4 needs extensible agent skills without turning JobJitsu into opaque autopilot or a surveillance platform. Users must inspect and enable skills; plugins must not bypass Queue → Send sovereignty.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **Manifest + capability tokens** | Inspectable, fail-closed | More host complexity |
| unrestricted npm require | Fast | Ambient network/fs; trust collapse |
| Only first-party code | Safest short-term | Blocks ecosystem vision |
| Cloud plugin marketplace accounts | Discovery | Subscription/cloud pressure; non-goal |

---

## Decision

**Ship a capability-gated plugin system** via `packages/plugin-sdk` and a host loader.

- Plugins are **agent skills**, off until user-enabled.
- Human-readable **manifest** lists permissions before enable.
- Hard rule: no plugin capability may execute Send or mark send success; at most queue/intent under policy.
- Official plugins live under `plugins/`; community loads from user paths, default off.
- Prefer auditable source/builds over obfuscated-only distribution.

Broader UI/discovery/send contributions use the extension system ([ADR 0012](./0012-extension-system.md)); a package may ship both under one enablement toggle.

---

## Consequences

### Positive
- Matches “open trust” and “agent as belt, not leash.”
- Clear security story for open source reviewers.
- Enables community technique packs without spray-and-pray.

### Negative / tradeoffs
- Capability design must stay minimal or permission dialogs become noise.
- Sandboxing fidelity depends on host implementation quality.

### Follow-ups
- Deny-by-default contract tests for missing capabilities.
- In-app “inspect manifest” UI before enable.
