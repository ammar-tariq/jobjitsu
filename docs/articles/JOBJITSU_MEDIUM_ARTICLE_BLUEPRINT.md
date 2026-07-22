# JobJitsu Medium Article Blueprint

> **Purpose:** Technical and narrative foundation for a Medium article.  
> **Not** the final article — hand this to a writer (e.g. Claude) to produce the polished piece.  
> **Generated from:** `docs/prompts/MEDIUM_ARTICLE_PREPARATION.md` + repository SSOT.  
> **Constraint:** Do not invent features. Do not exaggerate shipping status. Prefer documented terms.

**Primary sources:** `MANIFESTO.md`, `docs/product/*`, `docs/architecture/*`, `docs/adr/*`, `ARCHITECTURE_PRINCIPLES.md`, `ENGINEERING_CONSTITUTION.md`, `IMPLEMENTATION_ROADMAP.md`, `docs/brand/BRAND_GUIDELINES.md`, `docs/backlog/USER_STORIES.md`, `docs/roadmap/USER_STORIES.md`, `README.md`.

**Honest status (as of blueprint date):** Early foundation — brand, product vision, architecture, monorepo scaffold, and docs site exist. Domain business logic for the full Career OS is **not shipped yet**. License intended open-source; `LICENSE` file still TBD.

---

## Article thesis

**Theme to explore:** Building an open-source, privacy-first AI assistant for the modern job search in a world where AI has changed how people get hired.

**Core thesis (one paragraph the writer must protect):**

Job hunting is increasingly mediated by automation — on both sides of the table — while the best “AI career help” is often locked behind subscriptions and cloud uploads of the most intimate professional data a person has: their résumé, preferences, and correspondence. JobJitsu exists as an **AI Career Operating System**: a local-first, open-source desktop companion where an on-device **Agent** prepares drafts, queues, and reminders, and the **human owns Send**. It is not ChatGPT-for-jobs, not a job board, and not an autopilot that sprays applications. Privacy is architecture, not a premium toggle. The project is carefully specified and scaffolding; the article should invite builders and seekers into that philosophy without claiming a finished product.

**Promise triad (use freely):**

- **On-device** — Local Agent · On-device intelligence by default  
- **On-target** — Fit and technique over spray-and-pray  
- **On your terms** — Preferences, pause, and approval before send  

**Tagline:** “The gentle art of landing the job.”

---

## Important corrections for the final writer

The preparation prompt sketched some structures that are **not** product SSOT. Map them correctly:

| Prompt sketch | Documented reality |
|---------------|-------------------|
| Planner / Worker / Verifier agents as three products | **Workflow Planner & Engine** + specialized **role steps** inside `@jobjitsu/agent` + **AI Validation** (Experimental depth). One Agent chrome surface. |
| “Local LLM” as primary UI language | User chrome: **Agent** / **Agent · On-device**. “Local LLM” / model jargon = advanced settings & engineering docs. |
| Fully autonomous job landing | **Non-goal.** Agent prepares; user owns Send. |
| Shipping Career OS | **Early foundation.** Specify vision; do not imply full pipeline is live. |
| JobJitsu cloud holding résumés | **Forbidden by design.** No JobJitsu SaaS account for career data. |

---

# Research Section 1 — The Problem

## 1.1 The modern job market

**Talking points (grounded; do not claim AI is the only cause):**

- Getting interviews has gotten harder for many seekers: volume of applicants, remote competition, and opaque screening.
- Online applications are commoditized — one click for thousands of candidates → noise for employers and despair for applicants.
- Automated screening (ATS, keyword filters, increasingly AI-assisted triage) sits between humans.
- Hiring workflows change faster than candidates’ tooling: portals, assessments, multi-round loops.
- Candidates need **leverage**, not more panic: better fit, clearer narrative, calmer follow-through.

**Manifesto framing (use as tone, not as market research citation):** Job searching is exhausting; AI is reshaping hiring; many tools extract more than they give; privacy is an afterthought in career SaaS.

**Writer rule:** Frame AI as **one of many** forces — alongside remote work, economic cycles, credential inflation, and process complexity. Avoid “AI ruined hiring” monocausality.

## 1.2 The accessibility problem

**Talking points:**

