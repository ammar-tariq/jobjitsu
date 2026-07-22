# Border Radius

Subtle rounding — native tool, not toy. Prefer small radii; reserve pills for privacy/status chrome only.

---

## Scale

| Token | Value | Use |
|-------|-------|-----|
| `--jj-radius-none` | `0` | Full-bleed panels, tables flush to edge |
| `--jj-radius-sm` | `4px` | Inputs, chips (compact), inner elements |
| `--jj-radius-md` | `6px` | Buttons, list row hover, menus |
| `--jj-radius-lg` | `8px` | Panels, dialogs, toasts |
| `--jj-radius-xl` | `12px` | Rare large empty-state frames |
| `--jj-radius-pill` | `999px` | Agent · On-device pill, status dots container |

---

## Component defaults

| Component | Radius |
|-----------|--------|
| Button | `--jj-radius-md` |
| Input / select / textarea | `--jj-radius-sm` |
| Checkbox / switch track | sm / pill respectively |
| Menu / popover | `--jj-radius-lg` |
| Toast | `--jj-radius-lg` |
| Modal | `--jj-radius-lg` |
| List row | `--jj-radius-md` (hover/selection bg) |
| Agent · On-device pill | `--jj-radius-pill` |
| App window | OS-controlled (squircle icon only) |

---

## Rules

1. Do not default everything to `rounded-full` — pills are for status/privacy, not every CTA.
2. Nested radii: inner ≤ outer (e.g. input sm inside panel lg).
3. Tables and logs stay closer to `--jj-radius-none` / `sm` for density.
4. Logo clear-space rules are separate — do not round-crop the Leverage Belt oddly.
