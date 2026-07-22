# Animation

Motion expresses **presence and hierarchy** — never celebration spam or urgency theater.

---

## Duration tokens

| Token | Value | Use |
|-------|-------|-----|
| `--jj-motion-duration-instant` | `0ms` | Reduced-motion snaps; toggles with no need |
| `--jj-motion-duration-micro` | `120ms` | Hover, press feedback |
| `--jj-motion-duration-fast` | `160ms` | Icon color, focus ring fade |
| `--jj-motion-duration-standard` | `200ms` | Panels, disclosure, row settle |
| `--jj-motion-duration-emphasis` | `280ms` | Toast enter |
| `--jj-motion-duration-slow` | `320ms` | Rare emphasis ceiling |
| `--jj-motion-duration-pulse` | `2400ms` | Soft status breath loop |

Exit animations use the same or shorter token as enter (prefer `--jj-motion-duration-fast` / `micro`).

---

## Easing tokens

| Token | Value | Use |
|-------|-------|-----|
| `--jj-motion-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter, hover |
| `--jj-motion-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Panels, layout |
| `--jj-motion-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit |
| `--jj-motion-ease-linear` | `linear` | Indeterminate progress only |

**Forbidden:** bounce, elastic, springy overshoot on productive surfaces.

---

## Approved motion patterns

Ship these app-wide (2–3 intentional patterns):

### 1. Status pulse (subtle)
- Target: Local LLM / agent ready badge  
- Property: opacity `0.85 → 1` or soft teal wash amplitude ≤ 8%  
- Duration: `--jj-motion-duration-pulse`  
- Loop: yes, very quiet  
- Reduced motion: static opacity `1`

### 2. Row settle
- Target: new queue / application rows  
- From: `translateY(-6px)` + opacity `0`  
- To: identity  
- Duration: `--jj-motion-duration-standard`  
- Easing: ease-out  
- Reduced motion: opacity-only ≤ 100ms or snap

### 3. Toast rise
- Target: toasts  
- From: `translateY(8px)` + opacity `0`  
- Duration: `--jj-motion-duration-emphasis`  
- Auto-dismiss: success/info ~4–6s; errors persist  
- Reduced motion: fade only or snap

---

## Interaction feedback

| Interaction | Motion |
|-------------|--------|
| Button hover | Color/background ≤ micro; no scale pop |
| Button press | Optional `opacity 0.92` micro |
| Toggle | Thumb travel standard; color ease-out |
| Modal open | Fade + 4px rise; no full-screen zoom |
| Skeleton | Soft opacity pulse ≤ pulse token; prefer static muted block under reduced motion |

---

## Disallowed

- Confetti, fireworks, full-screen flashes  
- Attention-looping on idle (except status pulse)  
- Parallax dashboards  
- Motion-only meaning (state must exist in text/icon)  
- Stagger cascades longer than ~200ms total for list mounts  

---

## Reduced motion

When `prefers-reduced-motion: reduce` (or OS equivalent):

| Instead of | Use |
|------------|-----|
| Translate enters | Opacity ≤ 100ms or snap |
| Pulse loops | Static |
| Progress indeterminate animation | Static bar + text status |

Token: components should read `--jj-motion-reduce: 1` (set by theme/media) and branch.

See [ACCESSIBILITY.md](./ACCESSIBILITY.md).
