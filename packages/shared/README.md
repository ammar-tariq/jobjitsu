# `@jobjitsu/shared`

Lowest foundation package — **no I/O, no AI, no host wiring**.

## Responsibility

| Export                               | Role                       |
| ------------------------------------ | -------------------------- |
| `Result` / `AppError` / `ok` / `err` | Typed success/failure      |
| Branded `*Id` + `createEntityId`     | Opaque local identifiers   |
| `PIPELINE_STAGES`                    | Career OS stage vocabulary |
| `assertNever`                        | Exhaustiveness helper      |

## Depends on

Nothing.

## Scripts

```bash
pnpm --filter @jobjitsu/shared build
pnpm --filter @jobjitsu/shared test
```
