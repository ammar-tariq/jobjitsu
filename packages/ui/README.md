# `@jobjitsu/ui`

Shared Jj* UI primitives and design tokens for the JobJitsu desktop shell.

## Exports

| Export                                | Purpose                                 |
| ------------------------------------- | --------------------------------------- |
| `@jobjitsu/ui`                        | `JjAgentPrivacyPill`, package markers   |
| `@jobjitsu/ui/tokens.css`             | Dark-default design tokens + base reset |
| `@jobjitsu/ui/JjAgentPrivacyPill.css` | Privacy pill styles                     |

## Scripts

```bash
pnpm --filter @jobjitsu/ui build
pnpm --filter @jobjitsu/ui test
pnpm --filter @jobjitsu/ui typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). Presentation only — no storage, send, or AI.
