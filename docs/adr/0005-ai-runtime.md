# ADR 0005: Local-First AI Runtime

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [AI architecture](../architecture/AI_ARCHITECTURE.md) · [Product principles](../product/PRINCIPLES.md)

---

## Context

Local Intelligence is a core module: tailor, draft, embed, assist. Defaulting to a vendor cloud LLM would make privacy a toggle and contradict **Agent · On-device** trust chrome. Users still need a swappable runtime (different local runners/models).

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **Local provider interface + adapters** | Honest badge, user model path | Hardware variance; UX for setup |
| Cloud-only LLM | Easy onboarding | Privacy non-goal violation |
| Hard-bind one runner (e.g. single binary) | Simpler QA | Fragile; blocks user choice |
| Silent cloud fallback | “It just works” | Lies about Local; forbidden |

---

## Decision

**Implement a provider-based AI runtime** in `packages/ai` with **local adapters as the primary path**.

- Interface: `health`, `complete`, optional `embed`.
- Trust chrome: status shows **Agent · On-device** when the active provider is local; “Local LLM” only in advanced settings / technical contexts.
- Context Builder (alias: context assembler) builds **minimal** local context (identity/role/draft excerpts + Knowledge Base).
- Remote providers allowed only as **explicit user configuration**, labeled honestly in UI.
- AI/tools must not perform egress; outputs flow to Applications/Queue.
- Lazy-load models; honor Agent pause; fail with plain recovery copy.

---

## Consequences

### Positive
- Privacy-as-architecture made visible and enforceable.
- Honest AI claims (draft/tailor/remind — not guaranteed offers).
- Testable with fake local providers ([ADR 0007](./0007-testing.md)).

### Negative / tradeoffs
- Onboarding includes model path / runtime setup friction.
- Quality varies by user hardware and model choice.

### Follow-ups
- Document supported local runners as adapters are added (separate ADRs per runner if needed).
- Prompt-injection stance: job descriptions untrusted; tools capability-gated.
