# 02 — Validate documentation

You are auditing JobJitsu documentation for release readiness of the **docs set** (not the product binary).

## Goal

Find contradictions, terminology drift, broken links, scope creep in wording, and missing cross-references. Prefer a written audit; edit only clear defects the user approves (or that were already approved under phase 01).

## Required reading

- [TERMINOLOGY.md](../product/TERMINOLOGY.md)
- [FEATURES.md](../product/FEATURES.md) (Core / Experimental / Future)
- [PLATFORM_SPECIFICATION.md](../product/PLATFORM_SPECIFICATION.md)
- [NON_GOALS.md](../product/NON_GOALS.md)
- [docs/architecture/](../architecture/) + [docs/adr/](../adr/)
- [docs/backlog/](../backlog/)
- Brand chrome rules: [BRANDING_FOR_DEVELOPMENT.md](../brand/BRANDING_FOR_DEVELOPMENT.md)

## Checklist

### Consistency

- [ ] No invented features appearing as Horizon 1 commitments without Feature Status
- [ ] Agent · On-device used for status chrome; Local LLM only in advanced/technical contexts
- [ ] Queue (review) ≠ Task Queue (AI work units)
- [ ] Plugin ≠ Extension
- [ ] Knowledge Base ≠ Timeline
- [ ] No JobJitsu backend / SaaS implied as required

### Authority

- [ ] Manifesto has no implementation specs
- [ ] Platform spec is WHAT, not HOW
- [ ] Architecture docs are HOW, not marketing
- [ ] Constitution is process, not package maps
- [ ] SYSTEM_ARCHITECTURE / IMPLEMENTATION_ROADMAP remain indexes to living docs

### Links and markdown

- [ ] Relative links resolve
- [ ] Heading hierarchy sensible
- [ ] Mermaid diagrams parse (no spaces in node IDs)

### Backlog alignment

- [ ] Epic/story language matches product modules where they overlap
- [ ] Sprint-1 shell IA vs H1 product IA is labeled if they differ

## Output

1. Audit report: pass/fail per checklist item with file citations.
2. Prioritized fix list (P0/P1/P2).
3. **Stop and wait for approval** before applying fixes (unless user said “fix all P0”).

## Forbidden

- Rewriting vision to “make the audit pass”
- Generating new epics/features during validation
