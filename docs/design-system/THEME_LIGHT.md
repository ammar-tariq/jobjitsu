# Light Theme

Light mode is a **deliberate switch**, not the default. Soft Cloud canvas, Slate text, Deep Indigo emphasis, Electric Teal accent.

Set `data-theme="light"`.

---

## Semantic → primitive map

### Surfaces

| Semantic | Value |
|----------|-------|
| `--jj-color-bg-canvas` | `--jj-color-cloud-50` (`#F8FAFC`) |
| `--jj-color-bg-surface` | `--jj-color-white` |
| `--jj-color-bg-elevated` | `--jj-color-white` |
| `--jj-color-bg-muted` | `--jj-color-slate-100` |
| `--jj-color-bg-inverse` | `--jj-color-indigo-900` |

### Text

| Semantic | Value |
|----------|-------|
| `--jj-color-text-primary` | `--jj-color-slate-800` |
| `--jj-color-text-secondary` | `--jj-color-slate-500` |
| `--jj-color-text-tertiary` | `#94A3B8` |
| `--jj-color-text-inverse` | `--jj-color-white` |
| `--jj-color-text-link` | `--jj-color-teal-600` |
| `--jj-color-text-on-accent` | `--jj-color-indigo-950` |

Links use **teal-600** on light for AA body-size text. Large links may use teal-500.

### Borders & focus

| Semantic | Value |
|----------|-------|
| `--jj-color-border-subtle` | `--jj-alpha-black-06` |
| `--jj-color-border-default` | `--jj-color-slate-200` |
| `--jj-color-border-strong` | `--jj-color-slate-300` |
| `--jj-color-focus-ring` | `--jj-color-teal-500` |

### Actions & status

| Semantic | Value |
|----------|-------|
| `--jj-color-accent` | `--jj-color-teal-500` |
| `--jj-color-accent-hover` | `--jj-color-teal-400` |
| `--jj-color-accent-pressed` | `--jj-color-teal-600` |
| `--jj-color-accent-muted` | `color-mix(in srgb, #14B8A6 12%, white)` |
| `--jj-color-success` | `--jj-color-jade-600` |
| `--jj-color-success-muted` | `color-mix(in srgb, #10B981 12%, white)` |
| `--jj-color-caution` | `--jj-color-amber-600` |
| `--jj-color-caution-muted` | `color-mix(in srgb, #F59E0B 14%, white)` |
| `--jj-color-danger` | `--jj-color-rose-600` |
| `--jj-color-danger-muted` | `color-mix(in srgb, #F43F5E 12%, white)` |

Primary CTA fill may use teal-500 with indigo-950 label, or indigo-900 fill with white label for maximum solemn primary — prefer **teal primary** for brand continuity; use indigo fill for rare inverse marketing blocks only.

### Privacy pill

| Semantic | Value |
|----------|-------|
| `--jj-color-privacy-pill-bg` | `color-mix(in srgb, #14B8A6 10%, white)` |
| `--jj-color-privacy-pill-fg` | `--jj-color-indigo-900` |
| `--jj-color-privacy-pill-border` | `color-mix(in srgb, #14B8A6 40%, transparent)` |

### Elevation (light)

| Token | Value |
|-------|-------|
| `--jj-shadow-sm` | `0 1px 2px rgba(15,23,42,0.06)` |
| `--jj-shadow-md` | `0 4px 12px rgba(15,23,42,0.08)` |
| `--jj-shadow-lg` | `0 8px 24px rgba(15,23,42,0.12)` |
| `--jj-overlay-scrim` | `rgba(15,23,42,0.35)` |

---

## Contrast notes

- Indigo-900 / Slate-800 on Soft Cloud → AAA for text  
- Avoid teal-400 for small text on white — use teal-600 / teal-500  
- Hairlines must remain visible on white elevated surfaces  

---

## Chrome checklist

- [ ] Same **Agent · On-device** pill component; light colors from this map  
- [ ] Sidebars: white surface on cloud canvas (subtle border)  
- [ ] Do not introduce warm cream or terracotta “AI template” palettes  
- [ ] Illustrations: teal stroke on Soft Cloud  

---

## Pairing

Dark (default): [THEME_DARK.md](./THEME_DARK.md)
