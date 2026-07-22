# Definition of Done

A task, story, or pull request is **not complete** until every gate below passes.

> Plan → implement one slice → satisfy this DoD → then move on.  
> See [AI_DEVELOPMENT_WORKFLOW.md](./AI_DEVELOPMENT_WORKFLOW.md) · [VERTICAL_SLICES.md](./docs/backlog/VERTICAL_SLICES.md)

---

## Gates (required)

| Gate | Meaning | How to verify |
|------|---------|---------------|
| **Documented** | Behavior, APIs, and decisions are written where a contributor will look | Package/README, architecture note, ADR, or backlog story AC updated; no silent public API |
| **Tested** | Behavior is covered by automated tests; privacy/architecture guarantees hold | `pnpm test` green for affected packages; new logic has unit/integration coverage |
| **Typed** | TypeScript is strict and honest — no escape hatches for convenience | `pnpm typecheck` green; no unjustified `any` / `@ts-ignore` |
| **Reviewed** | Another person (or explicit self-review checklist for solo) has checked the change | PR reviewed, or solo checklist in PR body completed against this DoD |
| **Follows architecture** | Package boundaries, local-first, egress rules, and ADRs respected | Diff checked against `docs/architecture/`, ADRs, `.cursor/rules/architecture.mdc` |
| **Passes lint** | Style and static rules clean | `pnpm lint` / `pnpm lint:root` green (`--max-warnings 0`) |
| **Passes build** | Packages compile and emit cleanly | `pnpm build` green |

**One-liner for CI / local:**

```bash
pnpm check   # format:check + lint + typecheck + test + build
```

`pnpm check` covers typed, lint, tested, and build. **Documented**, **reviewed**, and **follows architecture** remain human gates.

---

## Checklist (copy into PR / story)

```markdown
### Definition of Done

- [ ] **Documented** — docs/README/ADR/story updated for the change
- [ ] **Tested** — tests added/updated; `pnpm test` passes
- [ ] **Typed** — `pnpm typecheck` passes; no unjustified `any`
- [ ] **Reviewed** — PR review done (or solo review checklist below)
- [ ] **Follows architecture** — boundaries, local-first, ADRs respected
- [ ] **Passes lint** — `pnpm lint` / format check clean
- [ ] **Passes build** — `pnpm build` passes
```

### Solo review checklist (when no second reviewer)

- [ ] Diff matches the story acceptance criteria only (no drive-by scope)
- [ ] No network/cloud introduced unless explicitly approved and user-opt-in
- [ ] Agent remains preparative; Send stays the egress boundary
- [ ] UI copy: **Agent** (not LLM); privacy chrome honest; no pressure language
- [ ] Secrets / PII not logged or committed

---

## Gate detail

### Documented

- Public exports and package purpose reflected in the package README (or root docs).
- User-visible behavior covered by backlog story AC or product docs when relevant.
- Architecture-affecting choices recorded (ADR or short note under `docs/architecture/`).
- Run instructions updated if launch/dev steps changed.

### Tested

- Happy path and failure path for new logic.
- Boundary tests when touching privacy, IPC, plugins, or package fences.
- Follow [`.cursor/rules/testing.mdc`](./.cursor/rules/testing.mdc).
- Do not claim Done with skipped or disabled tests for the new behavior.

### Typed

- Strict TypeScript; interfaces over loose objects at package boundaries.
- Prefer `Result` / typed errors over thrown strings for domain failures.
- Generated `.d.ts` / package `exports` remain consistent with source.

### Reviewed

- Prefer a second pair of eyes on architecture and privacy-sensitive diffs.
- Solo contributors: complete the solo review checklist in the PR description.
- Review focuses on correctness, boundaries, and calm UX — not vanity metrics.

### Follows architecture

- Respect monorepo package boundaries ([MONOREPO.md](./MONOREPO.md), ADRs).
- Local-first defaults; no ambient egress; deny-by-default IPC.
- `@jobjitsu/agent` must not depend on `@jobjitsu/send`.
- Align with [MANIFESTO.md](./MANIFESTO.md) and brand development rules.

### Passes lint

- ESLint and Prettier clean for touched files.
- Conventional Commits for commits that land on shared branches.

### Passes build

- Turborepo `build` succeeds for the workspace (or at least affected packages plus dependents).
- No broken package entrypoints.

---

## What “Done” is not

- “Works on my machine” without tests or typecheck.
- Undocumented public APIs or host wiring.
- Architecture violations “temporary” without an ADR and follow-up task.
- UI that ships pressure, LLM-in-chrome labeling, or silent network.

---

## Scope of application

| Work item | DoD applies? |
|-----------|--------------|
| Technical task (day slice) | Yes — full gates |
| User story | Yes — all tasks + story AC + DoD |
| Docs-only change | Documented + reviewed; lint/format for markdown; build/test N/A if untouched |
| ADR / planning only | Documented + reviewed; other gates N/A |

When a gate is genuinely N/A, say so explicitly in the PR (do not silently skip).

---

## References

- [AI_DEVELOPMENT_WORKFLOW.md](./AI_DEVELOPMENT_WORKFLOW.md)
- [docs/backlog/VERTICAL_SLICES.md](./docs/backlog/VERTICAL_SLICES.md)
- [docs/architecture/OVERVIEW.md](./docs/architecture/OVERVIEW.md)
- [docs/brand/BRANDING_FOR_DEVELOPMENT.md](./docs/brand/BRANDING_FOR_DEVELOPMENT.md)
- [`.cursor/rules/architecture.mdc`](./.cursor/rules/architecture.mdc)
- [`.cursor/rules/testing.mdc`](./.cursor/rules/testing.mdc)
- [`.cursor/rules/coding-standards.mdc`](./.cursor/rules/coding-standards.mdc)
