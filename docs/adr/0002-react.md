# ADR 0002: Use React for the Desktop UI

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Desktop architecture](../architecture/DESKTOP_ARCHITECTURE.md) · [Design system](../brand/DESIGN_SYSTEM.md)

---

## Context

The UI must support calm, keyboard-friendly flows: Applications, Queue, Follow-ups, Preferences, Agent, Timeline — dark mode first, `Jj*` components, accessibility, and reduced motion. The renderer is presentation-only; domain and egress stay in the host.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **React** | Ecosystem, a11y patterns, hiring familiarity | Footgun if business logic leaks into UI |
| Svelte | Smaller runtime | Smaller shared design-system ecosystem |
| Solid | Fine-grained perf | Less common for contributors |
| Immediate-mode native UI | Max native widgets | Fights web design-system docs |

---

## Decision

**Use React** (TypeScript) for `app/ui`, consuming shared primitives from `packages/ui`.

- Components follow `Jj{Domain}{Element}` naming.
- Tokens: Midnight Ink, Electric Teal, Inter — per brand guidelines.
- UI talks to the host only via the narrow IPC bridge ([ADR 0013](./0013-ipc-bridge.md)).
- Prefer modern React patterns already adopted by the team; avoid premature memoization theater.

---

## Consequences

### Positive
- Maps cleanly to design-system and copy guidelines.
- Strong a11y and testing options for privacy chrome and live regions.
- Contributors can work on UI without touching Rust host.

### Negative / tradeoffs
- Discipline required so React does not become a second data plane.
- Bundle size must stay humble inside Tauri webview.

### Follow-ups
- `packages/ui` owns tokens and `Jj*` primitives; feature views live in `app/ui`.
- Storybook (or equivalent) optional later — not a Horizon 1 blocker.
