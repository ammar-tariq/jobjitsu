# ADR 0011: TypeScript as the Domain Language

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Monorepo](../architecture/MONOREPO.md) · [Coding standards](../../.cursor/rules/coding-standards.mdc)

---

## Context

Domain packages (identity, agent, queue, events, AI adapters orchestration, plugin SDK) need a shared, inspectable language friendly to open-source contributors and fast unit tests. The Tauri host is Rust ([ADR 0001](./0001-tauri.md)); duplicating all domain logic in Rust would slow Horizon 1.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **TypeScript packages + Rust host** | Testable domain, shared UI types | Boundary across IPC/FFI |
| Rust-everywhere domain | Max safety | Higher contributor bar; slower UI sharing |
| Python domain core | AI ecosystem | Weaker desktop packaging story |

---

## Decision

**Implement domain and SDK packages in TypeScript**; keep privileged orchestration wiring in the Tauri host (Rust) which invokes or embeds those packages as designed by the implementation approach (e.g. host commands calling into a Node/sidecar or shared WASM — exact embedding mechanism left to implementation RFC, but **language split stands**).

Practical Horizon 1 expectation:

- `packages/*` authored in TypeScript.
- React UI in TypeScript ([ADR 0002](./0002-react.md)).
- Host enforces IPC, process lifecycle, and native egress sockets, delegating policy-rich logic to TS packages where feasible.

---

## Consequences

### Positive
- Aligns with `Jj*` UI and event typing.
- Strong contract tests without full GUI.
- Open-source accessibility for JS/TS contributors.

### Negative / tradeoffs
- Must carefully design host↔TS runtime embedding to avoid shipping a hidden Electron.
- Two languages in repo (TS + Rust) — document ownership clearly.

### Follow-ups
- Implementation RFC: how Tauri host loads/runs TS domain (sidecar vs alternative) without weakening privacy.
- Shared types package (`core` / `events`) as single source for IPC payloads.
