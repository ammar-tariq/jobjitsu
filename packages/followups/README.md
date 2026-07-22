# `@jobjitsu/followups`

Follow-up nudge domain contracts

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/followups build
pnpm --filter @jobjitsu/followups test
pnpm --filter @jobjitsu/followups typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
