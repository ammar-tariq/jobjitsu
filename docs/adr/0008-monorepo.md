# ADR 0008: pnpm Monorepo Workspaces

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Monorepo](../architecture/MONOREPO.md)

---

## Context

JobJitsu spans `app/`, many `packages/`, `plugins/`, and docs. Multiple repos would slow boundary enforcement and duplicate versioning. npm/yarn also work; the team needs one workspace tool with strict dependency graphs.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **pnpm workspaces** | Strict node_modules, efficient linking, good monorepo defaults | Contributors must use pnpm |
| npm workspaces | Ubiquitous | Weaker isolation historically |
| Yarn Berry | Features | Different DX; heavier philosophy |
| Polyrepo | Independent release | Fractures Career OS; harder privacy review |

---

## Decision

**Use a pnpm monorepo** with workspace packages under `packages/*`, app under `app/`, and plugins as workspace members or separately linked packages.

- Domain packages do not depend on `app/`.
- `agent` must not depend on `send` ([ADR 0009](./0009-send-boundary.md)).
- Private packages until Horizon 4 public SDK publish.
- Optional Turborepo/nx later for task caching — not required to accept this ADR. (**Note:** Turborepo is now wired at the repo root; this ADR’s monorepo choice stands.)

---

## Consequences

### Positive
- One review surface for privacy and egress.
- Matches existing repo folders (`app`, `packages`, `plugins`).
- Enforces package boundaries via workspace deps.

### Negative / tradeoffs
- Onboarding requires pnpm.
- CI must install with pnpm lockfile discipline.

### Follow-ups
- ~~Add root `package.json` / `pnpm-workspace.yaml` when implementation starts (not part of this ADR text).~~ **Done** — root `package.json`, `pnpm-workspace.yaml`, and Turborepo (`turbo.json` / `turbo run …`) are in place.
- Document package fence lint if dependency graph drifts.