- High-quality AI career assistance is often **subscription-gated**.
- Categories of tools (discuss generically — **do not attack named companies**):
  - AI résumé optimization
  - Interview preparation platforms
  - Career coaching assistants
  - Job application automation tools
- Seekers who are unemployed or mid-transition may least afford recurring fees — while needing the help most.
- Uploading a résumé to yet another cloud is an intimacy tax: career history as training data / retention risk.

**JobJitsu angle:** Open-source + local-first is an accessibility and dignity play: capability without mandatory subscription hostage or default cloud custody of career data.

---

# Research Section 2 — Why JobJitsu Exists

**Mission (verbatim intent):** Build the world’s best open-source, local-first AI Career Operating System.

**Why an open-source alternative matters:**

| Value | Meaning |
|-------|---------|
| Local-first AI | Primary intelligence path on the user’s machine |
| Privacy ownership | “Your career belongs to you.” No JobJitsu cloud backend holding career data |
| No mandatory subscription | Open-source intent; no locking data behind paywalls (non-goal) |
| User-controlled providers | Local adapters primary; remote APIs only with explicit user config |
| Community development | Documentation as valuable as code; inspectable behavior |

**Key quote to protect:**

> The goal is not to replace human decision making. The goal is to amplify the user's ability.

**Aligned manifesto lines:**

- “The AI suggests. / The human decides. / The user remains in control.”
- “AI is a Tool, Not the Product.”
- “Privacy is not a premium feature. / It is the default.”
- “We will never treat personal career data as a product.”

**What JobJitsu is *not* (from `NON_GOALS.md` — use as guardrails):**

Not a job board; not cloud SaaS for résumés; not spray-and-pray autopilot; not “we land the job for you”; not streak/guilt growth loops; not employer-side surveillance; not “crush ATS” combat framing; not guaranteed interviews/offers.

---

# Research Section 3 — Product Vision

## 3.1 What JobJitsu is

- **Desktop-native** Career OS (Tauri + React; dark mode first).
- **Cross-platform intent** (desktop packaging for major OSes — downloads are a future website enhancement once builds exist).
- **Local intelligence primary**; optional remote AI providers via **user API keys** when configured; models user-selectable; status chrome must stay honest (**Agent · On-device** only when local).
- One calm **Agent** surface: prepare, draft, queue, remind — never silently own Send.

## 3.2 Canonical user journey (H1)

Documented pipeline:

```
search → curate → tailor → queue → approve → send → follow up
```

Narrative beat (from brand / vision):

```
User provides résumé
        ↓
User defines preferences
        ↓
Agent helps analyze / curate opportunities
        ↓
Résumé / materials tailored (drafts)
        ↓
Cover letter / application content drafted
        ↓
Application craft organized (Applications)
        ↓
Human review in Queue
        ↓
User approves → Send (egress)
        ↓
Follow-up management & Timeline (what left / what stayed)
```

**Application lifecycle (spec):**  
`Discovered → Saved → Analyzed → ResumeGenerated → CoverLetterGenerated → ReadyForReview → Submitted → …`

**H1 Core modules (FEATURES):** Identity & Resume, Preferences, Local Intelligence, Agent, Discovery & Curation, Applications, Queue & Review, Send, Follow-ups, Timeline & Memory, Privacy & Trust Chrome.

**Writer rule:** Present journey as **designed / documented** path. Experimental/Future items (deep email sync, browser apply automation, trusted automation default-off, full workflow engine depth) must be labeled if mentioned.

---

# Research Section 4 — AI Agent Architecture

## 4.1 Documented model (use this)

```
UI (React) ──IPC──► Host
                      ├── Event bus (local, typed)
                      ├── AiProvider (complete / embed / health)
                      ├── Context Builder (minimal prompts)
                      ├── Agent (preparative workflows / roles)
                      ├── Queue (human review)
                      └── Send (only career-data egress; approval-gated)
```

**Laws:**

1. **Agent ≠ Send** — Agent may enqueue for review / publish intents; must not execute Send or mark application success.
2. **UI never calls AI** — Host owns providers; shell depends on bus/read models.
3. **One Agent chrome** — Specialized “agents” in the platform spec (Resume, Cover Letter, Research, …) are **workflow roles / step executors**, not separate user-facing bots.
4. **AI Validation** (Experimental) — post-generate checks; failures must not enqueue Send.

## 4.2 Reliability through separation of concerns

