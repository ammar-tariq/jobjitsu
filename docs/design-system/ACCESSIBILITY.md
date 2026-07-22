# Accessibility

Calm UI must remain usable. Target **WCAG 2.2 AA** (AAA where brand contrast already allows).

---

## Requirements

### Contrast

| Pairing | Bar |
|---------|-----|
| Text primary on canvas | ≥ 4.5:1 (prefer AAA) |
| Text secondary on canvas | ≥ 4.5:1 for small text |
| Teal accents on dark | Large/UI chrome OK at teal-400; small text → teal-500 or white |
| Focus ring | Visible 3:1 against adjacent colors |

Never rely on color alone for state — pair with icon + text.

### Focus

- Visible focus using `--jj-color-focus-ring` + `--jj-shadow-focus`  
- Never `outline: none` without replacement  
- `:focus-visible` preferred for pointer users  
- Logical tab order = reading order  
- Modals trap focus; restore on close  

### Keyboard

Must be fully operable without pointer:

- Queue review, approve/reject send  
- Preferences, agent pause/resume  
- Follow-up dismiss/send  
- Plugin enablement  

Document shortcuts in a calm panel — no vim-only traps as the only path.

### Semantics

- Real `<button>` / `<a>` / form controls — not clickable `div`s  
- Landmarks: navigation, main, complementary (sidebar), status  
- `JjAgentPrivacyPill` exposes accessible name (“Agent · On-device”)  
- Toasts: `role="status"` polite; errors `role="alert"` assertive  

### Motion

Honor `prefers-reduced-motion` per [ANIMATION.md](./ANIMATION.md).  
No strobing status lights. Meaning never motion-only.

### Forms

- Labels always visible (not placeholder-only)  
- Errors linked via `aria-describedby`  
- Required fields announced  

### Hit targets

Minimum **32×32px** for interactive controls on desktop; prefer 40px for primary destructive confirmation actions.

---

## Privacy & AT

Privacy chrome is not decorative: screen readers must announce model locality honestly (**Agent · On-device** vs user-configured remote).

---

## Testing checklist

- [ ] Keyboard-only pass on Horizon 1 flows  
- [ ] VoiceOver / NVDA smoke on Queue + Send approval  
- [ ] Contrast check for primary/secondary text both themes  
- [ ] Reduced-motion: toast + row settle degrade correctly  
- [ ] Error recovery text matches [../brand/ERROR_MESSAGES.md](../brand/ERROR_MESSAGES.md)  

Automated a11y checks in CI when UI lands ([../adr/0007-testing.md](../adr/0007-testing.md)).
