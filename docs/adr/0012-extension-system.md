# ADR 0012: Host Extension System

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Extension system](../architecture/EXTENSION_SYSTEM.md) · [Plugin system](./0004-plugin-system.md)

---

## Context

Beyond agent skills, the Career OS needs discovery sources, send channels, optional UI panels, and exporters — without forking into micro-products or cloud upsells. Plugins alone (skills) are too narrow; an open npm `require` of the host is too wide.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **Contribution points + extension-sdk** | Broad but gated | More manifest surface |
| Plugins only | Simpler | Cannot cleanly add UI/discovery/send |
| Hard-code all adapters in core | Control | Blocks Horizon 4 ecosystem |

---

## Decision

**Adopt a host extension system** with `packages/extension-sdk` and declared contribution points:

- `discovery.source`, `send.channel`, `agent.skill` (via plugin host), `ui.panel`, `ui.status`, `timeline.exporter`, `scheduler.jobType`.

Rules:

- User enablement + visible permissions.
- Send channels use the send façade ([ADR 0009](./0009-send-boundary.md)).
- UI contributions use brand tokens; no streak/guilt widgets.
- Default off for third-party; first-party may ship enabled only with zero sensitive perms.
- Fail closed on missing capabilities; crash isolation from identity storage.

---

## Consequences

### Positive
- One OS feel with optional “calm rooms.”
- Clear path for official board adapters without core bloat.
- Aligns with non-goals (no surveillance extensions).

### Negative / tradeoffs
- Contribution API stability matters early — version `engines.jobjitsu`.
- UI sandboxing complexity for `ui.panel`.

### Follow-ups
- Share enablement UX patterns with plugins.
- Forbid extensions that default-upload résumés to third-party clouds.
