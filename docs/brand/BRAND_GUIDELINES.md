# JobJitsu Brand Guidelines v1.0

> **The gentle art of landing the job.**
>
> *On-device. On-target. On your terms.*

---

## 1. Brand Essence

JobJitsu is an open-source desktop app that gives you a local AI black belt for the entire job hunt. It runs a local agent and local LLM — no cloud, no subscriptions.

**Core values:** Privacy-first, intelligent, smooth, unstoppable, empowering.  
**Brand feeling:** Calm confidence. The black belt in the corner of the room, not the shouting competitor.

---

## 2. Logo: The Leverage Belt

### Symbol Meaning
A continuous martial-arts belt flows into a stylised **"J"**. Its tail folds into an envelope flap — representing the full pipeline (search → curate → apply → send → follow up). The belt symbolises mastery, technique, and gentle redirection.

### Logo Variants

| Variant | File | Usage |
|---------|------|-------|
| Primary (icon + wordmark) | `assets/logo-full-horizontal.svg` | README hero, website navbar, app about screen |
| Icon only | `assets/logo-icon.svg` | App icon, favicon, GitHub org avatar, system tray |
| Stacked | `assets/logo-stacked.svg` | Splash screen, social media profiles |
| Monochrome dark | `assets/logo-icon-mono-dark.svg` | Dark backgrounds, terminal |
| Monochrome light | `assets/logo-icon-mono-light.svg` | Light backgrounds, watermarks |

### Clear Space & Minimum Size
- **Clear space:** Equal to the height of the "J" icon around all sides.
- **Minimum width:** 32 px for icon-only, 120 px for full logo (digital).
- **Never** stretch, rotate, add drop shadows, or place on a busy background.
- The teal envelope flap is the **only** allowed accent on the icon; do not change its color.

---

## 3. Color Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Deep Indigo | `#1E1B4B` | Belt, primary text, dark UI backgrounds |
| Accent | Electric Teal | `#2DD4BF` | Envelope fold on logo, primary CTAs, links |
| Neutral Dark | Midnight Ink | `#0B0A1A` | Dark mode backgrounds, code blocks |
| Neutral Light | Soft Cloud | `#F8FAFC` | Light mode backgrounds, cards |
| Text Primary (light) | Slate 800 | `#1E293B` | Body text on light backgrounds |
| Text Primary (dark) | White | `#FFFFFF` | Body text on dark backgrounds |
| Text Secondary | Slate 500 | `#64748B` | Captions, metadata |
| Success | Jade | `#10B981` | Application sent confirmations |
| Caution | Amber | `#F59E0B` | Follow-up reminders, pending states |

### Contrast Checks
- Indigo on Cloud → AAA (17.8:1)
- Teal on Midnight → AA for large text only. For dark-mode CTAs, use a slightly darker teal (`#14B8A6`) if needed for body text.
- Always test UI components with a contrast checker (WCAG AA minimum).

---

## 4. Typography

### Primary Font: Inter
- **Why:** Highly readable, modern, open-source (SIL OFL 1.1). Works in UI and code.
- **Weights:** Regular (400), Medium (500), Semi-bold (600), Bold (700).

### Type Scale (Desktop App)

| Level | Size / Line-height | Weight | Usage |
|-------|--------------------|--------|-------|
| H1 | 32 / 40 px | Bold 700 | App title, landing hero |
| H2 | 24 / 32 px | Semi-bold 600 | Section headers |
| H3 | 20 / 28 px | Medium 500 | Card titles, modal headers |
| Body | 16 / 24 px | Regular 400 | Main content, job descriptions |
| Small | 14 / 20 px | Regular 400 | Meta, timestamps, labels |
| Code | 14 / 20 px | Regular 400 | Use `JetBrains Mono` for code blocks |

### Monospace Font
- **JetBrains Mono** (SIL OFL 1.1) — used in agent logs, resume previews, and any terminal output.

---

## 5. Iconography & Illustrations

