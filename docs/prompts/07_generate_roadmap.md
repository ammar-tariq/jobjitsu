# 07 — Generate roadmap

You are aligning JobJitsu **directional** and **execution** roadmaps.

## Goal

Keep [docs/product/ROADMAP.md](../product/ROADMAP.md) (horizons) and [docs/backlog/](../backlog/) (execution) coherent. Do not replace [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) index with a prompt stub or a duplicate mega-doc.

## Required reading

- [ROADMAP.md](../product/ROADMAP.md)
- [FEATURES.md](../product/FEATURES.md) — status labels
- [docs/backlog/README.md](../backlog/README.md)
- [EPICS.md](../backlog/EPICS.md)
- [DEPENDENCY_GRAPH.md](../backlog/DEPENDENCY_GRAPH.md)
- [sprint-1.md](../backlog/sprint-1.md)
- [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md)

## Deliverables

1. Ensure [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) orders `PE*` stories into waves (GitHub Roadmap–ready) and stays linked from backlog + product ROADMAP.
2. Keep [docs/product/ROADMAP.md](../product/ROADMAP.md) horizons coherent with Core vs Experimental vs Future — do not promise Future as H1.
3. Optional: short “current focus” blurb in backlog README pointing at active sprint + next PE slice.

## Constraints

- Architecture before feature sprawl
- Infrastructure before business logic where backlog already says so
- No SaaS milestone (“launch cloud”)

## Done when

- Horizons ↔ epics readable for contributors
- Feature Status respected
- Conventional Commit
- **Stop and wait for approval** before phase 08
