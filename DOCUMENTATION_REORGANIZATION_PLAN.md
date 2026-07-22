# Documentation Reorganization Plan — JobJitsu

> **Documentation Architect** · Generated 2026-07-23  
> Status: **AWAITING APPROVAL** — no moves, renames, or merges until you approve.  
> Constraints: no production code · no product vision changes · no invented features · no placeholder stubs.

Companion audit notes are embedded below (Phase 1). Phases 3–8 execute only after approval.

---

## Phase 1 — Documentation Audit (summary)

### Root health

| Finding | Detail |
|---------|--------|
| Root `.md` count | **16** (only `README.md` belongs under strict OSS root hygiene) |
| Missing OSS files | `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `CHANGELOG.md` |
| `.github/` | Empty (no issue/PR templates, no workflows) |
| `docs/` | **89** files · **no** `docs/README.md` / `PROJECT_INDEX.md` |
| `docs/product/VISION.md` | **Empty (0 bytes)** — orphan |
| Build configs at root | Correct (`package.json`, `turbo.json`, `pnpm-workspace.yaml`, …) |

### Wrong location

All living process/architecture/roadmap markdown currently at **repo root** should live under `/docs` (except `README.md`).

### Duplicates / overlaps

| Conflict | Winner (SSOT) | Loser / action |
|----------|---------------|----------------|
| Root `SYSTEM_ARCHITECTURE.md` vs `docs/architecture/SYSTEM_ARCHITECTURE.md` | `docs/architecture/…` | Remove root index after README update |
| `docs/brand/PRODUCT_VISION.md` (stub) vs `docs/product/PRODUCT_VISION.md` | Product | Delete brand stub after link sweep |
| `docs/product/VISION.md` (empty) | — | Delete |
| `MANIFESTO.md` ↔ `docs/brand/PRODUCT_PHILOSOPHY.md` | Philosophy (absorb manifesto narrative) | Merge into philosophy; drop root Manifesto |
| `docs/backlog/FEATURES.md` (stub) vs `EPIC_FEATURES.md` vs `docs/product/FEATURES.md` | Product modules + `EPIC_FEATURES` | Delete backlog stub |
| Dual `USER_STORIES.md` (backlog `E*` vs roadmap `PE*`) | Keep both roles | Rename roadmap file for clarity |
| Root `MONOREPO.md` (ops) vs `docs/architecture/MONOREPO.md` (design) | Keep both roles | Move ops under engineering |
| `02_validate_docs.md` stub vs `02_validate_documentation.md` | Full name | Delete stub |
| `ARCHITECTURE_REVIEW` / `READINESS` / `PROJECT_*` reports | Ephemeral | Archive under `docs/meta/` |
| Cursor rules vs docs | Docs narrative SSOT | Rules stay as digests; update paths after move |

### Missing indexes / cross-refs

- No master docs entry (`PROJECT_INDEX.md` / `docs/README.md`)
- No `docs/brand/README.md` or `docs/product/README.md`
- `docs/backlog/README.md` still lists stub `FEATURES.md`
- `docs/prompts/README.md` omits phase `10`
- Many docs link to root paths (`../../DEFINITION_OF_DONE.md`, etc.) — all break if moved without rewrite

### Naming / formatting

- Two files named `USER_STORIES.md` with different ID schemes (`E*` vs `PE*`)
- Mixed “roadmap” meaning: product horizons vs PE* implementation index
- Report files at root look like living SSOT

---

## Phase 2 — Proposed structure (reuse-first)

Adapt the suggested enterprise layout to **existing content**. Do **not** create empty `integrations/*`, `getting-started/*`, or `assets` placeholders.

```text
/
├── README.md                 # landing only
├── CONTRIBUTING.md           # NEW — seeded from Engineering Constitution (no new product rules)
├── CODE_OF_CONDUCT.md        # NEW — standard OSS conduct (or defer if you prefer later)
├── SECURITY.md               # NEW — local-first + vulnerability reporting (from existing privacy doctrine)
├── SUPPORT.md                # NEW — thin pointer to docs + discussions/issues
├── LICENSE                   # NEW only if you choose a license (otherwise leave “TBD” in README)
├── CHANGELOG.md              # NEW thin pointer to .changeset/ (or generate later)
├── package.json, turbo.json, pnpm-workspace.yaml, …
├── app/, packages/, plugins/, examples/, assets/, scripts?/
├── docs/
│   ├── PROJECT_INDEX.md      # NEW — master navigation (Phase 6)
│   ├── README.md             # NEW — short alias → PROJECT_INDEX.md
│   ├── vision/                 # optional alias folder — PREFER keep brand/ + product/
│   ├── brand/                  # KEEP (philosophy, guidelines, copy)
│   ├── product/                # KEEP (vision, platform spec, features, …)
│   ├── design-system/          # KEEP
│   ├── architecture/           # KEEP + absorb ARCHITECTURE_PRINCIPLES
│   ├── adr/                    # KEEP (ARCHITECTURE_DECISIONS = this folder)
│   ├── engineering/            # NEW — process/DoD/workflow/monorepo ops
│   ├── backlog/                # KEEP delivery E* + absorb implementation order/roadmap
│   ├── roadmap/                # KEEP PE* platform stories (rename file)
│   ├── prompts/                # KEEP
│   └── meta/                   # NEW — archived reports / GitHub sync snapshots
└── .github/                    # later: templates (out of scope unless approved)
```

**Rejected for this pass (would invent empty docs):**  
`docs/integrations/AI_PROVIDERS.md`, `EMAIL.md`, `BROWSER_AUTOMATION.md`, `docs/roadmap/RELEASE_PLAN.md`, `docs/development/CODING_STANDARDS.md` as new shells — content already lives in architecture / ADRs / constitution / FEATURES Experimental notes. Link from `PROJECT_INDEX.md` instead.

---

## Files to move

| Current | New location |
|---------|--------------|
| `ARCHITECTURE_PRINCIPLES.md` | `docs/architecture/ARCHITECTURE_PRINCIPLES.md` |
| `ENGINEERING_CONSTITUTION.md` | `docs/engineering/ENGINEERING_CONSTITUTION.md` |
| `DEFINITION_OF_DONE.md` | `docs/engineering/DEFINITION_OF_DONE.md` |
| `AI_DEVELOPMENT_WORKFLOW.md` | `docs/engineering/AI_DEVELOPMENT_WORKFLOW.md` |
| `MONOREPO.md` | `docs/engineering/MONOREPO.md` |
| `IMPLEMENTATION_ROADMAP.md` | `docs/backlog/IMPLEMENTATION_ROADMAP.md` |
| `IMPLEMENTATION_ORDER.md` | `docs/backlog/IMPLEMENTATION_ORDER.md` |
| `ARCHITECTURE_REVIEW.md` | `docs/meta/ARCHITECTURE_REVIEW.md` |
| `ARCHITECTURE_READINESS_REPORT.md` | `docs/meta/ARCHITECTURE_READINESS_REPORT.md` |
| `PROJECT_CONFIGURATION_REPORT.md` | `docs/meta/github/PROJECT_CONFIGURATION_REPORT.md` |
| `REPOSITORY_INSPECTION_REPORT.md` | `docs/meta/github/REPOSITORY_INSPECTION_REPORT.md` |
| `PROJECT_GAP_ANALYSIS.md` | `docs/meta/github/PROJECT_GAP_ANALYSIS.md` |
| `PROJECT_BACKLOG_SUMMARY.md` | `docs/meta/github/PROJECT_BACKLOG_SUMMARY.md` |

---

## Files to rename

| Current | New name | Why |
|---------|----------|-----|
| `docs/roadmap/USER_STORIES.md` | `docs/roadmap/PLATFORM_STORIES.md` | Distinguishes `PE*` platform stories from backlog `USER_STORIES.md` (`E*`) |

Update all references (README, IMPLEMENTATION_*, prompts, backlog import, Cursor `vertical-slices` rule if it points at the wrong SSOT).

---

## Files to merge / delete

| Action | Detail |
|--------|--------|
| **Merge** | Root `MANIFESTO.md` → `docs/brand/PRODUCT_PHILOSOPHY.md` (append any unique manifesto sections; keep one philosophy SSOT). Drop root `MANIFESTO.md`. |
| **Delete** | Root `SYSTEM_ARCHITECTURE.md` (redundant index) |
| **Delete** | `docs/brand/PRODUCT_VISION.md` (stub) |
| **Delete** | `docs/product/VISION.md` (empty) |
| **Delete** | `docs/backlog/FEATURES.md` (stub) |
| **Delete** | `docs/prompts/02_validate_docs.md` (stub) |

No content loss: stubs already point at winners; manifesto text folds into philosophy.

---

## Files to leave untouched (content)

| Path | Reason |
|------|--------|
| `docs/architecture/*` (except add principles) | Living architecture SSOT |
| `docs/adr/*` | Decision log |
| `docs/product/*` (except delete empty VISION) | Product SSOT |
| `docs/brand/*` (except merge/delete stubs) | Brand SSOT |
| `docs/design-system/*` | Production DS |
| `docs/backlog/*` (except absorb moved files, fix stub) | Delivery backlog |
| `docs/prompts/*` (except delete validate stub; index `10`) | Docs pipeline |
| `app/**/README.md`, `packages/**/README.md`, `plugins/**`, `examples/**` | Package-local |
| `.cursor/rules/*` | Update **paths only** after moves (not rewrite product rules) |
| Tooling configs at root | Belong at root |

---

## New files (allowed — not product placeholders)

| File | Source of truth for content |
|------|-----------------------------|
| `docs/PROJECT_INDEX.md` | Navigation only — links to existing docs |
| `docs/README.md` | Points to `PROJECT_INDEX.md` |
| `docs/engineering/README.md` | Thin index |
| `docs/meta/README.md` | Explains archive vs living SSOT |
| `docs/brand/README.md` | Thin index (optional but useful) |
| `docs/product/README.md` | Thin index (optional) |
| `CONTRIBUTING.md` | Seeded from Engineering Constitution + DoD + MONOREPO + TERMINOLOGY — **no new rules** |
| `SECURITY.md` | Seeded from privacy/non-goals + “report via GitHub Security Advisories / issues” |
| `SUPPORT.md` | Pointers to docs + issues |
| `CODE_OF_CONDUCT.md` | Standard Contributor Covenant (or defer) |
| `LICENSE` | **Only if you name a license** in approval (e.g. MIT/Apache-2.0). Otherwise skip and keep README “TBD”. |
| `CHANGELOG.md` | Thin: “See `.changeset/`” |

---

## Link update scope (after approval)

1. Root `README.md` — all tables point into `/docs`.  
2. Every moved file’s relative links.  
3. Repo-wide grep for old basenames (`DEFINITION_OF_DONE.md`, `IMPLEMENTATION_ROADMAP.md`, `MANIFESTO.md`, `USER_STORIES.md` roadmap path, …).  
4. `.cursor/rules` paths that reference moved files.  
5. `docs/prompts/*` phase references.  
6. Add “Back to [Project Index](../PROJECT_INDEX.md)” footers on major indexes (not every leaf copy file — avoid noise).

---

## Root after cleanup (target)

```text
README.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md   # if approved
SECURITY.md
SUPPORT.md
LICENSE              # if license chosen
CHANGELOG.md         # thin
package.json / turbo.json / pnpm-workspace.yaml / configs
app/ packages/ plugins/ examples/ assets/ docs/ .github/ .cursor/ …
```

Root communicates: **what it is · how to start · how to contribute**. Deep docs live under `docs/PROJECT_INDEX.md`.

---

## Reading order (for PROJECT_INDEX.md)

**Humans**

1. `README.md` → `docs/PROJECT_INDEX.md`  
2. Brand philosophy + Product vision + Non-goals  
3. Platform specification + Terminology  
4. Architecture overview → System architecture → Principles → ADRs  
5. Backlog README → Implementation order → Vertical slices  
6. Engineering constitution → Definition of Done → CONTRIBUTING  

**AI assistants**

1. `docs/PROJECT_INDEX.md`  
2. `docs/product/TERMINOLOGY.md` + `NON_GOALS.md`  
3. `docs/engineering/ENGINEERING_CONSTITUTION.md` + `DEFINITION_OF_DONE.md`  
4. `docs/architecture/OVERVIEW.md` + `PACKAGE_BOUNDARIES.md`  
5. Active story SSOT: `docs/roadmap/PLATFORM_STORIES.md` (PE*) + `docs/backlog/USER_STORIES.md` (E*)  
6. `docs/backlog/IMPLEMENTATION_ORDER.md`  
7. `.cursor/rules/*` as enforcement digests  

---

## Out of scope this pass

- Writing production code / implementing features  
- Creating GitHub issue templates (unless you add to approval)  
- Inventing integration docs for Experimental modules  
- Changing product vision or FEATURES status  
- Full prose rewrite of every leaf brand copy file (standardize headers/footers + links only)

---

## Approval options

Reply with one of:

1. **Approve as planned** — execute Phases 3–8; skip `LICENSE` until you name one; include CoC + SECURITY + SUPPORT + CONTRIBUTING + CHANGELOG pointer.  
2. **Approve + license = \<MIT | Apache-2.0 | other\>** — also add `LICENSE`.  
3. **Approve with changes** — e.g. keep Manifesto at root as 10-line pointer; don’t rename `PLATFORM_STORIES`; don’t add CoC yet.  
4. **Reject / revise plan** — specify what to change.

After approval: perform moves with `git mv`, fix links, add `PROJECT_INDEX.md`, validate, write `DOCUMENTATION_STRUCTURE_REPORT.md`, and commit.
