# Architecture Review

**Date:** 2026-07-22 (regenerated after docs-only fix pass)  
**Subject:** [docs/architecture/SYSTEM_ARCHITECTURE.md](docs/architecture/SYSTEM_ARCHITECTURE.md) + sibling architecture docs  
**Code:** not modified  
**Prior score:** 81 / 100

## Score: 96 / 100

**Threshold met (≥ 95).** Architecture documentation is review-ready for H1 Core implementation.

### Score breakdown

| Lens | Score | Notes |
|------|------:|-------|
| Coupling / fences | 96 | Normative fence checklist + DAG |
| Complexity | 94 | Extension surface Horizon-labeled; principles aligned |
| Circular dependencies | 95 | Domain DAG + forbidden peers |
| Interfaces | 95 | IPC policy + TA path + SendChannel sketch |
| Packages | 94 | Ownership stubs for mail/notifications/browser |
| Events | 95 | Failure matrix + TA exception documented |
| Scalability (local) | 94 | Concurrency=1; retention/scale notes |
| Testability | 96 | Fence checklist linked from testing strategy |

---

## Strong (unchanged)

- Agent ≠ Send; local-first AI; deny-by-default IPC
- Event catalog durability + PII rules
- Plugin vs Extension split
- C4 + runtime sequences
- Experimental labeling for Workflow / Validation / browser automation

---

## Fixes applied since 81

| Finding | Resolution |
|---------|------------|
| Domain DAG | [PACKAGE_BOUNDARIES.md](docs/architecture/PACKAGE_BOUNDARIES.md) DAG + forbidden peers |
| IPC drift | Deny-by-default policy + expanded H1 allowlist |
| Trusted Automation | Exception path + ACs in EVENT_SYSTEM |
| Egress/Timeline/Workflow models | DATA_MODELS entities |
| Task bus ambiguity | Query snapshot + coarse Ai/Workflow events |
| Principles drift | Package nouns; “Extension Points When Variation Is Real” |
| OVERVIEW diagram | `send` owns outbound boundary; host loads plugins |
| Orphan ownership | Mail / notifications / browser stubs |
| KnowledgeReader | AI_ARCHITECTURE port |
| Preferences SSOT | config store + preferences façade |
| Failure matrix | EVENT_SYSTEM |
| Fence checklist | PACKAGE_BOUNDARIES + TESTING_STRATEGY #7 |
| Concurrency / scale | WORKFLOW_ENGINE + SCHEDULER + EVENT_SYSTEM notes |
| SendChannel | Conceptual contract in PACKAGE_BOUNDARIES |

---

## Residual (acceptable below 100)

| Item | Notes |
|------|--------|
| Sync expanded event names into `packages/events` TypeScript | Docs SSOT; code follow-up (out of scope for this review) |
| Full H3–H4 extension surface | Intentionally deferred |
| Trusted Automation backlog stories | Experimental until epic admitted |

---

## Verdict

**Approve for implementation** of H1 Core against architecture docs. Enforce fences with tests. Do not treat Experimental Workflow/Validation as Core regressions until backlog admits them.

**No further architecture-doc churn required for the 95 gate** unless residuals are explicitly scheduled.
