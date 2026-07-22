# `@jobjitsu/applications`

Application draft lifecycle contracts

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/applications build
pnpm --filter @jobjitsu/applications test
pnpm --filter @jobjitsu/applications typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
