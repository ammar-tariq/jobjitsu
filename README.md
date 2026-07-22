# JobJitsu

**The gentle art of landing the job.**  
_On-device. On-target. On your terms._

JobJitsu is an open-source **AI Career Operating System** — a desktop-native companion that gives you a local AI black belt for the job hunt. It runs a local Agent with on-device intelligence. Your résumé, preferences, and drafts stay on your machine. Nothing leaves the dojo except what you choose to send.

Calm confidence. Technique over volume. Your agent, your rules.

---

## Why JobJitsu

Job hunting is often sold as a grind: spray applications, chase algorithms, rent your data to another SaaS. JobJitsu rejects that model.

We treat the hunt as a craft. Like jujitsu, it rewards leverage over force — precision over panic. The agent prepares; you approve. Progress is quiet. Privacy is architecture, not a settings toggle.

| Promise           | Meaning                                      |
| ----------------- | -------------------------------------------- |
| **On-device**     | Local Agent · On-device intelligence         |
| **On-target**     | Fit and technique over spray-and-pray        |
| **On your terms** | Preferences, pause, and approval before send |

---

## The pipeline

```
search → curate → tailor → queue → approve → send → follow up
```

One calm operating system for the loop — not a cockpit of anxiety, not a cloud résumé farm.

---

## Status

This repository is in early foundation: brand, product vision, engineering standards, and **monorepo scaffold** (Turborepo + packages) are in place. Domain business logic is not implemented yet.

Your belt will be tied. Waiting for the first throw.

---

## Repository layout

Target shape (what we aim for):

```
JobJitsu/
├── apps/
│   └── desktop/          # Tauri + React shell (today: app/ @jobjitsu/app)
├── packages/             # Domain & shared libraries
├── website/              # Docusaurus docs site (reads /docs in place)
├── docs/                 # Product, architecture, brand, backlog, ADRs
├── .github/              # Actions, future issue/PR templates
├── scripts/              # setup / local run helpers (see scripts/README.md)
├── README.md
└── LICENSE               # TBD — open-source intent; license not chosen yet
```

Today the desktop shell still lives at `app/` (not yet `apps/desktop/`). `packages/`, `website/`, `docs/`, and `.github/workflows/` are already in place. See [MONOREPO.md](./MONOREPO.md).

---

## Run locally

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** 9.x (pinned via `packageManager` in `package.json`; `corepack` can install it)

### 1. Clone and set up

```bash
git clone https://github.com/ammar-tariq/jobjitsu.git
cd jobjitsu
pnpm bootstrap
```

`pnpm bootstrap` runs [`scripts/setup.sh`](./scripts/setup.sh): checks Node, ensures pnpm, installs dependencies, and builds `@jobjitsu/ui` (required by the desktop shell).

Equivalent: `./scripts/setup.sh` · alias: `pnpm setup:local`

### 2. Desktop shell (UI)

```bash
pnpm dev:app
```

- Opens Vite at **http://localhost:1420**
- Early foundation: sidebar + Coming Soon placeholders — no full product features yet
- Script: [`scripts/dev-app.sh`](./scripts/dev-app.sh)

### 3. Documentation site

```bash
pnpm dev:website
```

- Docusaurus at **http://localhost:3000** (default)
- Reads [`docs/`](./docs) in place — documentation-first, not a marketing funnel
- Alias: `pnpm dev:docs` · Script: [`scripts/dev-website.sh`](./scripts/dev-website.sh)

### 4. Quality gate (before a PR)

```bash
pnpm check    # format + lint + typecheck + test + build
```

A change is complete only when it meets the [Definition of Done](./DEFINITION_OF_DONE.md): documented, tested, typed, reviewed, follows architecture, passes lint, passes build.

### Useful commands

| Command              | Purpose                               |
| -------------------- | ------------------------------------- |
| `pnpm bootstrap`     | Install + prepare local workspace     |
| `pnpm setup:local`   | Alias for `bootstrap`                 |
| `pnpm dev:app`       | Desktop shell (localhost:1420)        |
| `pnpm dev:website`   | Docs site (localhost:3000)            |
| `pnpm build:app`     | Build desktop UI bundle               |
| `pnpm build:website` | Build static docs site                |
| `pnpm check`         | Full DoD gate                         |
| `pnpm test`          | Package tests                         |
| `pnpm clean`         | Remove build artifacts / node_modules |

More detail: [scripts/README.md](./scripts/README.md) · [MONOREPO.md](./MONOREPO.md)

---

## Development

### Docs → GitHub Pages workflow

Once docs or website files land on `main`, publishing is automatic — no separate docs deploy step:

