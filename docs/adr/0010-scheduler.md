# ADR 0010: Local In-Process Scheduler

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Scheduler](../architecture/SCHEDULER.md) · [Notifications](../brand/NOTIFICATIONS.md)

---

## Context

Follow-ups and optional prep windows need time-based wakeups. A cloud cron that holds user calendars would break local-first trust. The scheduler must not become an engagement/guilt engine.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **Local persistent scheduler in host** | Private, restart-safe | Must handle quiet hours carefully |
| OS-only reminders | Native | Weak domain integration / audit |
| Cloud job service | Multi-device | Non-goal |
| setTimeout only while app open | Simple | Misses due follow-ups after quit |

---

## Decision

**Run a local, persistent scheduler** in the host via `packages/scheduler`.

- Job types: `followup.due`, optional `agent.prepWindow`, light `ai.healthCheck`, maintenance, extension jobs.
- Persist jobs on-device; survive restart.
- Honor quiet hours and preferences; sound off by default.
- **Never** auto-send applications; at most mark due / enqueue review.
- No job types for inactivity shaming or streaks.
- Emit `Scheduler.JobRan` and domain events (`FollowUp.Due`, etc.).

---

## Consequences

### Positive
- Polite nudges without SaaS push infrastructure.
- Testable with deterministic clocks.
- Aligns with calm notification guidelines.

### Negative / tradeoffs
- App may need background/tray permission nuances per OS.
- Clock changes / sleep require careful wake logic.

### Follow-ups
- Idempotent handlers; bounded retries.
- Tie arming to `FollowUp.Scheduled` events ([ADR 0003](./0003-event-bus.md)).
