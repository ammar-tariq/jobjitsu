# JobJitsu Error Messages

Errors are **honest recovery paths**. No blame, no metaphor fog, no stack traces in the hero line.

---

## Principles

1. **Say what failed** in human language.
2. **Say what to try next** when possible.
3. **Keep technical detail secondary** (log link / expandable).
4. **Never joke** about lost applications or privacy failures.
5. **Never imply the user is the bug.**

---

## Anatomy

```
Title — what went wrong (≤ 6–8 words)
Body — one or two sentences: cause (if known) + next step
Primary action — Retry / Open log / Fix settings
Secondary — Cancel / Dismiss
```

Optional: “View details” revealing sanitized log excerpt (JetBrains Mono).

---

## Tone

| Do | Don’t |
|----|-------|
| “Couldn’t send this application.” | “Send exploded 💥” |
| “Check the link, or try again.” | “Invalid state / err_0x” as title |
| “Your draft is still saved.” | “You broke the agent.” |
| “Nothing was uploaded to the cloud.” | “lol network” |

Metaphor: **off** in error titles. Plain language only.

---

## Patterns

### Network / board unreachable
**Title:** Couldn’t reach that board  
**Body:** Check the link and your connection, then try again. Your draft is still here.  
**Actions:** Retry · Open draft  

### On-device model failed to load
**Title:** Agent didn’t start  
**Body:** Confirm the model path in preferences. Nothing left this machine.  
**Actions:** Open preferences · Retry  

### Send failed after approval
**Title:** Application couldn’t be sent  
**Body:** We stopped before assuming success. Review the log, then retry when ready.  
**Actions:** View log · Retry  

### Permission / path denied
**Title:** Can’t read that file  
**Body:** Choose a resume JobJitsu is allowed to access on this device.  
**Actions:** Choose file  

### Agent interrupted
**Title:** Agent paused  
**Body:** The run stopped before finishing. Resume when you want to continue — your queue is intact.  
**Actions:** Resume · View queue  

### Unknown / unexpected
**Title:** Something went wrong  
**Body:** Try again. If it keeps happening, open the log and share it when asking for help.  
**Actions:** Retry · View log  

---

## Mapping System Errors

| Internal signal | User title direction |
|-----------------|----------------------|
| Timeout | “Timed out — try again” |
| Auth to external board | “Sign-in needed for that board” |
| Validation | “Missing {field} — add it to continue” |
| Disk / FS | “Can’t access that file” |
| Model OOM / crash | “On-device model ran out of resources” |

---

## Privacy Failures (Special Care)

If a send or export might have partially left the device:

- Be explicit about **what is known** and **what is unknown**.
- Prefer: “Send may not have completed. Check the board before retrying.”
- Never falsely reassure (“Definitely not sent”) without evidence.

---

## Accessibility

- Announce via assertive live region.
- Color + icon + text (not color alone).
- Focus moves to the error container or primary recovery action.

---

## Don’ts

- Raw exceptions as the only message
- “Please contact support” with no local recovery
- Error red for amber caution cases (pending follow-up ≠ error)
- Humor that punches down on the user’s job search stress
