# Dark Theme (Default)

JobJitsu **defaults to dark**. Midnight Ink canvas, Deep Indigo surfaces, Electric Teal accent.

Set `data-theme="dark"` (or OS preference when user selects System and OS is dark).

---

## Semantic → primitive map

### Surfaces

| Semantic | Value |
|----------|-------|
| `--jj-color-bg-canvas` | `--jj-color-indigo-950` (`#0B0A1A`) |
| `--jj-color-bg-surface` | `--jj-color-indigo-900` (`#1E1B4B`) |
| `--jj-color-bg-elevated` | `#25224F` (indigo-900 lifted ~4%) |
| `--jj-color-bg-muted` | `color-mix(in srgb, white 6%, var(--jj-color-indigo-950))` |
| `--jj-color-bg-inverse` | `--jj-color-cloud-50` |

### Text

| Semantic | Value |
|----------|-------|
| `--jj-color-text-primary` | `--jj-color-white` |
| `--jj-color-text-secondary` | `--jj-color-slate-500` |
| `--jj-color-text-tertiary` | `#94A3B8` (slate-400) |
| `--jj-color-text-inverse` | `--jj-color-slate-800` |
| `--jj-color-text-link` | `--jj-color-teal-400` |
| `--jj-color-text-on-accent` | `--jj-color-indigo-950` |

### Borders & focus

| Semantic | Value |
|----------|-------|
| `--jj-color-border-subtle` | `--jj-alpha-white-06` |
| `--jj-color-border-default` | `color-mix(in srgb, white 12%, transparent)` |
| `--jj-color-border-strong` | `color-mix(in srgb, white 18%, transparent)` |
| `--jj-color-focus-ring` | `--jj-color-teal-400` |

### Actions & status

| Semantic | Value |
|----------|-------|
| `--jj-color-accent` | `--jj-color-teal-400` |
| `--jj-color-accent-hover` | `#5EEAD4` (teal-300) |
| `--jj-color-accent-pressed` | `--jj-color-teal-500` |
| `--jj-color-accent-muted` | `--jj-alpha-teal-15` |
| `--jj-color-success` | `--jj-color-jade-500` |
| `--jj-color-success-muted` | `color-mix(in srgb, #10B981 18%, transparent)` |
| `--jj-color-caution` | `--jj-color-amber-500` |
| `--jj-color-caution-muted` | `color-mix(in srgb, #F59E0B 18%, transparent)` |
| `--jj-color-danger` | `--jj-color-rose-500` |
| `--jj-color-danger-muted` | `color-mix(in srgb, #F43F5E 18%, transparent)` |

### Privacy pill

| Semantic | Value |
|----------|-------|
| `--jj-color-privacy-pill-bg` | `color-mix(in srgb, var(--jj-color-teal-400) 12%, var(--jj-color-indigo-900))` |
| `--jj-color-privacy-pill-fg` | `--jj-color-teal-400` |
| `--jj-color-privacy-pill-border` | `color-mix(in srgb, var(--jj-color-teal-400) 35%, transparent)` |

### Elevation (dark)

| Token | Value |
|-------|-------|
| `--jj-shadow-sm` | `0 1px 2px rgba(0,0,0,0.35)` |
| `--jj-shadow-md` | `0 4px 12px rgba(0,0,0,0.40)` |
| `--jj-shadow-lg` | `0 8px 24px rgba(0,0,0,0.45)` |
| `--jj-overlay-scrim` | `rgba(0,0,0,0.55)` |

---

## Contrast notes

- White / primary text on Midnight → AAA  
- Teal-400 on Midnight → OK for large text & UI chrome; for **small teal body text** prefer `--jj-color-teal-500` (`#14B8A6`) or white  
- Primary buttons: teal fill + indigo-950 label for strong contrast  
- Never use teal-400 alone as the only affordance for a link — add underline or weight  

---

## Chrome checklist

- [ ] **Agent · On-device** pill visible in status bar  
- [ ] Scrollbars muted (neutral, not accent)  
- [ ] Selection color: accent-muted  
- [ ] Code/log panels use bg-muted + mono  
- [ ] No purple gradient washes  

---

## Pairing

Light map: [THEME_LIGHT.md](./THEME_LIGHT.md)