### Icons
- **Library:** [Lucide](https://lucide.dev) (MIT licensed, open-source).
- **Style:** 2 px stroke, rounded caps and joins.
- **Color:** Indigo on light mode, white on dark mode; interactive icons use teal on hover.

### Spot Illustrations
- Minimal line-art illustrations using a single accent color (teal) over soft cloud background.
- Style: modern, geometric, with subtle origami or martial-arts curves (belt-like arcs).
- Optional future mascot: an origami fox with a small indigo belt.

### Privacy Badge
A small **Agent · On-device** pill (indigo/teal) in the status bar assures users the agent runs locally. Do **not** label this “Local LLM” in the UI.

### Privacy Indicators
A belt mark or **Agent · On-device** badge in the status bar at all times.

---

## 6. UI Design Principles

1. **Native Feel, Local Power** — The interface should feel light and fast, like a native desktop tool. Use system chrome, crisp animations.
2. **Dark Mode First** — Default theme is Midnight Ink with teal highlights. Light mode is a deliberate switch.
3. **Invisible Agent** — Surface progress (queued applications, follow-up calendar) calmly. Not a spaceship cockpit.
4. **Privacy Indicators** — A small belt icon or **Agent · On-device** badge in the status bar at all times.
5. **Zero-Friction Onboarding** — First-run uses the Leverage Belt icon as a progress indicator: "1. Connect resume → 2. Set preferences → 3. Agent activates."

---

## 7. Messaging & Taglines

### Primary Tagline
**The gentle art of landing the job.**  
*Use as the main hero, social bio, or app title extension.*

### Secondary Tagline
**On-device. On-target. On your terms.**  
*Three short promises — privacy, precision, autonomy.*

### Combined Usage (README, website)
> **JobJitsu**  
> The gentle art of landing the job.  
> On-device. On-target. On your terms.

### Microcopy Examples
- **Idle agent:** *“Your belt is tied. Waiting for your signal.”*
- **Application sent:** *“One more throw. That’s 3 this week.”*
- **Follow-up due:** *“Time to gently nudge — a polite reminder is ready.”*
- **Agent warming up:** *“Warming up on-device. No data leaves this dojo.”*

---

## 8. Voice & Tone

| Trait | How it sounds |
|-------|---------------|
| Calm & confident | “We’ve got this.” not “Hurry up!” |
| Respectful | Never aggressive about automation; it’s your agent, your rules. |
| Precise | Uses correct terms when useful; prefers Agent over LLM in the UI |
| Inspiring | Positions job hunting as a craft you can master, not a chore. |

---

## 9. Application Examples

### GitHub Social Preview Card
- Background: Deep Indigo (`#1E1B4B`)
- Centered white Leverage Belt icon
- Text: "JobJitsu – The gentle art of landing the job." in white Inter Bold
- Teal envelope accent at the bottom edge

### App Icon (Desktop)
- Squircle container (macOS/iOS style) with Midnight Ink background.
- Leverage Belt icon in teal and white, centered.

### Discord Banner
- Gradient from Indigo to Midnight, stacked logo and tagline.
- Subtle belt curve pattern in the background.

---

## 10. Design Language Index

| Document | Covers |
|----------|--------|
| [PRODUCT_VISION.md](./PRODUCT_VISION.md) | Pointer to `docs/product/` vision set |
| [../product/PRODUCT_VISION.md](../product/PRODUCT_VISION.md) | Vision, mission (canonical) |
| [PRODUCT_PHILOSOPHY.md](./PRODUCT_PHILOSOPHY.md) | Beliefs, principles, metaphor map |
| [VOICE_AND_TONE.md](./VOICE_AND_TONE.md) | Voice pillars, tone by context |
| [WRITING_STYLE_GUIDE.md](./WRITING_STYLE_GUIDE.md) | Mechanics, vocabulary, claims |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | UI/component naming, motion, a11y, icons, illustration |
| [BRANDING_FOR_DEVELOPMENT.md](./BRANDING_FOR_DEVELOPMENT.md) | Brand rules that drive engineering/UI |
| [../design-system/README.md](../design-system/README.md) | Production tokens, themes, variants |
| [COPY_GUIDELINES.md](./COPY_GUIDELINES.md) | Copy architecture + surface index |
| [EMPTY_STATES.md](./EMPTY_STATES.md) | Empty-state patterns |
| [NOTIFICATIONS.md](./NOTIFICATIONS.md) | Toasts, OS alerts, severity |
| [ERROR_MESSAGES.md](./ERROR_MESSAGES.md) | Failure copy & recovery |
| [SUCCESS_MESSAGES.md](./SUCCESS_MESSAGES.md) | Measured win copy |

### Asset Checklist

| File | Status |
|------|--------|
| `assets/logo-icon.svg` | ✅ |
| `assets/logo-full-horizontal.svg` | ✅ |
| `assets/logo-stacked.svg` | ✅ |
| `assets/logo-icon-mono-dark.svg` | ✅ |
| `assets/logo-icon-mono-light.svg` | ✅ |
| `assets/social-preview.svg` | ✅ |
| `BRAND_GUIDELINES.md` | ✅ (this file) |

> **Remember:** Never alter the teal envelope flap color, always maintain clear space, and keep the voice calm and confident.  
> These guidelines ensure that JobJitsu looks and feels like a true master of the job hunt.
