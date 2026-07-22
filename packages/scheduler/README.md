# `@jobjitsu/scheduler`

Local job runner contracts: `Scheduler`, `JobStore`, `ScheduledJob`, core job types.

## Status

Interfaces only — **no timer/persistence implementation**.

## Laws

- Local only — no cloud cron
- Never auto-send applications
- No inactivity-shame job types

See [docs/architecture/SCHEDULER.md](../../docs/architecture/SCHEDULER.md).
