# JobJitsu Copy Guidelines

How product strings are structured and where to find patterns. Voice lives in [VOICE_AND_TONE.md](./VOICE_AND_TONE.md); mechanics in [WRITING_STYLE_GUIDE.md](./WRITING_STYLE_GUIDE.md).

---

## Copy Architecture

Every user-facing string should answer at least one of:

1. **Where am I?** (screen title, section)
2. **What just happened?** (toast, inline confirmation)
3. **What can I do next?** (CTA, empty state)
4. **Am I still private / local?** (status, loading)

If it answers none, cut it.

---

## Hierarchy of a Message

| Layer | Purpose | Length |
|-------|---------|--------|
| **Title** | What happened or what’s missing | ≤ 6 words |
| **Body** | Context or recovery | ≤ 2 short sentences |
| **Action** | Optional single primary CTA | Verb + object |

Do not stack multiple CTAs in toasts. Prefer one clear next step.

---

## Metaphor Budget

- **Marketing / idle / privacy / milestone success:** metaphor welcome (belt, throw, dojo, nudge).
- **Settings, errors, legal, file paths:** plain language only.
- **Never** use metaphor to obscure a failure.

---

## Surface Index

| Surface | Document | Default emotion |
|---------|----------|-----------------|
| Empty states | [EMPTY_STATES.md](./EMPTY_STATES.md) | Inviting, ready |
| Notifications | [NOTIFICATIONS.md](./NOTIFICATIONS.md) | Polite, timely |
| Errors | [ERROR_MESSAGES.md](./ERROR_MESSAGES.md) | Honest, recoverable |
| Success | [SUCCESS_MESSAGES.md](./SUCCESS_MESSAGES.md) | Warm, measured |

---

## Canonical Microcopy (Brand)

Reuse these when the moment matches — do not paraphrase into hype.

| Moment | Copy |
|--------|------|
| Idle agent | “Your belt is tied. Waiting for your signal.” |
| Application sent | “One more throw. That’s {n} this week.” |
| Follow-up due | “Time to gently nudge — a polite reminder is ready.” |
| Agent warming up | “Warming up on-device. No data leaves this dojo.” |

---

## Checklist for New Copy

- [ ] Sentence case
- [ ] Calm and encouraging (no FOMO / guilt / pressure)
- [ ] User remains in control; human approval before egress
- [ ] Prefers **Agent** / **on-device** over LLM jargon in UI
- [ ] Privacy wording accurate for local agent
- [ ] Paired with icon + color role if status
- [ ] Works with reduced motion (meaning not motion-only)
- [ ] Screen stays uncluttered — one primary action
- [ ] Reviewed against [PRODUCT_PHILOSOPHY.md](./PRODUCT_PHILOSOPHY.md)
