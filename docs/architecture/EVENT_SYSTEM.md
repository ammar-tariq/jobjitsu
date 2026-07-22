# Event System

> Local, typed, calm domain events — the nervous system of the Career OS.

Parent: [OVERVIEW.md](./OVERVIEW.md) · Packages: [PACKAGE_BOUNDARIES.md](./PACKAGE_BOUNDARIES.md)

---

## Purpose

Events let Agent, Queue, Send, Follow-ups, Timeline, Scheduler, and UI stay loosely coupled while preserving:

- **Inspectability** — progress is observable without a cockpit of polling.
- **Privacy audit** — egress-related events feed Timeline (“what left / what stayed”).
- **Calm UX** — UI subscribes and batches; no siren for every tick.

Events **never** stream career payloads to a JobJitsu cloud by default.

---

## Design laws

1. **On-device bus** — in-process (host) event bus; optional durable log in Timeline storage.
2. **Typed contracts** — event names and payloads live in `packages/events`.
3. **PII minimization** — payloads carry IDs and coarse metadata; avoid résumé bodies on high-volume events.
4. **Batching at the edge** — UI and notifications collapse bursts (“3 applications queued”).
5. **No urgency semantics** — event types do not encode streaks, guilt, or “you’re behind.”
6. **Egress events are special** — send attempted/succeeded/failed/unknown always recorded.
7. **UI never calls AI** — the renderer subscribes to facts; the host invokes providers inside event handlers.

### Startup cascade (demo)

```mermaid
flowchart LR
  A[App.Started] --> B[Plugin.Loaded] --> C[Resume.Generated] --> D[Email.Synced]
```

Host runtime (`app/src/host`) owns this chain with fake providers. See Dojo activity view.

---

## Event catalog (core)

Naming: `Domain.Action` in past tense where possible (facts that happened).

### App / identity / mail (host lifecycle)
| Event | Meaning |
|-------|---------|
| `App.Started` | Desktop host finished boot wiring |
| `Plugin.Loaded` | Plugin module loaded into host (may still be disabled) |
| `Resume.Generated` | On-device résumé prepared (ID only on bus) |
| `Email.Synced` | Mailbox channel sync finished (counts only; fake or real) |

### Agent
| Event | Meaning |
|-------|---------|
| `Agent.Started` | Run began under preferences |
| `Agent.Paused` | User or policy paused; queue intact |
| `Agent.Resumed` | Run continued |
| `Agent.Progress` | Coarse progress (counts, stage) — batchable |
| `Agent.Idle` | Belt tied — waiting for signal |
| `Agent.Failed` | Preparative failure (not send) |

### Discovery
| Event | Meaning |
|-------|---------|
| `Discovery.RolesFound` | Candidates fetched (count + source id) |
| `Discovery.RolesCurated` | Filtered toward fit |

### Applications
| Event | Meaning |
|-------|---------|
| `Application.DraftCreated` | New draft |
| `Application.Tailored` | Local intelligence applied |
| `Application.Updated` | User or agent edited |

### Queue
| Event | Meaning |
|-------|---------|
| `Queue.Enqueued` | Awaiting review / approval |
| `Queue.Approved` | User approved send |
| `Queue.Rejected` | User declined / returned to draft |
| `Queue.Cleared` | Removed without send |

### Send (egress)
| Event | Meaning |
|-------|---------|
| `Send.Attempted` | Outbound started (destination class) |
| `Send.Succeeded` | Confirmed leave |
| `Send.Failed` | Did not complete; draft retained policy |
| `Send.Unknown` | Cannot confirm — must not treat as success |

### Follow-ups
| Event | Meaning |
|-------|---------|
| `FollowUp.Scheduled` | Reminder armed |
| `FollowUp.Due` | Polite nudge ready (caution, not error) |
| `FollowUp.Sent` | Nudge egress via send channel |
| `FollowUp.Dismissed` | User deferred/cancelled |

### AI / Privacy
| Event | Meaning |
|-------|---------|
| `Ai.LocalModelLoading` | Warm-up |
| `Ai.LocalModelReady` | Badge can show ready |
| `Ai.LocalModelFailed` | Preferences / path recovery |
| `Privacy.EgressRecorded` | Timeline audit written |

### Preferences / System
| Event | Meaning |
|-------|---------|
| `Preferences.Changed` | Policy inputs changed |
| `Scheduler.JobRan` | Local job executed |
| `Plugin.Enabled` / `Plugin.Disabled` | User toggled capability |

---

## Payload guidelines

```
✅ GOOD: { applicationId, stage, count }
❌ BAD:  { fullResumeText, coverLetterBody } on Agent.Progress
```

Full documents stay in storage; events reference them. Egress events may note **destination class** (board | mail | file export) without logging secrets.

---

## Flow examples

### Preparative path (no egress)

```mermaid
flowchart LR
  A[Agent.Started] --> B[Discovery.RolesCurated] --> C[Application.Tailored]
  C --> D[Queue.Enqueued] --> E["Agent.Progress (batched)"] --> F[Agent.Idle]
```

### Sovereign send

```mermaid
flowchart LR
  A[Queue.Approved] --> B[Send.Attempted] --> C[Send.Succeeded]
  C --> D[Privacy.EgressRecorded] --> E[FollowUp.Scheduled]
```

### Honest failure

```mermaid
flowchart LR
  A[Send.Attempted] --> B["Send.Failed (or Send.Unknown)"]
  B --> C[Timeline records uncertainty] --> D[UI recovery copy]
```

---

## Consumers

| Consumer | Interest |
|----------|----------|
| Timeline | Persist audit & craft history |
| Desktop UI | Status, toasts (batched), badge |
| Scheduler | Arm/cancel jobs from domain facts |
| Notifications | FollowUp.Due, approval needed — calm |
| Plugins | Only events allowed by capability |

---

## Durability

- **Ephemeral bus:** UI live updates.
- **Durable subset:** egress, approvals, preference changes, agent pause — via Timeline/storage.
- Retention is user-local; export is an explicit future module (portability), not ambient sync.

---

## Anti-patterns

- Remote event gateways for résumé-related streams.
- Per-keystroke agent events flooding the UI.
- Using events to drive guilt notifications (“no Apply in 5 days”).
- Plugins subscribing to all events without capability review.
