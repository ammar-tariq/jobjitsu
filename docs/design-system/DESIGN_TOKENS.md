# Design Tokens

Primitive and semantic tokens for JobJitsu. Components consume **semantic** tokens; themes re-map them ([THEME_DARK.md](./THEME_DARK.md), [THEME_LIGHT.md](./THEME_LIGHT.md)).

---

## 1. Color primitives

### Brand

| Token | Hex | Name |
|-------|-----|------|
| `--jj-color-indigo-950` | `#0B0A1A` | Midnight Ink |
| `--jj-color-indigo-900` | `#1E1B4B` | Deep Indigo |
| `--jj-color-indigo-800` | `#312E81` | Indigo elevated (panels on dark) |
| `--jj-color-teal-400` | `#2DD4BF` | Electric Teal |
| `--jj-color-teal-500` | `#14B8A6` | Teal AA (body on dark) |
| `--jj-color-teal-600` | `#0D9488` | Teal pressed / strong |

### Neutrals

| Token | Hex | Name |
|-------|-----|------|
| `--jj-color-white` | `#FFFFFF` | White |
| `--jj-color-cloud-50` | `#F8FAFC` | Soft Cloud |
| `--jj-color-slate-100` | `#F1F5F9` | Cloud muted |
| `--jj-color-slate-200` | `#E2E8F0` | Border light |
| `--jj-color-slate-300` | `#CBD5E1` | Border strong light |
| `--jj-color-slate-500` | `#64748B` | Text secondary |
| `--jj-color-slate-600` | `#475569` | Text secondary strong |
| `--jj-color-slate-800` | `#1E293B` | Text primary on light |
| `--jj-color-slate-900` | `#0F172A` | Near-black text |

### Feedback

| Token | Hex | Name | Role |
|-------|-----|------|------|
| `--jj-color-jade-500` | `#10B981` | Jade | Success |
| `--jj-color-jade-600` | `#059669` | Jade strong | Success pressed |
| `--jj-color-amber-500` | `#F59E0B` | Amber | Caution / pending |
| `--jj-color-amber-600` | `#D97706` | Amber strong | Caution pressed |
| `--jj-color-rose-500` | `#F43F5E` | Rose | Error (not brand-loud; use sparingly) |
| `--jj-color-rose-600` | `#E11D48` | Rose strong | Error pressed |

### Alpha helpers (use on theme surfaces)

| Token | Value | Use |
|-------|-------|-----|
| `--jj-alpha-teal-15` | `color-mix(in srgb, var(--jj-color-teal-400) 15%, transparent)` | Soft teal wash |
| `--jj-alpha-teal-25` | `color-mix(in srgb, var(--jj-color-teal-400) 25%, transparent)` | Hover wash |
| `--jj-alpha-white-06` | `color-mix(in srgb, white 6%, transparent)` | Dark hairlines |
| `--jj-alpha-black-06` | `color-mix(in srgb, black 6%, transparent)` | Light hairlines |

---

## 2. Semantic color tokens

Themes assign these. Prefer these in `Jj*` components.

### Surfaces

| Token | Purpose |
|-------|---------|
| `--jj-color-bg-canvas` | App background |
| `--jj-color-bg-surface` | Panels, sidebars |
| `--jj-color-bg-elevated` | Popovers, menus, toasts |
| `--jj-color-bg-muted` | Subtle wells, code/log chrome |
| `--jj-color-bg-inverse` | Inverse strips (rare) |

### Text

| Token | Purpose |
|-------|---------|
| `--jj-color-text-primary` | Body and titles |
| `--jj-color-text-secondary` | Meta, captions |
| `--jj-color-text-tertiary` | Placeholders, disabled hints |
| `--jj-color-text-inverse` | Text on inverse/primary fills |
| `--jj-color-text-link` | Links |
| `--jj-color-text-on-accent` | Text on teal CTAs |

### Borders & focus

| Token | Purpose |
|-------|---------|
| `--jj-color-border-subtle` | Dividers |
| `--jj-color-border-default` | Inputs, lists |
| `--jj-color-border-strong` | Emphasized containers |
| `--jj-color-focus-ring` | Keyboard focus |

### Actions & status

| Token | Purpose |
|-------|---------|
| `--jj-color-accent` | Primary accent (teal) |
| `--jj-color-accent-hover` | Accent hover |
| `--jj-color-accent-pressed` | Accent pressed |
| `--jj-color-accent-muted` | Accent wash backgrounds |
| `--jj-color-success` | Success |
| `--jj-color-success-muted` | Success wash |
| `--jj-color-caution` | Caution / follow-up due |
| `--jj-color-caution-muted` | Caution wash |
| `--jj-color-danger` | Error / destructive |
| `--jj-color-danger-muted` | Error wash |

### Privacy chrome

| Token | Purpose |
|-------|---------|
| `--jj-color-privacy-pill-bg` | Agent on-device pill background |
| `--jj-color-privacy-pill-fg` | Agent on-device pill text |
| `--jj-color-privacy-pill-border` | Agent on-device pill border |

