# JobJitsu Features & Modules

> Module map for the AI Career Operating System. Describes **what exists in the product vision**, not how to build it.

Parent: [PRODUCT_VISION.md](./PRODUCT_VISION.md) · Sequence: [ROADMAP.md](./ROADMAP.md) · Guardrails: [NON_GOALS.md](./NON_GOALS.md) · [PRINCIPLES.md](./PRINCIPLES.md) · [TERMINOLOGY.md](./TERMINOLOGY.md)

Brand note: metaphor belongs in microcopy; navigation uses plain nouns (Applications, Follow-ups, Agent) — see [../brand/DESIGN_SYSTEM.md](../brand/DESIGN_SYSTEM.md).

---

## Feature status

| Status | Meaning | Contributor expectation |
|--------|---------|-------------------------|
| **Core** | Spine of the Career OS / v1 path | Prefer PRs here; regressions block release |
| **Experimental** | Specified or in-tree; API/UX may change; may be flagged | Welcome; no stable-API promise |
| **Future** | Vision-accepted; not near-term implementation | Spec OK; implementation deferred unless status is promoted |

**Horizons** ([ROADMAP.md](./ROADMAP.md)) answer *when*. **Status** answers *commitment*. Promote Future → Experimental → Core only after the [module admission test](#module-admission-test).

Functional detail: [PLATFORM_SPECIFICATION.md](./PLATFORM_SPECIFICATION.md).

---

## Core modules

The **spine** of the Career OS. One product, one voice, one privacy model. Together they fulfill the Leverage Belt pipeline: **search → curate → apply → send → follow up**.

| Module | Purpose | Brand posture | Status |
|--------|---------|---------------|--------|
| **Identity & Resume** | On-device profile and Resume Library for tailoring | Stored locally; never “synced to JobJitsu cloud” | Core |
| **Preferences** | Rules for fit, tone, constraints, approval gates | “Your rules, your signal” | Core |
| **Local Intelligence** | AI Provider + Context Builder for roles and drafts | Status chrome: **Agent · On-device** | Core |
| **Agent** | Prep work against preferences; Workflow / Task Queue | Serves; does not own send. Idle: belt tied | Core |
| **Discovery & Curation** | Find and filter roles via Job Providers | Precision first, volume second | Core |
| **Applications** | Draft, tailor, version, track each throw | Craft unit of the OS | Core |
| **Queue & Review** | Holding area before anything leaves | Approval is a first-class ritual | Core |
| **Send** | Explicit outbound apply / submit | User-initiated; quiet success | Core |
| **Follow-ups** | Polite nudges on a calm calendar | Amber caution, never shame | Core |
| **Timeline & Memory** | Local history of actions and outcomes | Learning without leaderboard energy | Core |
| **Privacy & Trust Chrome** | Badge, logs, “what left / what stayed” | Architecture made visible | Core |
| **Knowledge Base** | Grounded career knowledge for Context Builder | Distinct from Timeline | Core |
| **AI Validation** | Post-generate gates (formatting, ATS, skills) | Never trust first model output alone | Core |

### Core module intents (vision-level)

**Identity & Resume** — Materials live in the dojo. Tailoring reads from the Resume Library; the user remains author of the final voice.

**Preferences** — Fit rules and approval gates are first-class. The OS does not invent urgency to override them.

**Local Intelligence** — On-device AI Provider by default. Status chrome shows **Agent · On-device**; “Local LLM” belongs in advanced settings and technical docs.

**Agent** — Prepares applications and reminders under preferences. Never owns the send button.

**Discovery & Curation** — Surface roles worth a throw via Job Providers; filter toward fit, not feed addiction.

**Applications** — Each application is a unit of craft: draft, tailor, track (see Application Pipeline in the platform specification).

**Queue & Review** — Nothing high-stakes leaves without review when the user requires it. Distinct from the AI Task Queue.

**Send** — The moment data may leave the machine — explicit, confirmed, calm.

**Follow-ups** — Gentle nudges timed to the hunt, not chase-the-recruiter aggression.

**Timeline & Memory** — Continuity of craft: what was sent, nudged, learned.

**Privacy & Trust Chrome** — Always-on assurance that the OS is still local and inspectable.

**Knowledge Base** — Grounded retrieval for Context Builder; reduces hallucination.

**AI Validation** — Structured checks after generation; craft over raw model output.

---

## Experimental

In-tree or specified capabilities that may change. Label clearly in UI and docs.

| Module / capability | Why experimental | Guardrail |
|---------------------|------------------|-----------|
| **Browser automation (apply assist)** | High variance across sites; approval UX still evolving | Never bypass Queue → Send; user approval required by default |
| **User-configured remote AI Provider** | Opt-in cloud model endpoint | Honest chrome — never labeled Agent · On-device / local |
| **Trusted Automation** | Reduced per-action approval when user enables | Default off; irreversible egress still auditable on Timeline |
| **AI Playground** | Prompt/provider experimentation | Must not silently affect production Workflows |

---

## Future modules

Candidates for Horizons 2–4. Each must pass [PRINCIPLES.md](./PRINCIPLES.md) and [NON_GOALS.md](./NON_GOALS.md) before promotion.

| Module | Why it belongs | Guardrail | Status |
|--------|----------------|-----------|--------|
| **Outcomes & reflection** | Turn applications into craft feedback | No guilt for quiet weeks | Future |
| **Interview readiness** | Extend technique past the send | Practice aid — not “guaranteed offer” theater | Future |
| **Narrative studio** | Keep story consistent across resume, letters, talks | On-device drafts; user owns final voice | Future |
| **Network nudges** | Gentle relationship follow-through | Consent-heavy; never spam-your-contacts | Future |
| **Role-fit compass** | Reflect skills/values against roles | Guidance, not destiny assignment | Future |
| **Offer & decision journal** | Compare offers calmly | No high-pressure countdown UX | Future |
| **Skills & learning map** | Link gaps to intentional growth | Optional; not a course marketplace | Future |
| **Extensible agent skills (Plugins)** | Open-source community techniques | Inspectable; user-enabled only | Future |
| **Host Extensions ecosystem** | Discovery/send/UI contributions | Capability-gated | Future |
| **Multi-profile / multi-path** | Career pivots without account farms | Still local-first | Future |
| **Export & portability** | Leave with your data anytime | Reinforces sovereignty | Future |

Future modules arrive as **calm rooms in the same dojo**, not as a suite of shouty micro-products.

---

## Module admission test

A module joins Core, Experimental, or Future only if:

1. It keeps data on-device by default (or redesigns until it does).
2. It increases leverage, not only volume.
3. The user retains control of outbound actions.
4. It reduces anxiety rather than manufacturing it.
5. It deepens the Career OS rather than a disconnected side quest.
6. It does not violate [NON_GOALS.md](./NON_GOALS.md).
