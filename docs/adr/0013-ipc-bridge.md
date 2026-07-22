# ADR 0013: Narrow Host↔UI IPC Bridge

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Desktop architecture](../architecture/DESKTOP_ARCHITECTURE.md) · [Tauri](./0001-tauri.md)

---

## Context

If the React webview receives ambient filesystem, shell, or arbitrary HTTP for career data, the outbound boundary and plugin sandbox become theater. Tauri enables tight command allowlists; we must commit to deny-by-default.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **Allowlisted commands + event subscription** | Enforces architecture laws | Every feature needs a command |
| Expose Node/fs to renderer | Familiar to web apps | Privacy defect |
| Full REST localhost server unbounded | Easy debugging | Large attack surface |

---

## Decision

**Use a narrow, deny-by-default IPC bridge** between UI and host.

- UI invokes explicit commands: preferences, agent control, queue approve/reject, send-under-policy, follow-ups, plugin enablement, sanitized logs.
- UI subscribes to batched domain events / model health for badge and toasts.
- No generic `eval`, raw `fs`, or unbounded `fetch` from the renderer for career payloads.
- Prefer Tauri command/event primitives aligned with this allowlist.

---

## Consequences

### Positive
- Renderer stays presentation-focused.
- Egress and storage remain host-side and reviewable.
- Matches testing strategy for bridge deny-by-default.

### Negative / tradeoffs
- New UI flows need host command work — intentional.
- Developers must not “just fetch from the client” for boards.

### Follow-ups
- Document command catalog beside implementation.
- Contract tests attempt forbidden bridge operations and expect failure.
