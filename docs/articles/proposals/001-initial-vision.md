# Proposal 001 — Initial vision article

**Status:** Approved · Drafting  
**Series:** [SERIES_PLAN.md](../SERIES_PLAN.md) Article 01  
**GitHub:** [#56 Write Article: Initial Vision](https://github.com/ammar-tariq/jobjitsu/issues/56) (`article-approved` · `article-draft`)  
**Research:** [../research/JOBJITSU_MEDIUM_ARTICLE_BLUEPRINT.md](../research/JOBJITSU_MEDIUM_ARTICLE_BLUEPRINT.md)  
**Draft:** [../drafts/001-initial-vision.md](../drafts/001-initial-vision.md)

**Approved:** 2026-07-23 (human)

---

## Proposed title

**Selected:** The Gentle Art of Landing the Job: Why We’re Building a Local-First Career OS

Alternates retained for reference:

1. Your Résumé Isn’t Training Data: An Open-Source Case for On-Device Job Hunt AI  
2. Agent Prepares, You Send: Privacy Architecture for the AI Job Market  

---

## Reason for article

Establish JobJitsu’s public narrative: why it exists, what it refuses to become, and how local-first Agent architecture differs from cloud career SaaS and spray-and-pray autopilot — while the repo is still in **early foundation**.

---

## Related milestone

- Documentation + architecture SSOT in place  
- Monorepo / docs site foundation  
- Medium article blueprint completed (`docs/articles/research/`)

Not tied to a shipping product wave completion yet — this is the **series opener**.

---

## Technical topics

- Vision and promise triad (on-device / on-target / on your terms)  
- Problem + accessibility (no named competitors)  
- Local AI primary path; remote opt-in honesty  
- Architecture overview (host, events, AiProvider, Queue, Send)  
- Agent system overview (Agent ≠ Send; roles ≠ separate bots)  
- Desktop vision (Tauri + React)  
- Open source + community invitation  

---

## Required documentation

- `MANIFESTO.md`  
- `docs/product/PRODUCT_VISION.md`  
- `docs/product/NON_GOALS.md`  
- `docs/product/FEATURES.md` (status honesty)  
- `docs/architecture/OVERVIEW.md`  
- `docs/architecture/AI_ARCHITECTURE.md`  
- `docs/architecture/PACKAGE_BOUNDARIES.md`  
- `docs/adr/0001-tauri.md`, `0005-ai-runtime.md`, `0009-send-boundary.md`  
- Blueprint: `docs/articles/research/JOBJITSU_MEDIUM_ARTICLE_BLUEPRINT.md`  

---

## Suggested diagrams

- System architecture (host / UI / local model)  
- Agent ≠ Send flow (prepare → queue → approve → send)  
- Docs-first development lifecycle  

---

## Labels / project

- Labels: `article-approved`, `article-draft` (remove `article-needed` when drafting)  
- Content Status: **Drafting**
