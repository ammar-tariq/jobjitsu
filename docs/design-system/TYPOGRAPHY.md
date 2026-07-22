# Typography

Readable, modern, open-source type for a calm desktop tool.

---

## Families

| Token | Family | Role | License |
|-------|--------|------|---------|
| `--jj-font-sans` | Inter, ui-sans-serif, system-sans | UI | SIL OFL 1.1 |
| `--jj-font-mono` | "JetBrains Mono", ui-monospace, monospace | Logs, code, paths | SIL OFL 1.1 |

**Weights:** 400 Regular, 500 Medium, 600 Semi-bold, 700 Bold.  
Do not ship thin (100–300) UI text — fails calm readability.

---

## Type ramp

| Token | Size | Line height | Weight | Letter-spacing | Use |
|-------|------|-------------|--------|----------------|-----|
| `--jj-text-display` | 32px | 40px | 700 | `-0.02em` | Rare marketing / about |
| `--jj-text-h1` | 32px | 40px | 700 | `-0.02em` | App title, landing hero in-app |
| `--jj-text-h2` | 24px | 32px | 600 | `-0.015em` | Section headers |
| `--jj-text-h3` | 20px | 28px | 500 | `-0.01em` | Card/modal titles |
| `--jj-text-h4` | 16px | 24px | 600 | `0` | Subsection / list group titles |
| `--jj-text-body` | 16px | 24px | 400 | `0` | Main content, job descriptions |
| `--jj-text-body-emphasis` | 16px | 24px | 500 | `0` | Emphasized body |
| `--jj-text-small` | 14px | 20px | 400 | `0` | Meta, timestamps, labels |
| `--jj-text-small-emphasis` | 14px | 20px | 500 | `0` | Compact button labels |
| `--jj-text-tiny` | 12px | 16px | 500 | `0.01em` | Badges, privacy pill, overlines |
| `--jj-text-code` | 14px | 20px | 400 | `0` | Mono blocks / logs |
| `--jj-text-code-sm` | 12px | 16px | 400 | `0` | Dense log lines |

Root: assume `16px` browser/desktop default. Do not scale type purely with window zoom hacks — use [RESPONSIVE.md](./RESPONSIVE.md) density modes if needed.

---

## Semantic text styles

| Style name | Ramp token | Color token |
|------------|------------|-------------|
| `title.page` | h1 | text-primary |
| `title.section` | h2 | text-primary |
| `title.panel` | h3 | text-primary |
| `body.default` | body | text-primary |
| `body.meta` | small | text-secondary |
| `label.field` | small-emphasis | text-secondary |
| `code.log` | code | text-primary on muted bg |
| `badge.privacy` | tiny | privacy-pill-fg |

---

## UI copy mechanics

- **Sentence case** for headings, buttons, toasts (see brand writing guide).
- **JobJitsu** always cased correctly in UI strings.
- Truncation: single-line ellipsis for list titles; dual-line max for descriptions in dense rows.
- Tabular numbers for counts (`font-variant-numeric: tabular-nums`) in queue badges and weekly throw counts.

---

## Rules

1. One primary sans — do not mix Inter with decorative display fonts in the app chrome.
2. Metaphor stays in microcopy, not in oversized display type every screen.
3. Minimum body text 14px in productive surfaces; prefer 16px for long job descriptions.
4. Links use `--jj-color-text-link` plus underline or weight — color alone is insufficient.
