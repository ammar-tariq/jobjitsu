# JobJitsu Design System

Visual and interaction language for the desktop app. Color, type, and logo foundations live in [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md). This document covers structure, naming, motion, accessibility, icons, and illustration.

---

## 1. Design Pillars (UI)

1. **Native feel, local power** — Light chrome, crisp motion, keyboard-first where it counts.
2. **Dark mode first** — Default: Midnight Ink (`#0B0A1A`) with Electric Teal (`#2DD4BF`) accents. Light mode is intentional, not an afterthought.
3. **Invisible agent** — Surface queue, calendar, and status calmly — never a spaceship cockpit.
4. **Privacy always visible** — Status bar: belt mark or “Local LLM” badge.
5. **One job per view** — Each screen has a primary purpose; secondary actions stay quiet.

---

## 2. Foundations (Summary)

| Token | Value | Role |
|-------|-------|------|
| Deep Indigo | `#1E1B4B` | Primary brand, belt, dark surfaces |
| Electric Teal | `#2DD4BF` | CTAs, links, logo flap, focus |
| Teal (AA body, dark) | `#14B8A6` | Body-size teal text on dark when needed |
| Midnight Ink | `#0B0A1A` | Dark background |
| Soft Cloud | `#F8FAFC` | Light background |
| Jade | `#10B981` | Success |
| Amber | `#F59E0B` | Caution / pending |
| Inter | UI sans | 400–700 |
| JetBrains Mono | Code / logs | 400 |

Radius, spacing, and elevation should stay subtle: prefer tight desktop density over large consumer-app padding. Soft shadows only; no neon glow stacks.

---

## 3. UI Naming Guidelines

Names in the interface should match how users think about the job hunt and the agent — not internal engineering terms.

### Principles
- **User language first:** “Follow-ups”, not “ReminderCron”.
- **Stable nouns:** Reuse the same word for the same concept everywhere.
- **Verb clarity:** Actions say what happens to data or the outside world.
- **No false friends:** Don’t call a draft a “throw” in navigation; metaphor belongs in microcopy, not IA.

### Canonical UI Terms

| Concept | UI name | Avoid |
|---------|---------|-------|
| Main automation | Agent | Bot, Autopilot, Worker |
| On-device model | Local LLM | Cloud AI, ChatGPT (unless integration) |
| Job application unit | Application | Opp, Req, Ticket |
| Pre-send holding | Queue | Pipeline (unless visualizing stages) |
| Post-send check-in | Follow-up | Chase, Ping storm |
| User rules | Preferences | Config dump, Profile hacks |
| Résumé file | Resume | CV only if locale requires |
| Approval gate | Review / Approve send | Confirm nuke |
| Privacy indicator | Local LLM (badge) | Secure sauce |

### Screen & Section Titles
- Prefer nouns: “Applications”, “Follow-ups”, “Preferences”, “Agent”.
- Subtitles may use calm sentence case: “Queued and waiting for your signal.”

### File & Export Names (user-visible)
- `JobJitsu-resume-export.pdf` style: Product + purpose + extension.
- No cryptic hashes in names the user sees.

---

## 4. Component Naming

For design specs, Storybook, and code — consistent, boring, discoverable.

### Pattern
```
Jj{Domain}{Element}[{Variant}]
```
Examples: `JjAgentStatusBadge`, `JjApplicationQueueRow`, `JjFollowUpCard`, `JjLocalLlmPill`.

### Domain Prefixes

| Prefix | Domain |
|--------|--------|
| `JjAgent` | Agent status, controls, idle |
| `JjApplication` | Application list, draft, send |
| `JjFollowUp` | Reminders and nudges |
| `JjPreferences` | Settings forms |
| `JjPrivacy` | Local LLM badge, indicators |
| `JjOnboarding` | First-run steps |
| `JjLog` | Agent / terminal output |

### Rules
- **PascalCase** for components; **camelCase** for instances/props.
- Variants via props (`tone="success"`), not `JjButtonGreenSuccessLarge`.
- Do not encode color in the name (`TealButton`); encode role (`PrimaryButton`).
- Lucide icons: wrap as `JjIcon` or use Lucide names directly — do not rename “Mail” to “EnvelopeThrow”.
- Prefer composition: `JjApplicationQueue` contains `JjApplicationQueueRow`.

