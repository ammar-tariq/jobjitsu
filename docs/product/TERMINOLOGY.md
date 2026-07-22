# Terminology

> Canonical names for JobJitsu docs and UI. Prefer these terms; avoid synonyms in the same role.

Parent: [PRODUCT_VISION.md](./PRODUCT_VISION.md) · Brand chrome: [../brand/BRANDING_FOR_DEVELOPMENT.md](../brand/BRANDING_FOR_DEVELOPMENT.md)

---

## Product and UI

| Canonical term | Meaning | Avoid in the same role |
|----------------|---------|-------------------------|
| **Agent** | Preparative career assistant (user-facing) | Bot, autopilot, chatbot (UI) |
| **Agent · On-device** | Status chrome for on-device intelligence | “Local LLM” in the status bar |
| **Queue** | Approval holding area before send | Inbox (unless Sprint-1 shell label is explicitly noted) |
| **Applications** | Draft / tailor / track units of craft | Pipeline (in navigation) |
| **Preferences** | User rules and approval gates | Settings (prefer Preferences in product IA; Settings OK as shell label for the same surface) |
| **Send** | Explicit outbound egress | Auto-apply as the default story |

## AI and knowledge

| Canonical term | Meaning | Avoid in the same role |
|----------------|---------|-------------------------|
| **AI Provider** | Adapter that runs `complete` / `embed` / health | Mixing “runtime,” “backend,” and “provider” without definition |
| **Model Manager** | Load, select, unload, and monitor models for providers | Undocumented “model catalog” as a separate product |
| **Local Intelligence** | Product module for on-device AI | Using “LLM module” as the module name |
| **Knowledge Base** | On-device career knowledge store | Conflating with Timeline |
| **Context Builder** | Assembles minimal prompt context before inference | Dumping full history into every prompt |
| **Resume Library** | Stored resume versions and variants | Ad-hoc “résumé folder” naming in specs |
| **Workflow** | Declarative multi-step agent run | Free-form chat as the control plane |
| **Task Queue** | AI/work-unit scheduler (Pending → … → Cancelled) | Confusing with review **Queue** |
| **AI Validation** | Post-generation checks (formatting, ATS, skills, …) | Trusting first model output |

## Discovery and integrations

| Canonical term | Meaning | Avoid in the same role |
|----------------|---------|-------------------------|
| **Job Provider** | Source of job listings (discovery adapter) | Unspecified “scraper” / “board” without the Job Provider role |
| **Application Pipeline** | Application lifecycle stages (discovered → … → archived) | Using “Pipeline” as a primary nav label |
| **Plugin** | Capability-gated **agent skill** | Calling host UI/adapters “plugins” |
| **Extension** | Host contribution point (discovery, send, UI, …) | Calling agent skills “extensions” |

## Privacy and egress

| Canonical term | Meaning | Notes |
|----------------|---------|--------|
| **Local LLM** | Technical name for an on-device language model | OK in advanced settings and architecture; **not** default status chrome |
| **Trusted Automation** | User-enabled reduced-approval mode (default off) | Never implied on by default |
| **Timeline** | Local audit / craft history | Distinct from Knowledge Base |

## Document responsibility (short)

| Document | Owns |
|----------|------|
| [MANIFESTO.md](../../MANIFESTO.md) | Philosophy only |
| [PLATFORM_SPECIFICATION.md](./PLATFORM_SPECIFICATION.md) | Functional **what** |
| [ARCHITECTURE_PRINCIPLES.md](../../ARCHITECTURE_PRINCIPLES.md) | Architectural **rules** |
| [ENGINEERING_CONSTITUTION.md](../../ENGINEERING_CONSTITUTION.md) | Engineering **process** |
| [../architecture/](../architecture/) | Structural **how** |
| [../backlog/](../backlog/) | Build order |
| [../brand/](../brand/) | Brand and UI nouns |
