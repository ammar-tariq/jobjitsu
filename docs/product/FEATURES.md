# JobJitsu Features & Modules

> Module map for the AI Career Operating System. Describes **what exists in the product vision**, not how to build it.

Parent: [PRODUCT_VISION.md](./PRODUCT_VISION.md) · Sequence: [ROADMAP.md](./ROADMAP.md) · Guardrails: [NON_GOALS.md](./NON_GOALS.md) · [PRINCIPLES.md](./PRINCIPLES.md)

Brand note: metaphor belongs in microcopy; navigation uses plain nouns (Applications, Follow-ups, Agent) — see [../brand/DESIGN_SYSTEM.md](../brand/DESIGN_SYSTEM.md).

---

## Core modules

The **spine** of the Career OS. One product, one voice, one privacy model. Together they fulfill the Leverage Belt pipeline: **search → curate → apply → send → follow up**.

| Module | Purpose | Brand posture |
|--------|---------|---------------|
| **Identity & Resume** | On-device profile and résumé as source of truth for tailoring | Stored locally; never implied to be “synced to JobJitsu cloud” |
| **Preferences** | Rules for fit, tone, constraints, approval gates | “Your rules, your signal” |
| **Local Intelligence** | Local LLM + on-device context for understanding roles and drafting | Status always visible (“Local LLM”); warm-up copy stays honest |
| **Agent** | Executes prep work against preferences; pauses on command | Serves; does not own. Idle: belt tied, waiting |
| **Discovery & Curation** | Find and filter roles toward fit | Precision first, volume second |
| **Applications** | Draft, tailor, version, and track each throw | Craft unit of the OS |
| **Queue & Review** | Holding area before anything leaves the machine | Approval is a first-class ritual |
| **Send** | Explicit outbound apply / submit | User-initiated; success is a quiet nod |
| **Follow-ups** | Polite nudges on a calm calendar | Amber caution, never shame |
| **Timeline & Memory** | Local history of actions and outcomes | Learning without leaderboard energy |
| **Privacy & Trust Chrome** | Badge, logs, clear “what left / what stayed” | Architecture made visible |

### Core module intents (vision-level)

**Identity & Resume** — The seeker’s materials live in the dojo. Tailoring reads from here; the user remains author of the final voice.

**Preferences** — Fit rules and approval gates are first-class. The OS does not invent urgency to override them.

**Local Intelligence** — On-device model power without cloud default. Privacy badge is part of the experience.

**Agent** — Prepares applications and reminders under preferences. Never owns the send button.

**Discovery & Curation** — Surface roles worth a throw; filter toward fit, not feed addiction.

**Applications** — Each application is a unit of craft: draft, tailor, track.

**Queue & Review** — Nothing high-stakes leaves without review when the user requires it.

**Send** — The moment data may leave the machine — explicit, confirmed, calm.

**Follow-ups** — Gentle nudges timed to the hunt, not chase-the-recruiter aggression.

**Timeline & Memory** — Continuity of craft: what was sent, nudged, learned.

**Privacy & Trust Chrome** — Always-on assurance that the OS is still local and inspectable.

---

## Future modules

Candidates for Horizons 2–4. Each must pass [PRINCIPLES.md](./PRINCIPLES.md) and [NON_GOALS.md](./NON_GOALS.md) before joining the spine.

| Future module | Why it belongs | Guardrail |
|---------------|----------------|-----------|
| **Outcomes & reflection** | Turn applications into craft feedback | No guilt for quiet weeks |
| **Interview readiness** | Extend technique past the send | Practice aid — not “guaranteed offer” theater |
| **Narrative studio** | Keep story consistent across resume, letters, talks | On-device drafts; user owns final voice |
| **Network nudges** | Gentle relationship follow-through | Consent-heavy; never spam-your-contacts |
| **Role-fit compass** | Reflect skills/values against roles | Guidance, not destiny assignment |
| **Offer & decision journal** | Compare offers calmly | No high-pressure countdown UX |
| **Skills & learning map** | Link gaps to intentional growth | Optional; not a course marketplace |
| **Extensible agent skills** | Open-source community techniques | Inspectable; user-enabled only |
| **Multi-profile / multi-path** | Career pivots without account farms | Still local-first |
| **Export & portability** | Leave with your data anytime | Reinforces sovereignty |

Future modules arrive as **calm rooms in the same dojo**, not as a suite of shouty micro-products.

---

## Module admission test

A module joins core or ships as future only if:

1. It keeps data on-device by default (or redesigns until it does).
2. It increases leverage, not only volume.
3. The user retains control of outbound actions.
4. It reduces anxiety rather than manufacturing it.
5. It deepens the Career OS rather than a disconnected side quest.
6. It does not violate [NON_GOALS.md](./NON_GOALS.md).
