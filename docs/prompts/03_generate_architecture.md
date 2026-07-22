# 03 — Generate / refine architecture

You are documenting **how** JobJitsu is built — not inventing a new product.

## Goal

Ensure [docs/architecture/](../architecture/) and [docs/adr/](../adr/) fully express structure implied by the platform specification and existing ADRs. Prefer refining existing files over creating parallel root mega-docs.

## Required reading

- [PLATFORM_SPECIFICATION.md](../product/PLATFORM_SPECIFICATION.md) (**what**)
- [TERMINOLOGY.md](../product/TERMINOLOGY.md)
- [ARCHITECTURE_PRINCIPLES.md](../../ARCHITECTURE_PRINCIPLES.md)
- [SYSTEM_ARCHITECTURE.md](../../SYSTEM_ARCHITECTURE.md) (index — keep as index)
- All of [docs/architecture/](../architecture/) and [docs/adr/](../adr/)
- [NON_GOALS.md](../product/NON_GOALS.md) and send-boundary ADR

## Hard constraints

- Local-first; no JobJitsu cloud backend
- Agent preparative; **Send** is sole career egress
- UI never calls AI Providers directly (host / events)
- Optional remote AI Provider only when user-configured and honestly labeled
- Do not invent packages, events, or workflows not grounded in existing docs/spec

## Deliverables

1. Short plan: which architecture files to add/update (paths + why). **Wait for approval.**
2. After approval, update docs under `docs/architecture/` (and ADRs only if a real decision changed).
3. Keep [SYSTEM_ARCHITECTURE.md](../../SYSTEM_ARCHITECTURE.md) as a pointer/index.
4. Use Mermaid for structural diagrams.
5. Cross-link TERMINOLOGY and product FEATURES status where relevant.

## Focus areas (existing concerns only)

- Package boundaries and dependency direction
- Event system catalog alignment
- Desktop / IPC / privacy chrome (**Agent · On-device**)
- AI Provider, Context Builder, Model Manager (as already specified)
- Workflow / Task Queue only if already present in product/architecture docs
- Plugins vs Extensions
- Scheduler, storage, testing strategy

## Done when

- Architecture index is complete and linked
- No contradiction with platform WHAT or non-goals
- Conventional Commit for the change set
- **Stop and wait for approval** before phase 04