Why separating plan / execute / validate helps (map to docs, not invented trio names):

| Concern | Documented analogue | Why it helps |
|---------|---------------------|--------------|
| Plan | Workflow Planner & Engine | Breaks goals into steps; coordinates roles; does not own Send |
| Execute | Role steps + `AiProvider.complete` | Content generation & transforms under host |
| Verify | AI Validation + human Queue | Catches requirement gaps; human still gates high-stakes egress |

**Optional article language:** You may *analogize* plan/execute/verify as a reliability pattern, but name JobJitsu’s real nouns so readers can find them in the docs.

## 4.3 Do not claim

- A shipped multi-agent microservice swarm  
- Autonomous apply by default  
- Guaranteed quality from any model  

---

# Research Section 5 — Local AI Architecture

**Why local models (documented benefits):**

| Theme | Point |
|-------|-------|
| Privacy | Résumé/preferences/agent context stay on-device by default |
| Cost | Avoid mandatory per-seat cloud AI fees for baseline craft |
| Ownership | User chooses runtime; providers are adapters |
| Offline / resilience | Primary path designed for local execution |
| Flexibility | Swap local models; optional remote keys when user opts in |

**User choices (documented):**

- Free / local models as primary path  
- Hardware-aware guidance (setup friction is a real challenge — ADR 0005)  
- Own paid provider API keys — **explicit config**; never labeled as on-device when remote  

**Honest AI rules:** No silent cloud fallback. Status chrome must not lie.

---

# Research Section 6 — Engineering Philosophy

## 6.1 Documentation-first lifecycle

```
Documentation
      ↓
Architecture / ADRs
      ↓
User stories (platform PE* + delivery E*)
      ↓
GitHub Project / waves
      ↓
Implementation (vertical slice)
      ↓
Verification (tests + DoD)
      ↓
Release (when ready)
```

## 6.2 Practices to mention

| Practice | Source gist |
|----------|-------------|
| Monorepo | pnpm + Turborepo; `packages/*`, `app/` (target `apps/desktop/`), `website/`, `docs/` |
| Open contribution | Inspectable; docs as valuable as code; calm PR culture |
| Testing | Privacy boundary, approval gates, Agent pause, honest send outcomes, local AI path (`TESTING_STRATEGY.md`) |
| Vertical slices | One story; AC → tests → docs → stop |
| AI-assisted development | Plan → implement one task → commit; no multi-feature thrash (`AI_DEVELOPMENT_WORKFLOW.md`, constitution) |
| Definition of Done | Documented, tested, typed, reviewed, architecture, lint, build (`pnpm check`) |
| Conventional Commits | Commitlint + Husky |
| Docs site | Docusaurus `@jobjitsu/website` reads `/docs` in place; GitHub Actions deploy to Pages; fail on broken links |

## 6.3 Branch / PR (keep light)

- Work from documented stories/waves (`IMPLEMENTATION_ORDER.md`).  
- Prefer small PRs that meet DoD.  
- Docs updates on `main` publish automatically via Actions (build + link check + Pages).

---

# Research Section 7 — Architecture Deep Dive

## 7.1 Desktop application

**Why desktop (not mobile-first feed / not cloud web app):**

- Career craft needs durable local storage, model lifecycle, OS notifications, and a calm multi-pane OS feel.  
- Tauri: Rust host + webview; deny-by-default IPC; smaller attack surface narrative than unbounded Node-in-renderer.  
- Non-goal: mobile-first social feed of jobs.

## 7.2 Storage layer

- All career data on-device via `packages/storage`, host-orchestrated.  
- Structured store + filesystem blobs for large artifacts.  
- Timeline for egress audit (“what left / what stayed”).  
- No ambient JobJitsu cloud sync.

## 7.3 AI runtime

- `AiProvider`: `health` / `complete` / optional `embed`.  
- Context Builder assembles minimal prompts.  
- Model lifecycle: load/unload; respect Agent pause; don’t keep models warm forever.

## 7.4 Integration layer

Documented categories (status-gated):

| Integration | Role | Caution |
|-------------|------|---------|
| Email | Sync / follow-up channels | Spec-heavy; Experimental until admitted |
| Browser / apply automation | External forms | Experimental; privacy-sensitive |
| Job providers | Discovery sources | User-chosen sources; not “become a job board” |
| Remote AI | Optional adapters | Explicit config; honest labeling |

