# Elevation

Soft, short shadows — presence without neon glow stacks. Prefer borders + surface color shifts over deep shadows.

---

## Philosophy

JobJitsu is a desktop tool on Midnight Ink / Soft Cloud. Elevation should feel like **paper in low light**, not a floating marketing card deck. Many layouts use hairline borders (`--jj-color-border-subtle`) with **no shadow**.

---

## Shadow tokens

Values below are **dark-theme defaults**; light theme uses softer black alphas ([THEME_LIGHT.md](./THEME_LIGHT.md)).

| Token | Value (dark) | Use |
|-------|--------------|-----|
| `--jj-shadow-none` | `none` | Flat lists, tables, logs |
| `--jj-shadow-sm` | `0 1px 2px rgba(0,0,0,0.35)` | Subtle controls, compact menus |
| `--jj-shadow-md` | `0 4px 12px rgba(0,0,0,0.40)` | Popovers, dropdowns |
| `--jj-shadow-lg` | `0 8px 24px rgba(0,0,0,0.45)` | Modals, toasts |
| `--jj-shadow-focus` | `0 0 0 3px color-mix(in srgb, var(--jj-color-focus-ring) 45%, transparent)` | Focus ring companion (with border) |

**Do not** stack multi-layer colored glows (teal bloom, purple haze).

---

## Layer roles

| Layer | Surface token | Shadow | Border |
|-------|---------------|--------|--------|
| Canvas | bg-canvas | none | — |
| Surface / sidebar | bg-surface | none | subtle right/left |
| Elevated (menu) | bg-elevated | sm–md | subtle |
| Toast | bg-elevated | lg | subtle |
| Modal | bg-elevated | lg | default |
| Privacy pill | privacy-pill-bg | none | privacy-pill-border |

---

## Overlay scrim

| Token | Dark | Light |
|-------|------|-------|
| `--jj-overlay-scrim` | `rgba(0,0,0,0.55)` | `rgba(15,23,42,0.35)` |

Modals use scrim + lg shadow. Keep scrim calm — no animated noise textures.

---

## Rules

1. Prefer **surface + border** hierarchy before adding shadow.  
2. Lists and agent logs: flat (`shadow-none`).  
3. Only one elevated layer competing at a time (menu **or** modal, not both fighting).  
4. No elevation used to manufacture urgency (e.g. jumping red badge shadows).
