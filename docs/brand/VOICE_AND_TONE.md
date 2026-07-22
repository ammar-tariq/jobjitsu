# JobJitsu Voice & Tone

> Calm confidence. The black belt in the corner of the room — not the shouting competitor.

Companion docs: [PRODUCT_PHILOSOPHY.md](./PRODUCT_PHILOSOPHY.md) · [WRITING_STYLE_GUIDE.md](./WRITING_STYLE_GUIDE.md) · [COPY_GUIDELINES.md](./COPY_GUIDELINES.md)

---

## Brand Voice in One Line

**Precise, respectful, quietly strong — like a coach who never raises their voice.**

---

## Voice Pillars

| Pillar | Sounds like | Never sounds like |
|--------|--------------|-------------------|
| **Calm** | “We’ve got this.” / “Waiting for your signal.” | “Act now!” / “Don’t miss out!” |
| **Confident** | Clear next steps; no hedging theater | Empty hype (“revolutionary”, “crushing it”) |
| **Respectful** | User owns the agent and the send button | Guilt, FOMO, or “you’re falling behind” |
| **Precise** | Correct terms (agent, local LLM); plain gloss when needed | Jargon soup or baby-talk |
| **Craft-oriented** | Job hunt as skill you can master | Job hunt as endless chore or war |

---

## Tone by Context

Tone shifts with the moment; voice stays constant.

| Context | Tone | Example |
|---------|------|---------|
| **Idle / ready** | Quiet readiness | “Your belt is tied. Waiting for your signal.” |
| **Progress** | Steady, factual | “3 applications queued. 1 needs your review.” |
| **Success** | Warm, measured | “One more throw. That’s 3 this week.” |
| **Follow-up** | Polite, gentle | “Time to gently nudge — a polite reminder is ready.” |
| **Privacy / loading** | Reassuring, grounded | “Warming up on-device. No data leaves this dojo.” |
| **Error** | Honest, useful, no blame | “Couldn’t reach that board. Check the link, or try again.” |
| **Empty state** | Inviting, not needy | “No applications yet. Set preferences and take your first throw.” |
| **Settings / power** | Direct, adult | “Local model path” / “Require approval before send” |

---

## Metaphor Discipline

Martial-arts imagery is part of JobJitsu identity. Use it like seasoning.

**Allowed (sparse):**
- belt, dojo, throw, nudge, leverage, black belt (in brand/about contexts)

**Avoid:**
- opponent, destroy, crush, fight, warrior, battle, kill the competition
- stacking multiple metaphors in one sentence
- forcing a belt joke into every toast

If a sentence works without metaphor, prefer clarity. Save metaphor for moments of brand presence (idle, success, privacy, marketing).

---

## Point of View

- Prefer **second person** (“your agent”, “your terms”) and **inclusive we** only when the product is acting with the user (“We’ve queued this for review”).
- Never claim ownership of the user’s career (“we’ll land you a job”).
- The agent is **yours**, not ours as a cloud service.

---

## Emotional Guardrails

Job search is stressful. JobJitsu must not:

- Manufacture urgency with aggressive red badges or countdown copy
- Shame inactivity (“You haven’t applied in 5 days!”)
- Over-celebrate with confetti for routine actions
- Imply failure when a board rejects or a scrape fails

Celebrate technique and consistency. Treat setbacks as information.

---

## Vocabulary Preferences

| Prefer | Avoid |
|--------|-------|
| local / on-device | “in the cloud” (unless contrasting) |
| agent | LLM, bot, autopilot (unless advanced settings / engineering docs) |
| application / throw (rare) | blast, spray, spam |
| follow-up / nudge | chase, hunt them down |
| review / approve | “let AI decide” |
| preferences | “hack your funnel” |
| queued | pending forever / stuck |

## UI terminology (development)

- **Agent**, not LLM, in chrome and primary UI.
- Reinforce **on-device** privacy in status and confirmations.
- Never pressure; never skip human approval before egress.
- Keep layouts clean — one job per view.

See also `.cursor/rules/branding-development.mdc`.

---

## Taglines (Canonical)

**Primary:** The gentle art of landing the job.  
**Secondary:** On-device. On-target. On your terms.

Use primary for hero, bio, and title extension. Use secondary when emphasizing privacy, precision, and autonomy together. Do not invent competing taglines.

---

## Voice Checklist

Before shipping copy, confirm:

- [ ] Would a calm coach say this out loud?
- [ ] Does it keep the user in control?
- [ ] Is any metaphor earning its place?
- [ ] Is privacy respected in wording (especially for local LLM)?
- [ ] Does it avoid FOMO, guilt, and hype?
