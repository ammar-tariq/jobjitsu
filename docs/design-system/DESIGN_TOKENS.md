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
| `--jj-color-privacy-pill-bg` | Local LLM pill background |
| `--jj-color-privacy-pill-fg` | Local LLM pill text |
| `--jj-color-privacy-pill-border` | Local LLM pill border |

---

## 3. Non-color token categories

| Category | Doc |
|----------|-----|
| Spacing | [SPACING.md](./SPACING.md) |
| Typography | [TYPOGRAPHY.md](./TYPOGRAPHY.md) |
| Radius | [BORDER_RADIUS.md](./BORDER_RADIUS.md) |
| Motion | [ANIMATION.md](./ANIMATION.md) |
| Elevation | [ELEVATION.md](./ELEVATION.md) |

---

## 4. Icon size tokens

| Token | Value | Use |
|-------|-------|-----|
| `--jj-icon-sm` | `16px` | Inline, dense rows |
| `--jj-icon-md` | `20px` | Default controls |
| `--jj-icon-lg` | `24px` | Empty states, section anchors |

Stroke: **2px**, rounded caps/joins (Lucide). Colors follow text/icon semantic tokens; interactive hover → accent.

---

## 5. Z-index scale

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

## 6. Usage rules

- Do **not** use purple nebula accents or glow stacks — off-brand.
- Teal envelope flap on the logo stays `#2DD4BF` — never retint.
- Prefer semantic tokens in components; primitives only in theme files.
- Pair status color with icon + text ([ACCESSIBILITY.md](./ACCESSIBILITY.md)).
