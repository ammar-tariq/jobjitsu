# Responsive Rules

JobJitsu is **desktop-first**. Responsiveness means graceful window resizing and density — not a mobile social feed ([../product/NON_GOALS.md](../product/NON_GOALS.md)).

---

## Design viewport

| Token | Width | Intent |
|-------|-------|--------|
| `--jj-viewport-min` | `1024px` | Minimum supported usable width |
| `--jj-viewport-comfortable` | `1280px` | Default design width |
| `--jj-viewport-wide` | `1440px+` | Extra space → content, not empty chrome |

Below `--jj-viewport-min`: allow horizontal compression with collapsing sidebar; do not claim full mobile app support in Horizon 1.

---

## Breakpoints (window width)

| Name | Range | Layout |
|------|-------|--------|
| `compact` | `< 1024px` | Sidebar collapsed to icon rail; single content column |
| `standard` | `1024–1439px` | Sidebar + main (default) |
| `wide` | `≥ 1440px` | Sidebar + main + optional secondary inspector (details) |

Do not invent phone/tablet marketing breakpoints for the desktop shell.

---

## Layout structure

```
┌──────────────────────────────────────────────┐
│ Title / window chrome (OS)                   │
├────────┬─────────────────────────────────────┤
│ Nav    │ Main (one job per view)             │
│        │                                     │
│        ├─────────────────────────────────────┤
│        │ Status: Local LLM · agent · toasts  │
└────────┴─────────────────────────────────────┘
```

| Region | Standard width | Compact behavior |
|--------|----------------|------------------|
| Nav sidebar | `220–240px` | `56–64px` icon rail |
| Main | `fluid` | `fluid` |
| Inspector (wide only) | `320–360px` | Hidden; use route/modal |

View padding: `--jj-space-6` / `--jj-space-8` — reduce one step in compact.

---

## Density modes

| Mode | When | Spacing / type |
|------|------|----------------|
| `comfortable` | Default | Standard spacing + type ramp |
| `compact` | User preference or small window | Use one step smaller padding; keep body ≥ 14px |

Density must not drop below a11y hit targets (32px).

---

## Content adaptation

| Pattern | Rule |
|---------|------|
| Tables / logs | Horizontal scroll inside panel — don’t squash mono |
| List rows | Truncate titles; keep primary action visible |
| Modals | Max width `480–560px`; full-width only in compact |
| Empty states | Stack illustration above copy; CTA full-width in compact |
| Dual panels | Stack vertically in compact |

---

## Typography responsiveness

- Do **not** fluid-scale headings with `vw` in the app chrome (unstable for desktop tools).  
- Optional: drop H1 → visual H2 size in compact title bars only.  
- Job description reading pane: max line length ~70–80 characters for calm reading.

---

## Pointer & input

- Optimize for mouse/trackpad + keyboard.  
- Touch-capable laptops: keep 32px minimum targets.  
- No hover-only critical actions — always offer click/keyboard equivalent.

---

## What we won’t do

- Mobile-first infinite job feeds  
- Hamburger-only navigation as the primary desktop IA  
- Hiding Local LLM / privacy chrome to “save space”  
- Rearranging into a dashboard of competing cards at wide widths  

---

## Implementation hooks

```
data-layout="compact|standard|wide"
data-density="comfortable|compact"
data-theme="dark|light"
```

Host may set layout from window width; density from preferences.