### State Names (props / CSS)
Use: `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `success`, `caution`, `error`.  
Align caution with Amber and success with Jade from the brand palette.

---

## 5. Motion Guidelines

Motion expresses **presence and hierarchy**, not celebration spam.

### Intent
- Confirm that something local and fast happened.
- Guide attention to the next calm step.
- Never block the user with ornamental animation.

### Timing

| Use | Duration | Easing |
|-----|----------|--------|
| Micro (hover, toggle) | 120–160 ms | ease-out |
| Standard (panels, rows) | 180–240 ms | ease-in-out |
| Emphasis (success toast in) | 240–320 ms | ease-out |
| Exit | 120–200 ms | ease-in |

Avoid bounce and elastic springs on productive surfaces. Soft ease only.

### Approved Motions (ship 2–3 intentional patterns app-wide)
1. **Status pulse (subtle):** Local LLM / agent ready — slow opacity or soft teal breath on the badge (very low amplitude).
2. **Row settle:** New queue item eases in from 4–8 px above with fade — no slide from off-screen across the window.
3. **Toast rise:** Success/error toasts rise slightly and fade; auto-dismiss without drama.

### Disallowed
- Confetti, fireworks, full-screen flashes
- Looping attention-grabbers on idle (except the quiet badge breath)
- Parallax dashboards
- Motion that ignores reduced-motion preferences

### Reduced Motion
When `prefers-reduced-motion: reduce` (or OS equivalent): snap to end states; keep opacity fades ≤100 ms or cut entirely; never convey meaning by motion alone.

---

## 6. Accessibility Guidelines

JobJitsu’s calm UI must remain usable under WCAG **AA** (AAA where brand contrast already allows).

### Contrast
- Indigo on Cloud: AAA — preferred for text.
- Teal on Midnight: large text / UI chrome OK; for small body text on dark, prefer white/Slate or darker teal `#14B8A6`.
- Never rely on teal alone to mean “clickable” without another cue (underline, weight, icon).

### Focus
- Visible focus ring: teal (`#2DD4BF`) or high-contrast equivalent on dark/light.
- Never `outline: none` without a replacement.
- Logical tab order matching visual order.

### Keyboard
- Primary workflows (queue review, approve send, preferences) fully keyboard operable.
- Shortcuts documented in a calm shortcuts panel — no vim-only traps.

### Semantics
- Real buttons/links — not clickable `div`s.
- Status badges expose text alternatives (“Local LLM ready”).
- Toasts and errors use live regions (`assertive` for errors, `polite` for success).

### Motion & Vestibular
- Honor reduced motion (see Motion).
- No rapid strobing status lights.

### Inclusive copy
- Errors say what failed and how to recover — see [ERROR_MESSAGES.md](./ERROR_MESSAGES.md).
- Do not use color alone for success/caution/error; pair with icon + text.

---

## 7. Icon Usage

### Library
[Lucide](https://lucide.dev) — MIT, open-source. Aligns with open-source values.

### Style
- Stroke: **2 px**
- Caps & joins: **rounded**
- Default size in UI: 16 or 20 px; 24 px for empty-state anchors
- Color: Indigo (`#1E1B4B`) on light; white on dark; **teal on hover/active** for interactive icons

### Role Mapping (examples)

| Action / concept | Lucide suggestion |
|------------------|-------------------|
| Applications | `briefcase` or `file-text` |
| Send / apply | `send` |
| Follow-up | `bell` or `mail` |
| Agent | `bot` sparingly — prefer custom belt mark for brand moments |
| Local / privacy | belt mark or `shield` — prefer brand “Local LLM” pill |
| Settings | `settings` |
| Success | `check` / `check-circle` |
| Caution | `clock` or `alert-triangle` (amber) |
| Error | `alert-circle` |

### Rules
- One metaphor per control — don’t stack badge + icon + emoji.
- No emoji in primary chrome.
- Decorative icons: `aria-hidden="true"`. Informative icons: accessible name via label or `aria-label`.
- The **teal envelope flap** on the logo is sacred — do not recolor Lucide icons to invent a second “envelope brand”.

### Privacy Badge
Indigo/teal pill in the status bar: text **“Local LLM”** (or short equivalent). Always present while the local model is the active path.

---

## 8. Illustration Style

### Character
Minimal line-art. Soft Cloud or Midnight fields. **Single accent: Electric Teal** arcs that echo belt curves or origami folds. Geometric, modern, uncrowded.

### Motifs
- Belt-like continuous curves
- Soft envelope / fold geometry (pipeline metaphor)
- Optional future mascot: origami fox with a small indigo belt — used rarely, never as UI chrome clutter

### Placement
- Onboarding, empty states, about screen
- Not behind dense data tables
- Not as full-bleed noisy patterns under body text

### Don’ts
- 3D glossy martial-arts stock photos
- Purple AI nebula backgrounds
- Comic-fight imagery
- Busy collages or floating sticker packs on the hero

---

## 9. Related Copy Surfaces

| Surface | Doc |
|---------|-----|
| Empty states | [EMPTY_STATES.md](./EMPTY_STATES.md) |
| Notifications | [NOTIFICATIONS.md](./NOTIFICATIONS.md) |
| Errors | [ERROR_MESSAGES.md](./ERROR_MESSAGES.md) |
| Success | [SUCCESS_MESSAGES.md](./SUCCESS_MESSAGES.md) |