## 7.5 Plugin / extension system

| Term | Meaning |
|------|---------|
| **Plugin** | Capability-gated **agent skill** |
| **Extension** | Host contribution (discovery, send channel, UI, …) |

Why extensibility: community techniques without vendor lock-in; still capability-gated; **cannot** bypass Send policy.

---

# Research Section 8 — Technical Challenges

## 8.1 Local LLM challenges

- Hardware variance and setup friction  
- Model quality vs latency vs memory  
- Context window management / minimal context assembly  
- Keeping status chrome honest under mixed local/remote configs  

## 8.2 Agent / workflow challenges

- Reliability of multi-step workflows (Experimental depth)  
- Hallucinations in drafts → need validation + human Queue  
- Enforcing Agent ≠ Send in package boundaries and tests  

## 8.3 Automation challenges

- External portals change; brittle automation  
- Auth (email, boards) without becoming a credential harvester  
- User privacy when any network path exists  

## 8.4 Desktop challenges

- Cross-platform packaging (macOS / Windows / Linux)  
- Updates without a cloud that holds career data  
- Tauri/Rust + TypeScript dual skill load  

**Writer rule:** Challenges should feel **earned from the design**, not invented drama.

---

# Research Section 9 — Open Source Vision

**Why open source:**

- Transparency — architecture and privacy claims are inspectable  
- Community contribution — shared craft, not a black-box career SaaS  
- Educational value — monorepo + docs-first as a teaching artifact  
- Avoid vendor lock-in — providers/plugins/extensions as adapters  
- Alignment with “open trust” product principle  

**Accuracy note:** State open-source **intent** and that license selection may still be TBD if that remains true at publish time. Do not invent an SPDX license.

**Horizons (future vision without overclaim):**

| Horizon | Name | One line |
|---------|------|----------|
| H1 | Application Dojo | Local pipeline search → follow-up |
| H2 | Full Hunt Loop | Outcomes, reflection, deeper memory |
| H3 | Career Craft | Interview / narrative modules in the same dojo |
| H4 | Sovereign Ecosystem | Extensibility & portability, still local-first |

---

# Recommended Medium article structure

## Title ideas (10)

1. The Gentle Art of Landing the Job: Why We’re Building a Local-First Career OS  
2. Your Résumé Isn’t Training Data: An Open-Source Case for On-Device Job Hunt AI  
3. Agent Prepares, You Send: Privacy Architecture for the AI Job Market  
4. Not ChatGPT for Jobs — An Operating System for Career Craft  
5. When Hiring Got Automated, Job Seekers Needed Leverage, Not Another Subscription  
6. On-Device, On-Target, On Your Terms: Building JobJitsu in Public  
7. The Anti-Autopilot: Designing an AI Job Assistant That Refuses to Own Send  
8. Documentation-First: How We’re Building an Open-Source AI Career OS  
9. Local Models, Human Approval: A Different Bet on Personal AI Assistants  
10. Job Hunting as Craft: An Architecture for Calm Confidence  

## Hook approaches (pick one; writer may blend lightly)

1. **Asymmetry:** Employers automate screening; candidates are told to “just apply more.” What would leverage look like instead of volume?  
2. **Intimacy tax:** You upload your life story to yet another career SaaS. Who holds it? Who fine-tunes on it?  
3. **Belt metaphor:** Soft open — “Your belt is tied.” Introduce JobJitsu’s calm voice without cosplay overload.  
4. **Negative space:** List what JobJitsu refuses to be (from non-goals), then reveal what remains.  
5. **Builder confession:** Spec and scaffold before spray-painting a landing page — docs-first as the story.

## Section outline (recommended)

1. **Introduction** — Thesis + status honesty (early foundation).  
2. **The Problem** — Market + accessibility (Section 1).  
3. **Why Existing Approaches Are Not Enough** — Cloud default, subscription walls, autopilot ethics.  
4. **The Idea Behind JobJitsu** — Career OS, promise triad, Agent ≠ Send.  
5. **Building a Local AI Agent** — Local primary, remote opt-in, chrome honesty.  
6. **Architecture Overview** — Host, events, AiProvider, Queue, Send; one diagram.  
7. **Engineering Workflow** — Docs → architecture → stories → slices → DoD → Pages.  
8. **Challenges** — Local models, validation, automation brittleness, desktop packaging.  
9. **Lessons Learned (so far)** — Spec before code; package fences as product law; brand voice as engineering constraint. Frame as *early* lessons.  
10. **Future Vision** — H1–H4 calmly; plugins/extensions; no FOMO roadmap theater.  
11. **Conclusion** — Invite contributors/users to docs site + GitHub; amplify ability, don’t replace judgment.

