# JobJitsu Design System (Production)

> Calm confidence, desktop density, dark mode first.  
> Brand source: [../brand/BRAND_GUIDELINES.md](../brand/BRAND_GUIDELINES.md) · Voice: [../brand/VOICE_AND_TONE.md](../brand/VOICE_AND_TONE.md)

This folder is the **production-ready** visual and interaction system for `packages/ui` and `app/ui`. Token names are implementation-ready; this documentation is the source of truth until code lands.

---

## Principles

1. **Native feel, local power** — Tight desktop density; soft elevation; no neon SaaS glow.
2. **Dark mode first** — Default theme is Midnight; light is a deliberate switch.
3. **One job per view** — Hierarchy via type and space, not card stacks everywhere.
4. **Privacy visible** — **Agent · On-device** pill and status chrome are first-class components.
5. **Calm motion** — Presence and hierarchy only; honor reduced motion.
6. **WCAG AA minimum** — AAA where brand contrast already allows.

---

## Document map

| Doc | Topic |
|-----|--------|
| [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) | Color, semantic, and alias tokens |
| [SPACING.md](./SPACING.md) | Spacing scale |
| [TYPOGRAPHY.md](./TYPOGRAPHY.md) | Fonts, type ramp, tracking |
| [BORDER_RADIUS.md](./BORDER_RADIUS.md) | Radius scale |
| [ANIMATION.md](./ANIMATION.md) | Duration, easing, approved motions |
| [ELEVATION.md](./ELEVATION.md) | Shadows and layers |
| [COMPONENT_VARIANTS.md](./COMPONENT_VARIANTS.md) | Core `Jj*` variants |
| [THEME_DARK.md](./THEME_DARK.md) | Dark (default) theme map |
| [THEME_LIGHT.md](./THEME_LIGHT.md) | Light theme map |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | A11y requirements |
| [RESPONSIVE.md](./RESPONSIVE.md) | Desktop window & density rules |

Related brand docs (copy, icons, empty states): [../brand/DESIGN_SYSTEM.md](../brand/DESIGN_SYSTEM.md)

---

## Token naming convention

```
--jj-{category}-{role}-{variant?}
```

Examples: `--jj-color-bg-canvas`, `--jj-space-4`, `--jj-radius-md`, `--jj-motion-duration-standard`

Semantic tokens (preferred in components) reference primitive tokens. Themes swap semantic aliases; components should rarely hard-code primitives.
