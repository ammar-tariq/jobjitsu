# Extension System

> Broader, capability-gated **host contributions** — calm rooms in the same dojo.

Parent: [OVERVIEW.md](./OVERVIEW.md) · Skills: [PLUGIN_ARCHITECTURE.md](./PLUGIN_ARCHITECTURE.md) · SDK: `packages/extension-sdk`

---

## Purpose

Horizon 3–4 needs more than agent skills: new discovery sources, send channels, optional UI panels (interview readiness, narrative studio), and export tools. The **extension system** is the umbrella for host-level contribution points.

Extensions deepen the Career OS **without** forking into unrelated products or cloud upsells.

---

## SDK surface

Implementation: [`packages/extension-sdk`](../../packages/extension-sdk/README.md).

```ts
import { createExtensionManager, defineExtension } from "@jobjitsu/extension-sdk";
```

- Type-safe contribution map · lifecycle hooks · scoped DI · optional `Extension.*` events
- Manager starts **empty** — no official extensions are bundled
- Depends on `shared` / `logger` / `events` / `core` only (no cycle with `sdk` or `plugin-sdk`)

---

## Contribution points

| Point | Examples | Guardrail |
|-------|----------|-----------|
| `discovery.source` | Board adapters, RSS, local CSV | Fit curation; not infinite social feed |
| `send.channel` | Board submit, mailto, file export | Always through Send policy + approval |
| `agent.skill` | (delegates to plugin host) | Preparative only |
| `ui.panel` | Optional module views | One job per view; brand tokens |
| `ui.status` | Extra trust indicators | Cannot replace **Agent · On-device** honesty |
| `timeline.exporter` | Portability dumps | User-triggered |
| `scheduler.jobType` | Custom local jobs | Quiet hours respected |

---

## Manifest (conceptual)

```
id: official.discovery.example-board
name: Example board source
version: 1.0.0
contributes:
  - type: discovery.source
    id: example-board
permissions:
  - network.fetch: ["https://example.board/*"]
  - discovery.write_candidates
ui:
  settings: ./settings-fragment   # optional
```

Enablement is per-extension (or per-contribution) with visible permissions.

---

## Capability & permission lattice

```
                    ┌────────────────────┐
                    │   User enablement  │
                    └─────────┬──────────┘
                              ▼
                    ┌────────────────────┐
                    │ Capability grant   │
                    │ (host token)       │
                    └─────────┬──────────┘
                              ▼
              ┌───────────────┴───────────────┐
              ▼                               ▼
     Contribution runs                 Denied APIs throw
     within declared scope             (no ambient fs/net)
```

**Send channels** receive a host-provided `send` façade that:

1. Checks preferences (approval-before-send).
2. Requires Queue approval when policy says so.
3. Emits `Send.*` and `Privacy.EgressRecorded`.
4. Returns honest success | failed | unknown.

---

## Loading & isolation

- Extensions load in the **host** process (or dedicated worker), never with unconstrained renderer privileges.
- UI fragments render in sandboxed webviews/panels with a narrow bridge.
- Crash of an extension must not corrupt identity storage; Agent pause remains available.

---

## First-party vs third-party

| | First-party | Third-party |
|---|-------------|-------------|
| Shipped in | `plugins/` / curated registry | User install path |
| Default | May ship enabled only if zero sensitive perms | Always default off |
| Update | App release | Manual / explicit |

---

## UI contribution rules

- Use shared `ui` tokens (Midnight Ink, Electric Teal, Inter).
- Sentence-case copy; voice from brand docs.
- No streak widgets, guilt banners, or employer-facing dashboards.
- Empty states invite; they do not plead.

---

## Lifecycle

```
discover → inspect manifest → user enables → grant capabilities
  → register contributions → run → user disables → revoke → unload
```

Timeline may record enable/disable when it affects trust posture.

---

## Extension vs product module

A **product module** (Features doc) may be implemented as core packages first. When community or optional depth is needed, the same UX can be backed by an official extension. Architecture prefers **core for spine**, **extensions for optional breadth** — still one OS feel.

---

## Forbidden extensions

- Anything that stores résumés in a third-party cloud by default.
- Employer surveillance / candidate ranking for hiring funnels.
- Autopilot send without sovereignty.
- Ad injection or career-data resale.
