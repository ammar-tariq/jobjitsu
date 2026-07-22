# Desktop Architecture

> Native, light, fast shell for a calm Career OS — not a web SaaS in a trench coat.

Parent: [OVERVIEW.md](./OVERVIEW.md) · Brand UI: [../brand/DESIGN_SYSTEM.md](../brand/DESIGN_SYSTEM.md)

---

## Goals

- Desktop-first experience with system tray/status, keyboard flows, and local resources.
- Clear split: **host** (privileged) vs **ui** (presentation).
- Privacy chrome always visible (**Agent · On-device** / belt mark).
- One job per view; dark mode first (Midnight Ink + Electric Teal).

---

## Process model

```
┌──────────────────────────────────────────┐
│ Host (main / native)                     │
│  storage · ai runtime · agent · scheduler│
│  plugin/extension loader · send egress   │
│  event bus · OS notifications            │
└─────────────────┬────────────────────────┘
                  │ narrow IPC / bridge
┌─────────────────▼────────────────────────┐
│ UI (renderer)                            │
│  Applications · Queue · Follow-ups       │
│  Preferences · Agent · Timeline · Logs   │
│  Jj* components · a11y · reduced motion  │
└──────────────────────────────────────────┘
```

**Law:** Renderer never opens arbitrary network sockets for career payloads. All egress goes host → `send`.

---

## Host responsibilities

| Concern | Behavior |
|---------|----------|
| Persistence | Own DB/files under user data dir |
| Model lifecycle | Start/stop local LLM adapters; emit Ai.* events |
| Agent control | Start/pause/resume; enforce preferences |
| Scheduler | Local jobs; respect quiet hours |
| Egress | Sole owner of send channels |
| Notifications | OS + in-app; sound off by default |
| Updates | App updates ≠ uploading user résumés |

---

## UI responsibilities

| Concern | Behavior |
|---------|----------|
| Navigation | Product nouns; sentence case |
| Review ritual | Approve / reject queue items |
| Trust chrome | **Agent · On-device** status always glanceable |
| Copy | Brand voice; errors plain; success quiet |
| Motion | Status pulse, row settle, toast rise only |
| A11y | Focus rings, live regions, keyboard paths |

---

## IPC surface (normative catalog — conceptual shapes)

**Policy:** Deny-by-default. The table is the H1-oriented allowlist. Host may omit a command until its story ships; **unlisted commands are denied**. Package surfaces may be richer for host-internal use without exposing every method to UI.

Commands (UI → host). Request/response are typed in the host.

| Command | Purpose | Notes |
|---------|---------|--------|
| `preferences.get` / `preferences.set` | Read/write policy | Emits `Preferences.Changed` |
| `identity.getProfile` / `importResume` / `listKnowledge` | Identity / Knowledge | |
| `applications.createDraft` / `update` / `list` / `setStage` / `findDuplicates` | Craft | |
| `agent.startWorkflow` / `pause` / `resume` | Workflow / Task Queue | Never Send |
| `agent.getTaskQueueSnapshot` | Progress chrome | Calm counts only |
| `queue.list` / `enqueue` / `approve` / `reject` / `clear` | Review Queue | `approve` required before send when policy on |
| `send.approveAndSend` | Egress | Preferred; maps to send package; honest result |
| `discovery.syncSource` | Job Provider sync | |
| `followups.list` / `dismiss` / `send` | Follow-ups | `send` still via send package |
| `timeline.query` | Trust / craft history | Sanitized |
| `ai.getStatus` | Badge / readiness | No `complete` from UI |
| `plugins.list` / `enable` / `disable` | Agent skills | |
| `extensions.list` / `enable` / `disable` | Host contributions | May stub until H3–H4 |
| `logs.tail` | Sanitized diagnostics | No prompt bodies by default |

Queries / subscriptions (host → UI):

- Event stream (batched) from [EVENT_SYSTEM.md](./EVENT_SYSTEM.md)
- Agent · On-device / model status for badge
- Notification intents (shell-owned)

Bridge: no generic `eval`, no raw `fs` from UI.

**AC:** UI cannot invoke AI Provider `complete`/`embed`; only host handlers may.

---

## Window & information architecture

Primary areas (Horizon 1):

1. **Applications** — craft list & drafts  
2. **Queue** — review before leave  
3. **Follow-ups** — polite calendar  
4. **Agent** — status, pause, recent preparative activity  
5. **Preferences** — model path, approval gates, quiet hours  
6. **Timeline / Logs** — inspectability  

Avoid multi-dashboard “mission control.” Deep links open one purpose.

---

## Privacy chrome

- Status bar: **Agent · On-device** pill (indigo/teal) reflecting real adapter health.
- Optional belt mark for idle agent (“waiting for your signal”) — microcopy from brand.
- Egress confirmation UI must state destination class plainly.

---

## OS integration

| Integration | Use |
|-------------|-----|
| Tray | Quiet presence; open queue / pause agent |
| OS notifications | Follow-up due, approval needed — batched, no marketing |
| File associations | Import résumé (user-initiated) |
| Secure storage | Tokens for boards only if user connects; never résumé cloud sync |

---

## Performance posture

- Prefer lazy-loading heavy AI runtimes until needed.
- Batch UI event delivery.
- Respect machine resources — local LLM may be optional until configured.
- Reduced motion: snap states; meaning not motion-only.

---

## Security posture

- Context isolation between host and UI.
- Capability-gated plugins/extensions.
- No analytics SDKs that exfiltrate career content.
- Crash reports, if ever enabled, strip PII and are opt-in.

---

## Mapping to monorepo

- `app/host` — process entry, wiring packages  
- `app/ui` — views composing `packages/ui`  
- Domain behavior remains in `packages/*` for testability without GUI
