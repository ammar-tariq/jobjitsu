# Implementation Roadmap

> Build order and delivery tracking — not product vision, not architecture design.

This file is an **index**. The living implementation plan lives under [`docs/backlog/`](docs/backlog/).

## Start here

| Doc | Responsibility |
|-----|----------------|
| [Backlog index](docs/backlog/README.md) | Epics → features → stories → tasks |
| [Epics](docs/backlog/EPICS.md) | E01–E19 catalog by horizon |
| [Dependency graph](docs/backlog/DEPENDENCY_GRAPH.md) | Build waves and critical path |
| [Sprint 1](docs/backlog/sprint-1.md) | Desktop Foundation (current foundation sprint) |
| [Vertical slices](docs/backlog/VERTICAL_SLICES.md) | One-story process and status |
| [Product roadmap](docs/product/ROADMAP.md) | Directional horizons (H1–H4) |

## Related

| Doc | Responsibility |
|-----|----------------|
| [Platform specification](docs/product/PLATFORM_SPECIFICATION.md) | Functional behavior (**what**) |
| [System architecture](SYSTEM_ARCHITECTURE.md) | Pointer to **how** docs |
| [Definition of Done](DEFINITION_OF_DONE.md) | Completion gates |
| [AI development workflow](AI_DEVELOPMENT_WORKFLOW.md) | Plan → implement → commit loop |

## Guidance

- Prioritize architecture and reusable infrastructure before business features.
- Prefer independently mergeable vertical slices ([VERTICAL_SLICES.md](docs/backlog/VERTICAL_SLICES.md)).
- Do not treat horizon aspirational modules as Horizon 1 commitments — see [FEATURES.md](docs/product/FEATURES.md) status labels.
