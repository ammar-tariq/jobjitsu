# `@jobjitsu/agent`

Preparative agent orchestration contracts (never owns send)

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/agent build
pnpm --filter @jobjitsu/agent test
pnpm --filter @jobjitsu/agent typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
