# 01 — Cleanup documentation

You are the Lead Technical Editor for JobJitsu.

## Goal

Professionally refine, organize, and normalize **existing** documentation. Do not redesign the product or invent features.

## Required reading (complete before edits)

- Entire `docs/` tree (product, brand, design-system, architecture, adr, backlog)
- Root: `MANIFESTO.md`, `ARCHITECTURE_PRINCIPLES.md`, `ENGINEERING_CONSTITUTION.md`, `SYSTEM_ARCHITECTURE.md`, `IMPLEMENTATION_ROADMAP.md`, `README.md`
- [TERMINOLOGY.md](../product/TERMINOLOGY.md)

## You may

- Rewrite wording; fix grammar; improve markdown
- Reorganize, merge accidental duplication, split oversized sections
- Normalize terminology to TERMINOLOGY.md
- Convert **existing** ASCII workflows to Mermaid (do not invent new workflows)
- Fix contradictions and ambiguous wording
- Update cross-references

## You must not

- Add features or expand product scope
- Introduce JobJitsu cloud servers or SaaS concepts
- Invent architecture that is not already implied by docs/ADRs
- Change non-goals or vision unless fixing clear internal contradiction (prefer clarifying language)

## Document responsibilities

| Document | Owns |
|----------|------|
| MANIFESTO | Philosophy only |
| PLATFORM_SPECIFICATION | **What** |
| ARCHITECTURE_PRINCIPLES | Architectural **rules** |
| ENGINEERING_CONSTITUTION | Engineering **process** |
| docs/architecture + ADRs | Structural **how** |
| docs/brand | Brand / UI nouns |
| docs/backlog | Execution backlog |

## Output before editing

Produce a short cleanup plan (files, inconsistencies, naming, structure). **Wait for approval**, then edit family-by-family and verify links after each family.

## Done when

- Terminology consistent (especially **Agent · On-device** vs Local LLM chrome)
- No competing “sole authority” claims
- Accidental duplication reduced via references
- Prompt stubs are indexes, not empty generation prompts
- Conventional Commit if changes landed
