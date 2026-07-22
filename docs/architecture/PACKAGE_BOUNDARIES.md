# Package Boundaries

> Who owns what — and who is forbidden from calling whom.

Parent: [OVERVIEW.md](./OVERVIEW.md) · Layout: [MONOREPO.md](./MONOREPO.md)

---

## Boundary principles

1. **One egress package** — career data leaves only through `send` (or send-owned channel adapters).
2. **Agent cannot send** — `agent` prepares and queues; it never holds network credentials for boards/mail.
3. **UI is not a data plane** — renderer talks to host via commands/queries; persistence and models stay in host/packages.
4. **Preferences are policy** — approval gates and quiet hours are enforced in domain/host, not only in button disablement.
5. **Extensions are guests** — they receive capability tokens; they do not import privileged host modules.

---

## Allowed dependency graph (simplified)

```
shared
  ├── events
  ├── config
  └── (ids/result used widely)

logger  (local sinks only)

core  ←  shared + events + logger + config
  ├── ErrorReporter
  └── ServiceRegistry / FoundationKeys

sdk  ←  core + plugin-sdk   (public surface; no ai)

testing  ←  spine helpers

domain packages → core / shared / events / storage …
app → packages/*
```

Legacy shorthand:

```
                    ┌──────────┐
                    │  shared  │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
      events          config          (ids)
         │               │
         └───────┬───────┘
                 ▼
          logger + core (kernel)
                 │
                 ▼
                sdk
```

Domain:

```
storage / identity / preferences / … → send (only egress)
agent must not import send
```

---

## Package contracts

### `shared`
- Result / AppError helpers, branded IDs, pipeline stage vocabulary.
- **Depends on:** nothing.

### `events`
- Typed event names and payloads (see [EVENT_SYSTEM.md](./EVENT_SYSTEM.md)).
- In-process bus + `createInMemoryEventBus`.
- **Depends on:** `shared`.
- **Must not:** transmit events off-device.

### `logger`
- Logger / LogSink contracts + console/memory implementations.
- **Must not:** network or cloud crash reporting.

### `config`
- App settings document, defaults, memory store, quiet-hours helpers.
- **Must not:** register AI providers (reserved `ai` fields only).

### `core`
- Kernel: re-exports shared/logger contracts, `ErrorReporter`, service registry.
- **Depends on:** `shared`, `events`, `logger`, `config`.

### `sdk`
- Public barrel for plugins (`HostContext`, safe re-exports) plus extension manager APIs.
- **Must not:** export or boot `@jobjitsu/ai`.
- May re-export `@jobjitsu/extension-sdk` without creating cycles (`sdk` → `extension-sdk` → `core`).

### `testing`
- `expectOk` / `createTestFoundation` helpers for the spine.

### `storage`
- Local repositories for documents, files, embeddings indexes.
- Encryption-at-rest hooks optional; default remains on-device.
- **Must not:** sync to cloud object stores by default.

### `identity`
- Résumé and profile read models for tailoring.
- **Consumers:** `ai`, `applications`, `agent` (read).
- **Must not:** upload profile remotely.

### `preferences`
- Fit rules, approval-before-send, notification sound, quiet hours, model path.
- **Enforced by:** `queue`, `send`, `scheduler`, `agent`.

### `ai`
- Provider interface: `complete`, `embed`, health/status for **Agent · On-device** chrome.
- Context builder: identity + application + role — assembled locally.
- **Must not:** default to a vendor cloud; optional remote requires explicit user config and UI honesty.

### `agent`
- Plans preparative work: discover suggestions, tailor drafts, enqueue for review.
- Honors pause; emits progress events (batched, calm).
- **Must not:** call `send.execute`; **must not** bypass queue when approval is required.

### `discovery`
- `Source` interface for listings; curation/scoring toward fit (leverage, not volume caps as vanity).
- Extensions may add sources via [EXTENSION_SYSTEM.md](./EXTENSION_SYSTEM.md).

### `applications`
- Draft lifecycle, versions, tailor metadata.
- Source of truth for “the throw” before/after send.

### `queue`
- Review ritual: items awaiting approval.
- Transitions to send only after policy checks.

### `send`
- **Outbound boundary.** Applies, submits, or dispatches mail.
- Writes egress records to `timeline` (what left, when, destination class).
- Honest completion: success | failed | unknown — never lie.

### `followups`
- Reminder intents linked to applications; polite nudge copy belongs in product strings, not scheduler urgency.

### `timeline`
- Append-only local history for craft continuity and privacy audit (“what left / what stayed”).

### `scheduler`
- See [SCHEDULER.md](./SCHEDULER.md). Triggers follow-up due, agent prep windows — local only.

### `plugin-sdk` / `extension-sdk`
- Manifests, capability enums, host APIs safe for guests.
- **Must not:** expose raw filesystem or ambient network without capability.

### `ui`
- Presentational `Jj*` components, design tokens (Midnight, teal), a11y focus rings.
- **Must not:** contain egress or LLM provider secrets.

---

## Forbidden couplings

| From → To | Why forbidden |
|-----------|----------------|
| `agent` → `send` | Breaks sovereignty |
| `ui` → `storage` directly | Bypasses host policy |
| `ai` → analytics SaaS with résumé text | Privacy violation |
| `discovery` → `send` | Finding is not applying |
| `plugins` → `app/host` internals | Escape hatch around capabilities |
| Any package → streak/guilt metric stores | Non-goal |

---

## API style across packages

- Prefer **commands** (intent) and **queries** (read models) over shared mutable singletons.
- Cross-package reactions go through **events**, not deep method chains.
- Public package surfaces stay small; internals may be richer.

---

## Evolution rule

Merging packages for early delivery is allowed **if** the egress and agent/send separation remain enforceable (lint, tests, or module fences). Splitting later must not weaken the outbound boundary.
