# `@jobjitsu/testing`

Test helpers for foundation packages.

## Helpers

| Export                   | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| `expectOk` / `expectErr` | Assert `Result` shape                               |
| `createTestFoundation`   | Registry with logger, bus, settings, error reporter |
| Re-exports               | memory logger/bus/settings factories                |

No AI fixtures.

```bash
pnpm --filter @jobjitsu/testing build
pnpm --filter @jobjitsu/testing test
```
