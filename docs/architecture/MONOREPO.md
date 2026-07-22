# Monorepo Structure

> How the JobJitsu repository is laid out as one calm Career OS codebase.

Parent: [OVERVIEW.md](./OVERVIEW.md) · Boundaries: [PACKAGE_BOUNDARIES.md](./PACKAGE_BOUNDARIES.md)

---

## Goals

- One repo for desktop app, domain packages, plugins, and docs.
- Clear ownership so privacy and egress cannot “leak” across fuzzy folders.
- Horizon 4 extensibility without forking the product into shouty micro-repos.

---

## Top-level layout

```
jobjitsu/
├── app/                 # Desktop shell — UI host, IPC, privacy chrome
├── packages/            # Core libraries & domain packages (the OS spine)
├── plugins/             # First-party plugins (agent skills, adapters)
├── examples/            # Sample plugins, fixtures, local demos (no production secrets)
├── assets/              # Brand assets (logo variants, icons)
├── docs/
│   ├── architecture/    # This folder
│   ├── brand/
│   └── product/
├── .cursor/rules/       # Engineering constitution
└── README.md
```

---

## Workspace roles

| Path | Role | May perform egress? |
|------|------|---------------------|
| `app/` | Desktop host + renderer; wires packages; shows **Agent · On-device** chrome | Only via `packages/send` APIs |
| `packages/*` | Domain and infrastructure libraries | Only `packages/send` (and explicitly documented egress adapters it owns) |
| `plugins/` | Optional, user-enabled capabilities | Only through granted capabilities — never raw network by default |
| `examples/` | Teaching & fixtures | No real career data; no production credentials |
| `docs/` | Vision, brand, architecture | N/A |
| `assets/` | Static brand | N/A |

---

## `packages/` intended map

Names are architectural; **foundation spine** is implemented first.

### Foundation spine

| Package | Responsibility |
|---------|----------------|
| `shared` | Result/AppError, branded IDs, pipeline stage vocabulary |
| `events` | Event contracts + local in-memory bus |
| `logger` | Logger contracts + console/memory sinks (no network) |
| `config` | App settings + memory store (approval/theme defaults) |
| `core` | Kernel: re-exports, ErrorReporter, service registry |
| `sdk` | Public plugin SDK barrel (**no AI runtime**) |
| `testing` | Test helpers for the spine |

### Domain & shell

| Package | Responsibility |
|---------|----------------|
| `storage` | On-device persistence adapters (profiles, blobs, indexes) |
| `identity` | Profile & résumé source of truth |
| `preferences` | Fit rules façade (settings live in `config`) |
| `ai` | Local LLM adapters, context assembly, prompt roles |
| `agent` | Preparative orchestration; pause/resume; never owns send |
| `discovery` | Role search/curation interfaces + built-in adapters |
| `applications` | Draft, tailor, version, track applications |
| `queue` | Holding & review before egress |
| `send` | **Outbound boundary** — apply/submit/mail egress |
| `followups` | Nudge domain & reminder intents |
| `timeline` | What happened; what left vs stayed |
| `scheduler` | Local job runner for follow-ups & prep windows |
| `plugin-sdk` | Manifests, capabilities, sandbox contracts for plugins |
| `extension-sdk` | Host contribution points (UI, discovery, send channels) |
| `ui` | Shared `Jj*` components, tokens, a11y primitives |

---

## `app/` layout (logical)

```
app/
├── host/          # Main/native process: storage, scheduler, AI runtime, plugin loader, egress
├── ui/            # Renderer: views for Applications, Queue, Follow-ups, Preferences, Agent, Logs
├── preload|bridge/# Narrow IPC surface — no ambient Node/fs in UI
└── resources/     # App icons, tray, entitlements notes
```

UI navigates by product nouns: Applications, Follow-ups, Preferences, Agent — not internal package names.

---

## `plugins/` layout (logical)

```
plugins/
├── official/      # First-party, shipped disabled or enabled by preference
└── README.md      # How to enable, inspect, and revoke
```

Community plugins live outside or as git submodules later; the **host loads by manifest + user enablement**, not by ambient install.

---

## Dependency direction (monorepo law)

```
app  →  packages/*  →  shared / events / logger / config / core
plugins  →  sdk / plugin-sdk / extension-sdk  (not into app internals)
ui package  ←  app may use; domain packages must not depend on app
```

- Foundation order: `shared → events → logger → config → core → sdk → testing`
- Domain packages **do not** import `app/`.
- `agent` **does not** import `send` directly; it emits intents / queue transitions.
- `send` may read queue + applications; it alone performs network egress for career payloads.
- `ai` has no network except optional **user-configured** remote model endpoints (never default).
- `sdk` must not pull in AI runtime until an explicit later epic.

---

## Versioning & releases

- App releases version the desktop product.
- Packages may stay private workspace packages until Horizon 4 public SDK publish.
- Plugin manifests declare `engines.jobjitsu` compatibility — no silent break of privacy contracts.

---

## What does not belong in the monorepo

- A multi-tenant cloud API that stores résumés by default.
- Employer ranking / surveillance services.
- Marketing sites that claim guaranteed offers (docs stay honest).
