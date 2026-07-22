# `@jobjitsu/send`

Outbound boundary — sole career-data egress

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/send build
pnpm --filter @jobjitsu/send test
pnpm --filter @jobjitsu/send typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
