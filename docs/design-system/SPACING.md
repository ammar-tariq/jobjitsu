# Spacing Scale

Desktop-dense spacing for a native Career OS — tighter than consumer mobile apps, never cramped into illegibility.

---

## Base unit

**4px** base (`--jj-space-unit: 4px`).

All spacing tokens are multiples of 4 unless noted for hairline borders (`1px`).

---

## Scale

| Token | Value | Rem (16 root) | Typical use |
|-------|-------|---------------|-------------|
| `--jj-space-0` | `0` | 0 | Reset |
| `--jj-space-0.5` | `2px` | 0.125 | Icon optical tweaks |
| `--jj-space-1` | `4px` | 0.25 | Tight inline gaps |
| `--jj-space-2` | `8px` | 0.5 | Label → control; compact stacks |
| `--jj-space-3` | `12px` | 0.75 | Default control padding Y |
| `--jj-space-4` | `16px` | 1 | Default gap; list row padding X |
| `--jj-space-5` | `20px` | 1.25 | Section inner padding (compact) |
| `--jj-space-6` | `24px` | 1.5 | Panel padding; section gap |
| `--jj-space-8` | `32px` | 2 | View padding; major stacks |
| `--jj-space-10` | `40px` | 2.5 | Empty-state vertical rhythm |
| `--jj-space-12` | `48px` | 3 | Rare large separations |
| `--jj-space-16` | `64px` | 4 | Onboarding hero breathing room |

---

## Layout recipes

| Context | Token recipe |
|---------|--------------|
| App chrome / view padding | `--jj-space-6` to `--jj-space-8` |
| Sidebar item padding | `--jj-space-2` `--jj-space-3` |
| List row | `--jj-space-3` vertical, `--jj-space-4` horizontal |
| Form field stack | `--jj-space-2` label gap; `--jj-space-4` between fields |
| Button group gap | `--jj-space-2` |
| Modal padding | `--jj-space-6` |
| Toast padding | `--jj-space-3` `--jj-space-4` |
| Status bar / privacy pill inset | `--jj-space-2` `--jj-space-3` |

---

## Stack & inline utilities (conceptual)

| Utility | Meaning |
|---------|---------|
| `stack-xs` | gap `--jj-space-1` |
| `stack-sm` | gap `--jj-space-2` |
| `stack-md` | gap `--jj-space-4` |
| `stack-lg` | gap `--jj-space-6` |
| `inline-sm` | gap `--jj-space-2` |
| `inline-md` | gap `--jj-space-3` |

---

## Rules

1. Prefer scale tokens over arbitrary values (`13px`, `18px`).
2. Density first: default to one step tighter than “marketing site” padding.
3. Do not use cards with large padding to fake hierarchy — use type and `--jj-space-6` section gaps.
4. Touch/desktop hybrid: keep click targets ≥ 32px height even when visual padding is compact ([RESPONSIVE.md](./RESPONSIVE.md)).
