# JobJitsu Writing Style Guide

Rules for every sentence in the product, README, and marketing. Complements [VOICE_AND_TONE.md](./VOICE_AND_TONE.md) and [COPY_GUIDELINES.md](./COPY_GUIDELINES.md).

---

## Principles

1. **Short by default.** One idea per sentence. Cut throat-clearing (“In order to…”, “Please note that…”).
2. **Concrete over abstract.** Prefer “Requires approval before send” to “Enhanced safety controls.”
3. **User first.** Lead with what the user can do or what just happened.
4. **Honest.** Never overclaim AI accuracy or guarantee interviews/offers.
5. **Brand-consistent.** Calm, precise, lightly metaphorical — never loud.

---

## Grammar & Mechanics

### Capitalization
- **Sentence case** for UI: buttons, menus, titles, toasts (“Send application”, not “Send Application”).
- **JobJitsu** always as one word, capital J twice. Never “Job Jitsu”, “Jobjitsu”, or “JOBJITSU” in prose.
- Product areas use sentence case: “Follow-up reminders”, “Agent · On-device”.

### Punctuation
- Prefer periods over exclamation marks. Exclamations are rare and reserved for genuine milestones.
- Use em dashes sparingly for rhythm in marketing; avoid in dense UI labels.
- Oxford comma: yes (“search, curate, and apply”).

### Numbers
- Digits for counts and metrics: “3 this week”, “12 queued”.
- Spell out one–nine only in long prose when it reads better; UI always uses digits.

### Contractions
- Allowed and preferred for warmth: “couldn’t”, “you’re”, “we’ve”.
- Avoid slang contractions that feel chatty (“gonna”, “wanna”).

---

## Naming in Prose

| Term | Usage |
|------|--------|
| **JobJitsu** | Product name |
| **agent** | Local automation that acts on preferences |
| **local LLM** | On-device model; first mention can be “local LLM (on-device model)” |
| **Leverage Belt** | Logo / symbol name in brand contexts |
| **dojo** | Metaphor for the local machine — status/privacy microcopy only |
| **application** | Default for a job application action |
| **follow-up** | Hyphenated as noun/adjective |

---

## Buttons & Labels

- Verb + object when possible: “Save preferences”, “Queue application”, “Approve send”.
- Destructive actions: clear and specific — “Delete draft”, not “Delete”.
- Toggle labels describe the **state being enabled**: “Require approval before send”.

**Do:** `Review before send`  
**Don’t:** `Submit!!!` / `Let’s go` / `Crush apply`

---

## Headings

- H1: brand or screen purpose, not a slogan stack.
- H2/H3: scannable nouns or short verb phrases.
- Avoid question headings in settings (“Want follow-ups?”) — prefer statements (“Follow-up reminders”).

---

## Lists & Instructions

- Parallel structure.
- Start with the verb for steps: “Connect resume → Set preferences → Activate agent”.
- Keep onboarding to three beats when possible (see brand onboarding pattern).

---

## Inclusive & Respectful Language

- No assumptions about age, gender, nationality, or education level.
- Avoid “guys”, “ninja”, “rockstar”, “guru”.
- Disability and accessibility language: person-first or identity-first as appropriate; never equate errors with personal failure.
- Employers and recruiters are not enemies — no hostile framing.

---

## Claims & Compliance

**Allowed:**
- “Runs locally”
- “No cloud required for the agent / LLM”
- “Open-source”

**Avoid unless true and proven:**
- “Guarantees interviews”
- “Beats every ATS”
- “Fully autonomous job landing”

When describing AI: “helps draft / tailor / queue” — not “automatically gets you hired.”

---

## Localization Notes (Future)

- Keep metaphors optional so translators can substitute culture-appropriate craft metaphors.
- Do not hard-lock UI length to English belt puns.
- Preserve “JobJitsu” and “Leverage Belt” as proper names.

---

## Before / After

| Before | After |
|--------|-------|
| “Hurry — your dream job won’t wait!” | “A matching role is ready for review.” |
| “AI is blasting apps for you!!!” | “3 tailored applications queued. 1 needs approval.” |
| “Error: null pointer in sync module” | “Couldn’t sync that listing. Try again, or open the log.” |
| “Congratulations on your AMAZING progress” | “One more throw. That’s 3 this week.” |
| “Please be advised that data remains local.” | “No data leaves this dojo.” |
