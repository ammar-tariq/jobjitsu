# Component Variants

Production variants for core `Jj*` primitives. Naming: role via props — never `TealButton`.

Pattern: `Jj{Domain}{Element}` · states: `default | hover | focus | active | disabled | loading | success | caution | error`

---

## Button — `JjButton`

| Variant | Use | Visual |
|---------|-----|--------|
| `primary` | Main CTA (Approve send, Save) | Accent fill, text-on-accent |
| `secondary` | Secondary actions | Surface + border-default |
| `ghost` | Tertiary / toolbars | Transparent; hover muted |
| `danger` | Destructive (Delete draft) | Danger fill or outline |
| `success` | Rare explicit success action | Jade — prefer toast instead |

| Size | Height | Type | Pad X |
|------|--------|------|-------|
| `sm` | 28px | small-emphasis | space-3 |
| `md` | 32px | small-emphasis | space-4 |
| `lg` | 40px | body-emphasis | space-5 |

Radius: `md`. Loading: spinner + disabled semantics. Icons: `icon-sm`/`md`, gap `space-2`.

---

## Icon button — `JjIconButton`

Same variants as ghost/secondary by default. Hit target ≥ 32×32. Must have accessible name.

---

## Input — `JjInput` / `JjTextarea` / `JjSelect`

| State | Border | Ring |
|-------|--------|------|
| default | border-default | — |
| hover | border-strong | — |
| focus | accent | focus-ring |
| error | danger | danger muted |
| disabled | subtle | — muted text |

Size `md` default (height 32). Radius `sm`. Label: `label.field` above, gap `space-2`.

---

## Badge / pill — `JjBadge`

| Tone | Use |
|------|-----|
| `neutral` | Counts, tags |
| `accent` | Highlights |
| `success` | Sent |
| `caution` | Follow-up due, pending |
| `danger` | Failed send |

| Size | Type |
|------|------|
| `sm` | tiny |
| `md` | small |

Privacy: use `JjLocalLlmPill` (not generic badge) for Local LLM status.

---

## Local LLM pill — `JjLocalLlmPill`

- Radius: pill  
- Colors: privacy-pill-* tokens  
- Text: “Local LLM” / “Ready” / “Unavailable” (honest)  
- Optional status pulse when ready  
- Always meaningful to AT (`aria-label`)

Remote user-configured model: different label — never spoof “Local”.

---

## Alert / callout — `JjAlert`

| Tone | Live region | Use |
|------|-------------|-----|
| `info` | polite | Neutral tips |
| `success` | polite | Quiet confirmations |
| `caution` | polite | Follow-up / approval needed |
| `danger` | assertive | Errors with recovery |

Structure: icon + title + body + optional action. No metaphor in danger titles.

---

## Toast — `JjToast`

Mirrors alert tones. Elevation `lg`. Motion: toast rise. One primary action max.

---

## List row — `JjListRow` / `JjApplicationQueueRow`

| State | Background |
|-------|------------|
| default | transparent |
| hover | bg-muted / alpha wash |
| selected | accent-muted |
| focus-visible | focus ring |

Padding: space-3 / space-4. Row settle on insert. No card chrome required.

---

## Tabs — `JjTabs`

Underline or subtle segmented control. Active: text-primary + accent indicator. Avoid pill-cluster tab bars.

---

## Switch / checkbox — `JjSwitch` / `JjCheckbox`

Accent when on. Label describes enabled state (“Require approval before send”).

---

## Modal / dialog — `JjModal`

Radius `lg`, shadow `lg`, scrim. Title h3. Primary + secondary actions. Focus trap; Esc closes when safe.

---

## Empty state — `JjEmptyState`

Icon/illustration `icon-lg` + title + one sentence + one primary CTA. See brand empty-state copy.

---

## Agent status — `JjAgentStatusBadge`

Idle / running / paused / failed. Idle copy may use brand microcopy; failed stays plain.

---

## Variant rules

1. Encode **role** (`primary`, `caution`), not color names.  
2. Destructive always `danger` + explicit label (“Delete draft”).  
3. Don’t invent streak or urgency variants.  
4. Compose domains: `JjFollowUpCard` uses `JjBadge` tone=`caution`, not a one-off orange card system.