```
Update documentation
        │
        ▼
Commit changes
        │
        ▼
Push to GitHub (main)
        │
        ▼
GitHub Actions (.github/workflows/deploy-docs.yml)
        │
        ├── Build @jobjitsu/website
        ├── Validate links (fail on broken)
        └── Publish GitHub Pages

(Later) Build desktop releases
```

Published docs: https://ammar-tariq.github.io/jobjitsu/

### Product

| Doc                                                              | Description                    |
| ---------------------------------------------------------------- | ------------------------------ |
| [Manifesto](MANIFESTO.md)                                        | Project philosophy             |
| [Product vision](docs/product/PRODUCT_VISION.md)                 | Vision & mission               |
| [Platform specification](docs/product/PLATFORM_SPECIFICATION.md) | Functional behavior (**what**) |
| [Terminology](docs/product/TERMINOLOGY.md)                       | Canonical names                |
| [Roadmap](docs/product/ROADMAP.md)                               | Long-term horizons             |
| [Features & modules](docs/product/FEATURES.md)                   | Core / Experimental / Future   |
| [Principles](docs/product/PRINCIPLES.md)                         | Decision filters               |
| [Non-goals](docs/product/NON_GOALS.md)                           | What we will not become        |

### Brand

| Doc                                                        | Description                       |
| ---------------------------------------------------------- | --------------------------------- |
| [Brand guidelines](docs/brand/BRAND_GUIDELINES.md)         | Logo, color, type, voice overview |
| [Product philosophy](docs/brand/PRODUCT_PHILOSOPHY.md)     | Beliefs and metaphor map          |
| [Voice & tone](docs/brand/VOICE_AND_TONE.md)               | How JobJitsu sounds               |
| [Design system (brand)](docs/brand/DESIGN_SYSTEM.md)       | Naming, icons, illustration       |
| [Design system (production)](docs/design-system/README.md) | Tokens, themes, components        |
| [Copy guidelines](docs/brand/COPY_GUIDELINES.md)           | Product string architecture       |

### Architecture

| Doc                                                                    | Description                          |
| ---------------------------------------------------------------------- | ------------------------------------ |
| [System architecture](SYSTEM_ARCHITECTURE.md)                          | Index → system map                   |
| [System architecture (full)](docs/architecture/SYSTEM_ARCHITECTURE.md) | C4 map, layers, runtime paths        |
| [Architecture overview](docs/architecture/OVERVIEW.md)                 | Local-first Career OS design         |
| [Architecture principles](ARCHITECTURE_PRINCIPLES.md)                  | Non-negotiable architectural rules   |
| [Monorepo](docs/architecture/MONOREPO.md)                              | Repository & package map             |
| [ADRs](docs/adr/README.md)                                             | Accepted decisions (Tauri, React, …) |
| [Full index](docs/architecture/README.md)                              | Events, plugins, desktop, AI, tests  |

### Backlog & process

| Doc                                                                    | Description                                     |
| ---------------------------------------------------------------------- | ----------------------------------------------- |
| [Implementation roadmap](IMPLEMENTATION_ROADMAP.md)                    | Index to backlog / horizons                     |
| [Backlog index](docs/backlog/README.md)                                | Epics → tasks                                   |
| [Dependency graph](docs/backlog/DEPENDENCY_GRAPH.md)                   | Build waves & critical path                     |
| [Engineering constitution](ENGINEERING_CONSTITUTION.md)                | How we build (process)                          |
| [Definition of Done](DEFINITION_OF_DONE.md)                            | Completion gates                                |
| [AI development workflow](docs/development/AI_DEVELOPMENT_WORKFLOW.md) | Plan → implement → commit (+ article detection) |
| [Article system](docs/articles/ARTICLE_SYSTEM.md)                      | Milestone → proposal → publish                  |
| [Docs prompts pipeline](docs/prompts/README.md)                        | Phased docs checkpoints                         |
| [Roadmap user stories](docs/roadmap/USER_STORIES.md)                   | Platform → PE* epics                            |

---

## Principles (short)

1. **Privacy is the platform** — on-device by default; outbound only when you act.
2. **The agent serves** — it does not own the send button.
3. **Leverage over volume** — well-aimed throws beat vanity counts.
4. **Calm confidence** — no urgency theater, streaks, or guilt loops.
5. **Open trust** — inspectable, open-source, local execution.

---

## Contributing

Follow the [Engineering constitution](ENGINEERING_CONSTITUTION.md), [Definition of Done](DEFINITION_OF_DONE.md), and [`.cursor/rules/`](.cursor/rules/).

Before proposing a feature, check [Non-goals](docs/product/NON_GOALS.md), [Principles](docs/product/PRINCIPLES.md), and [Terminology](docs/product/TERMINOLOGY.md).

---

## License

License to be confirmed. JobJitsu is intended as open-source software.
