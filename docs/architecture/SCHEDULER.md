# Scheduler

> Local, quiet job runner — polite timing without urgency theater.

Parent: [OVERVIEW.md](./OVERVIEW.md) · Package: `packages/scheduler` · Events: [EVENT_SYSTEM.md](./EVENT_SYSTEM.md)

---

## Purpose

The scheduler wakes local work at the right time:

- Follow-up due reminders  
- Optional agent prep windows (user-configured)  
- Maintenance (local index rebuild, log rotation)

It is **not** a cloud push service, streak enforcer, or guilt engine.

---

## Laws

1. **Local only** — schedules persist on-device; no remote job orchestra.
2. **Preferences first** — quiet hours, approval policy, notification sound.
3. **Calm delivery** — batch notifications; Amber caution for due follow-ups, not error red.
4. **Idempotent jobs** — reruns safe; no duplicate sends.
5. **Pause-aware** — Agent.Paused skips preparative jobs; follow-up *due* may still notify unless dismissed.
6. **No inactivity shame** — no jobs that nag “you haven’t applied.”

---

## Job types (core)

| Job type | Trigger | Action |
|----------|---------|--------|
| `followup.due` | Scheduled instant | Emit `FollowUp.Due`; notify politely |
| `agent.prepWindow` | User window | Offer/start preparative run if enabled |
| `ai.healthCheck` | Periodic light | Refresh Agent · On-device chrome truth |
| `timeline.compact` | Maintenance | Local retention policy |
| `extension.*` | Declared by extensions | Capability-gated |

Send itself is **never** auto-fired by scheduler without going through Queue policy and user sovereignty. A job may at most enqueue “ready for review” or mark follow-up due.

---

## Lifecycle

```
arm job (domain event or user) → persist locally → wake at time
  → check preferences / quiet hours → run handler → emit Scheduler.JobRan
  → success: complete / reschedule
  → failure: retry with backoff (bounded) · plain error to logs
```

Quiet hours: defer notification presentation; do not silently send egress.

---

## Integration

| Producer | Arms |
|----------|------|
| `FollowUp.Scheduled` | `followup.due` |
| Preferences change | Recompute windows |
| Extension register | Custom job types |

| Consumer | On run |
|----------|--------|
| Follow-ups domain | Mark due, prepare nudge draft locally |
| Notifications | OS/in-app per [../brand/NOTIFICATIONS.md](../brand/NOTIFICATIONS.md) |
| Agent | Optional prep — still cannot send |

---

## Persistence

Jobs persist locally across restarts. Missed quiet-hour jobs wait — they do not “catch up” with a burst of notifications.

**Scale:** Prefer small job fan-out; do not schedule unbounded per-application storms. AI-related warmups honor Task Queue concurrency (default 1).

- Job records in local storage (id, type, not_before, payload refs, state).
- Survive app restart.
- User data export (future) may include schedules; sync-to-cloud is non-goal.

---

## Anti-patterns

- Server-side cron that holds user calendars.
- Exponential notification storms.
- Scheduling mass auto-apply blasts.
- Using scheduler for engagement marketing.
