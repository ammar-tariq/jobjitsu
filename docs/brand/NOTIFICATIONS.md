# JobJitsu Notifications

Notifications are **polite taps on the shoulder**, not sirens. They protect attention the way the product protects privacy.

---

## Principles

1. **Timely, not constant.** Batch when possible; never gamify open rates.
2. **Actionable or clearly informational.** If nothing to do, keep it quiet and dismissible.
3. **Calm urgency.** Follow-ups use Amber caution — not error red — unless something broke.
4. **Respect focus.** No sound by default; optional user toggle.
5. **Privacy-safe content.** Notification text should not leak résumé contents to OS previews when avoidable; prefer “Follow-up ready” over pasted email bodies.

---

## Channels

| Channel | Use for | Avoid |
|---------|---------|-------|
| **In-app toast** | Immediate result of a user action | Long policy text |
| **In-app inbox / bell** | Follow-ups, agent needs review | Marketing tips |
| **OS notification** | Time-sensitive follow-up while app backgrounded | Every queue tick |
| **Status bar badge** | Local LLM / agent readiness | Vanity counts |

---

## Severity → Presentation

| Level | Color | When |
|-------|-------|------|
| Info | Teal / neutral | Status, tips, loading complete |
| Success | Jade | Send confirmed, save confirmed |
| Caution | Amber | Follow-up due, approval needed |
| Error | Clear error treatment | Failures — see [ERROR_MESSAGES.md](./ERROR_MESSAGES.md) |

---

## Copy Patterns

### Needs review (agent)
**Title:** Application ready for review  
**Body:** Tailored draft is queued. Approve to send — you’re still in control.  
**Action:** Review  

### Follow-up due
**Title:** Follow-up ready  
**Body:** Time to gently nudge — a polite reminder is ready.  
**Action:** Open reminder  

### Local LLM ready
**Title:** On-device model ready  
**Body:** Warming complete. No data leaves this dojo.  
**Action:** none / Dismiss  

### Preferences saved
**Title:** Preferences saved  
**Body:** The agent will use these on your next run.  
**Action:** none  

### Approval required before send
**Title:** Approval needed  
**Body:** Send is blocked until you approve. Your rules, your signal.  
**Action:** Review  

---

## Frequency & Batching

- Collapse repeated agent progress into one line: “3 applications queued” — not three toasts.
- Follow-up OS notifications: at most one per role per reminder window.
- Never notify for marketing, “streaks”, or inactivity shaming.

---

## Behavior

- Toasts: auto-dismiss success/info (~4–6s); keep errors until dismissed or recovered.
- Live regions: polite for info/success; assertive for errors.
- Motion: toast rise per [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) § Motion; honor reduced motion.

---

## Don’ts

- Red badges for benign counts
- “You’re falling behind!” inactivity pushes
- Exclamation-stack titles (“Urgent!!!”)
- Sound + banner + badge all at once for one event