**Suggested length:** 1,800–2,800 words for Medium; diagrams as images/embeds.

**CTA (calm):** Link to GitHub (`ammar-tariq/jobjitsu`), docs site (`https://ammar-tariq.github.io/jobjitsu/`), manifesto/product vision — not “smash that clap.”

---

# Diagram suggestions

| Diagram | Content | Mermaid sketch (writer/designer) |
|---------|---------|----------------------------------|
| System architecture | Host / UI / packages / local model / optional remote | C4-ish boxes from `SYSTEM_ARCHITECTURE.md` |
| Agent ≠ Send flow | Prepare → Queue → Approve → Send → Timeline | Sequence or flowchart |
| Local AI pipeline | Context Builder → AiProvider → draft → Validation? → Queue | Linear pipeline |
| Development lifecycle | Docs → ADR → Stories → Slice → Test → Pages | Flowchart (Section 6) |
| Horizon map | H1→H4 | Simple LR flowchart from `ROADMAP.md` |

**Visual tone:** Dark Midnight Ink + Electric Teal accents; Inter; no purple-glow AI cliché; no combat/ATS-crush imagery.

---

# Key talking points checklist (writer QA)

- [ ] Uses **Agent**, not “bot/autopilot,” in user-facing narrative  
- [ ] States **Agent prepares; human owns Send**  
- [ ] Local AI is **primary**; remote is **opt-in and labeled**  
- [ ] No JobJitsu cloud holding résumés  
- [ ] Does not invent Planner/Worker/Verifier product names  
- [ ] Does not claim guaranteed interviews/offers  
- [ ] Does not attack named competitors  
- [ ] Acknowledges **early foundation / not fully shipping**  
- [ ] Mentions open-source **intent** accurately (license TBD if still true)  
- [ ] Pipeline matches documented H1 loop  
- [ ] Challenges feel real (hardware, validation, automation, packaging)  
- [ ] Tone: calm confidence — no FOMO, streaks, or urgency theater  

---

# Important quotes & themes (copy bank)

**Themes:** leverage over volume; privacy as architecture; open trust; craft over grind; agent as belt not leash; calm confidence; documentation-first.

**Short quotes:**

- “The gentle art of landing the job.”  
- “On-device. On-target. On your terms.”  
- “Your career belongs to you.”  
- “The AI suggests. The human decides. The user remains in control.”  
- “AI is a Tool, Not the Product.”  
- “Privacy is not a premium feature. It is the default.”  
- “JobJitsu is not ‘ChatGPT for jobs.’ It is the operating layer for a career practiced with leverage.”  
- “We will never treat personal career data as a product.”  
- “Mastery is not achieved through force. It is achieved through consistency.”  

**Brand microcopy flavor (optional color, sparingly):** Idle — “Your belt is tied…”; Warming — “Warming up on-device. No data leaves this dojo.”

---

# Suggested source links for the final article

| Resource | Path / URL |
|----------|------------|
| Manifesto | `MANIFESTO.md` |
| Product vision | `docs/product/PRODUCT_VISION.md` |
| Non-goals | `docs/product/NON_GOALS.md` |
| Features / status | `docs/product/FEATURES.md` |
| Architecture overview | `docs/architecture/OVERVIEW.md` |
| AI architecture | `docs/architecture/AI_ARCHITECTURE.md` |
| Package boundaries | `docs/architecture/PACKAGE_BOUNDARIES.md` |
| ADRs | `docs/adr/` |
| Docs site | https://ammar-tariq.github.io/jobjitsu/ |
| Repository | https://github.com/ammar-tariq/jobjitsu |

---

# Handoff note for the final Medium writer

You are writing a thoughtful technical narrative for builders and job seekers. Prefer precision over hype. When in doubt, open the linked docs rather than inventing. If a capability is Experimental or Future in `FEATURES.md`, say so. The story is **why this architecture** and **what it refuses to become** as much as what it aspires to ship.
