# ADR 0001: Use Tauri as the Desktop Shell

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Desktop architecture](../architecture/DESKTOP_ARCHITECTURE.md) · [Overview](../architecture/OVERVIEW.md)

---

## Context

JobJitsu is a desktop-native AI Career Operating System. The shell must feel **native, light, and fast**, keep a clear host/UI split, and respect the machine — not ship a heavy SaaS wrapper. Privacy requires privileged work (storage, local LLM, egress, plugins) to live outside the renderer.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **Tauri** | Small footprint, Rust host, strong IPC isolation, OS-native feel | Rust host learning curve |
| Electron | Huge ecosystem, pure JS | Heavy Chromium, weaker “light/fast” fit |
| Pure native (Swift/Kotlin) | Max native | Split codebases; slower open-source contribution |

---

## Decision

**Use Tauri** as the desktop application shell.

- **Host (Rust):** storage orchestration, AI runtime lifecycle, agent, scheduler, plugin loader, send egress, event bus, OS notifications.
- **UI (webview):** React app; no ambient filesystem or career-payload network.
- All career egress goes host → `packages/send` (see [ADR 0009](./0009-send-boundary.md)).

---

## Consequences

### Positive
- Aligns with “native, light, fast” and privacy-as-architecture.
- Natural process boundary for Local LLM badge honesty and deny-by-default IPC ([ADR 0013](./0013-ipc-bridge.md)).
- Smaller distributables; respectful of user machines.

### Negative / tradeoffs
- Host logic in Rust requires clear FFI/IPC contracts to TypeScript packages.
- Some Electron-only libraries unavailable; prefer Tauri plugins or host-side impl.

### Follow-ups
- Define app bundle entitlements and user-data directory layout in storage ADR.
- Keep domain logic in TypeScript packages where practical for testability ([ADR 0011](./0011-typescript.md)).
