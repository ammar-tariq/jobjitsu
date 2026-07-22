# The Gentle Art of Landing the Job: Why We’re Building a Local-First Career OS

## Status

Draft  
**Related proposal:** [proposals/001-initial-vision.md](../proposals/001-initial-vision.md)  
**Related milestone / issue:** [#56](https://github.com/ammar-tariq/jobjitsu/issues/56)  
**Research:** [research/JOBJITSU_MEDIUM_ARTICLE_BLUEPRINT.md](../research/JOBJITSU_MEDIUM_ARTICLE_BLUEPRINT.md)

## Audience

Both — contributors and users evaluating JobJitsu

## Summary

JobJitsu is an open-source, local-first AI Career Operating System. This series opener explains why it exists, what it refuses to become, and how Agent ≠ Send and on-device intelligence form the privacy architecture — while the repo is still **early foundation** (vision, ADRs, monorepo scaffold; not a finished Career OS product).

---

## Body

### 1. Opening

Finding meaningful work has always required skill, persistence, and timing. What changed is the path between discovering an opportunity and getting a conversation with a human.

Candidates are no longer competing only with other people. They face automated screening, AI-assisted applications, crowded portals, and hiring loops that grow more complex every year. Many qualified people never reach the conversation stage. Their experience is filtered before anyone meets them.

AI is one of those forces — alongside remote competition, process complexity, and economic cycles. It is not the only reason hiring feels harder. It is one reason the tools candidates reach for matter so much.

Too often those tools ask for the same bargain: upload your résumé, pay a subscription, and hope the cloud treats your career history with care. Job hunting is intimate work. Your résumé, preferences, notes, and correspondence are not disposable telemetry. They are you.

We believe there is a better way.

**JobJitsu** is an open-source, local-first **AI Career Operating System**. The tagline is deliberate:

> The gentle art of landing the job.  
> On-device. On-target. On your terms.

### 2. Context / problem

Online applications are commoditized. One click for thousands of candidates creates noise for employers and despair for applicants. Automated screening sits between humans. Workflows change faster than most candidates’ tooling.

What seekers need is **leverage** — clearer fit, a sharper narrative, calmer follow-through — not another system that shouts “apply more.”

Meanwhile, useful AI career help is often paywalled: résumé optimization, interview prep, coaching assistants, application automation. People who are unemployed or mid-transition may need that help most and afford it least. Uploading a life story to yet another SaaS is an intimacy tax: career history as retention risk.

JobJitsu’s answer is not a louder autopilot. It is a quieter operating layer: capability without mandatory subscription hostage, and without a JobJitsu cloud that holds your career data by default.

### 3. What JobJitsu is (and is not)

JobJitsu is not “ChatGPT for jobs.” It is not a job board. It is not an agent that sprays applications while you sleep.

It is a **desktop-native Career OS** where:

- Your résumé, preferences, and agent context stay **on this device** by default  
- An on-device **Agent** prepares drafts, queues, and reminders  
- **You** own high-stakes Send  

The promise triad is the product law:

| Promise | Meaning |
|---------|---------|
| **On-device** | Local Agent · On-device intelligence by default |
| **On-target** | Fit and technique over spray-and-pray |
| **On your terms** | Preferences, pause, and approval before send |

From the manifesto, in plain language:

> The AI suggests. The human decides. The user remains in control.  
> Privacy is not a premium feature. It is the default.  
> We will never treat personal career data as a product.

Equally important is what we refuse. JobJitsu is not cloud résumé SaaS, not subscription lock-in of your data, not fully autonomous “we land the job for you,” not streak-and-guilt growth loops, not employer-side surveillance, not “crush the ATS” combat theater, and not a guarantee of interviews or offers. Honest help means draft, tailor, queue, and remind — not prophecy.

Horizon 1 — the **Application Dojo** — is the documented spine:

```
search → curate → tailor → queue → approve → send → follow up
```

In practice: you bring a résumé and preferences; the Agent helps curate and draft; applications stay organized locally; the **Queue** is where humans review; **Send** is the only place career data may leave, under policy; **Follow-ups** and a **Timeline** keep a calm record of what left the device and what stayed.

Some deeper capabilities — browser apply assist, trusted automation, heavy email sync, full workflow-engine depth — are labeled **Experimental** or **Future** in our feature map. Horizons H2–H4 stay parked until the product admits them.

**Status honesty:** today the repository is early foundation — brand, product vision, ADRs, monorepo, docs site, event bus, shell scaffold, and interfaces. The full Career OS loop is designed and sequenced; it is not a finished consumer product yet.

### 4. Technical narrative

#### Agent prepares. You send.

That sentence is architecture, not marketing.

```
UI (React) ──IPC──► Host
                      ├── Event bus (local, typed)
                      ├── AiProvider (complete / embed / health)
                      ├── Context Builder (minimal prompts)
                      ├── Agent (preparative workflows)
                      ├── Queue (human review)
                      └── Send (egress only; approval-gated)
```

Laws that do not bend:

1. **Agent ≠ Send** — The Agent may prepare and enqueue. It must not execute Send or invent success.  
2. **UI never calls AI** — The host owns providers. The shell listens to events and read models.  
3. **One Agent chrome** — Specialized steps (résumé tailor, cover letter, research) are workflow roles, not a swarm of user-facing bots.  
4. **No silent cloud fallback** — Local is primary. Remote providers, if you configure them with your own keys, must be labeled honestly. Status says **Agent · On-device** only when that is true — never “Local LLM” in everyday chrome.

Reliability comes from separation of concerns: plan workflows, execute generation under the host, validate where admitted, and keep a human Queue before egress.

Why desktop, not a mobile job feed? Career craft needs durable local storage, a model lifecycle, OS-native notifications, and a calm multi-pane workspace. We chose a Tauri-class host (Rust + webview) with deny-by-default IPC so privileged work — storage, intelligence, send — stays outside the renderer.

Storage is on-device by design: structured data and blobs under the user’s machine, with a timeline for egress audit. There is no ambient JobJitsu cloud sync of résumés.

#### Why local intelligence

Local models are a privacy, cost, and ownership bet:

- Résumé and preference context stay on-device by default  
- Baseline craft does not require a mandatory per-seat cloud AI fee  
- You choose the runtime; providers are adapters  
- The primary path is designed for local execution; optional remote is opt-in  

That comes with real challenges: hardware variance, setup friction, quality vs latency vs memory, and keeping status chrome honest when someone later opts into a remote key.

#### How we build: documentation as architecture

```
Documentation
      ↓
Architecture / ADRs
      ↓
User stories
      ↓
GitHub Project / waves
      ↓
Implementation (one story)
      ↓
Verification (tests + Definition of Done)
      ↓
Release when ready
```

The monorepo separates shell, domain packages, and a Docusaurus site that reads `/docs` in place. Tests protect promises: privacy boundary, approval gates, Agent pause, honest send outcomes, local intelligence path. Definition of Done means documented, tested, typed, reviewed, architecture-aligned, lint-clean, and build-green.

Brand voice is an engineering constraint: say **Agent**, reinforce on-device privacy, never pressure the user with FOMO or streaks.

### 5. Challenges

Building a privacy-first personal Agent for job search means accepting hard problems:

- **Local models** — setup friction and honest health states  
- **Draft quality** — validation plus human Queue, not blind trust  
- **Automation** — external portals change; any network path must stay user-initiated and inspectable  
- **Desktop packaging** — macOS, Windows, Linux without a career-data cloud  

These are not drama. They are the cost of refusing the easy SaaS shape.

### 6. What comes next

Horizons are directional, not a ship calendar:

| Horizon | Focus |
|---------|--------|
| **H1** Application Dojo | Local search → follow-up loop |
| **H2** Full Hunt Loop | Outcomes, reflection, deeper memory |
| **H3** Career Craft | Interview and narrative modules in the same dojo |
| **H4** Sovereign Ecosystem | Plugins, extensions, portability — still local-first |

Extensibility matters later: plugins as capability-gated Agent skills, extensions as host contributions — never a bypass around Send policy.

The goal is not to replace human decision-making. The goal is to amplify the user’s ability.

Job hunting should feel like craft, not panic. An Agent that prepares — and a human who sends — is a different bet on personal AI: open to inspect, local by default, calm by design.

We are at the beginning. The architecture is written so the product cannot quietly become what we refuse. If that resonates, the dojo is open.

---

## Join the Journey

JobJitsu is open source.

We are looking for help with:

- Development
- Documentation
- Testing
- Design
- Branding
- Community building

If you are interested in helping shape the future of JobJitsu, join the project.

- Repository: https://github.com/ammar-tariq/jobjitsu  
- Docs: https://ammar-tariq.github.io/jobjitsu/  

Open-source **intent** is firm; license selection may still be finalized — we state that honestly.

---

## Sources

- [`MANIFESTO.md`](../../../MANIFESTO.md)
- [`docs/product/PRODUCT_VISION.md`](../../product/PRODUCT_VISION.md)
- [`docs/product/NON_GOALS.md`](../../product/NON_GOALS.md)
- [`docs/product/FEATURES.md`](../../product/FEATURES.md)
- [`docs/product/ROADMAP.md`](../../product/ROADMAP.md)
- [`docs/architecture/OVERVIEW.md`](../../architecture/OVERVIEW.md)
- [`docs/architecture/AI_ARCHITECTURE.md`](../../architecture/AI_ARCHITECTURE.md)
- [`docs/architecture/PACKAGE_BOUNDARIES.md`](../../architecture/PACKAGE_BOUNDARIES.md)
- [`docs/adr/0001-tauri.md`](../../adr/0001-tauri.md), [`0005-ai-runtime.md`](../../adr/0005-ai-runtime.md), [`0009-send-boundary.md`](../../adr/0009-send-boundary.md)
- Blueprint: [`docs/articles/research/JOBJITSU_MEDIUM_ARTICLE_BLUEPRINT.md`](../research/JOBJITSU_MEDIUM_ARTICLE_BLUEPRINT.md)
- Proposal: [`docs/articles/proposals/001-initial-vision.md`](../proposals/001-initial-vision.md)

## Diagrams

- Host / UI / AiProvider / Queue / Send (section 4 ASCII)
- Docs-first development lifecycle (section 4)
- Horizon map H1–H4 (section 6)
- Optional Mermaid for Medium embed: Agent ≠ Send prepare → queue → approve → send → timeline