---

## 3. Spacing

**4px base unit** (`--jj-space-unit`). Desktop-dense: tighter than consumer mobile, never cramped. All spacing is a multiple of 4 (hairline borders `1px` excepted).

| Token | Value | Typical use |
|-------|-------|-------------|
| `--jj-space-0.5` | `2px` | Icon optical tweaks |
| `--jj-space-1` | `4px` | Tight inline gaps |
| `--jj-space-2` | `8px` | Label → control; button group gap |
| `--jj-space-3` | `12px` | Control padding Y; list row vertical |
| `--jj-space-4` | `16px` | Default gap; list row padding X |
| `--jj-space-5` | `20px` | Section inner padding (compact) |
| `--jj-space-6` | `24px` | Panel/modal padding; section gap |
| `--jj-space-8` | `32px` | View padding; major stacks |
| `--jj-space-10` | `40px` | Empty-state vertical rhythm |
| `--jj-space-12` | `48px` | Rare large separations |
| `--jj-space-16` | `64px` | Onboarding hero breathing room |

Rules: prefer scale tokens over arbitrary values; density first (one step tighter than marketing-site padding); hierarchy via type and section gaps, not oversized card padding; click targets stay ≥ 32px tall ([RESPONSIVE.md](./RESPONSIVE.md)).

---

## 4. Border radius

Subtle rounding — native tool, not toy. Pills are reserved for privacy/status chrome.

| Token | Value | Use |
|-------|-------|-----|
| `--jj-radius-none` | `0` | Full-bleed panels; tables/logs flush to edge |
| `--jj-radius-sm` | `4px` | Inputs, selects, compact chips |
| `--jj-radius-md` | `6px` | Buttons, list row hover, menus |
| `--jj-radius-lg` | `8px` | Panels, dialogs, popovers, toasts |
| `--jj-radius-xl` | `12px` | Rare large empty-state frames |
| `--jj-radius-pill` | `999px` | Agent · On-device pill, status containers |

Rules: never default everything to `rounded-full`; nested radii inner ≤ outer; tables and logs stay near `none`/`sm` for density.

---

## 5. Elevation

Soft, short shadows — paper in low light, not floating marketing cards. Prefer surface + hairline border (`--jj-color-border-subtle`) before adding shadow. Values are dark-theme defaults; light theme uses softer alphas ([THEME_LIGHT.md](./THEME_LIGHT.md)).

| Token | Value (dark) | Use |
|-------|--------------|-----|
| `--jj-shadow-none` | `none` | Flat lists, tables, logs, sidebars |
| `--jj-shadow-sm` | `0 1px 2px rgba(0,0,0,0.35)` | Subtle controls, compact menus |
| `--jj-shadow-md` | `0 4px 12px rgba(0,0,0,0.40)` | Popovers, dropdowns |
| `--jj-shadow-lg` | `0 8px 24px rgba(0,0,0,0.45)` | Modals, toasts |
| `--jj-shadow-focus` | `0 0 0 3px color-mix(in srgb, var(--jj-color-focus-ring) 45%, transparent)` | Focus ring companion |

Overlay scrim: `--jj-overlay-scrim` — dark `rgba(0,0,0,0.55)`, light `rgba(15,23,42,0.35)`. Modals use scrim + lg shadow.

Rules: no stacked colored glows (teal bloom, purple haze); only one elevated layer competing at a time; never use elevation to manufacture urgency.

---

## 6. Other token categories

| Category | Doc |
|----------|-----|
| Typography | [TYPOGRAPHY.md](./TYPOGRAPHY.md) |
| Motion | [ANIMATION.md](./ANIMATION.md) |

---

## 7. Icon size tokens

| Token | Value | Use |
|-------|-------|-----|
| `--jj-icon-sm` | `16px` | Inline, dense rows |
| `--jj-icon-md` | `20px` | Default controls |
| `--jj-icon-lg` | `24px` | Empty states, section anchors |

Stroke: **2px**, rounded caps/joins (Lucide). Colors follow text/icon semantic tokens; interactive hover → accent.

---

## 8. Z-index scale

| Token | Value | Layer |
|-------|-------|-------|
| `--jj-z-base` | `0` | Content |
| `--jj-z-sticky` | `100` | Sticky headers / status |
| `--jj-z-dropdown` | `200` | Menus |
| `--jj-z-popover` | `300` | Popovers |
| `--jj-z-toast` | `400` | Toasts |
| `--jj-z-modal` | `500` | Modals |
| `--jj-z-privacy` | `600` | Always-on privacy chrome if overlaying |

Keep the scale short — calm UI, few competing layers.

---

## 9. Usage rules

- Do **not** use purple nebula accents or glow stacks — off-brand.
- Teal envelope flap on the logo stays `#2DD4BF` — never retint.
- Prefer semantic tokens in components; primitives only in theme files.
- Pair status color with icon + text ([ACCESSIBILITY.md](./ACCESSIBILITY.md)).
