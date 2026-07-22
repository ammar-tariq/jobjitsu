# `@jobjitsu/config`

On-device application settings — **policy, not product UI**.

## Responsibility

- `AppSettings` + `DEFAULT_APP_SETTINGS` (approval on, sound off, dark)
- `SettingsStore` + `createMemorySettingsStore`
- Quiet-hours / approval policy helpers

## Depends on

`@jobjitsu/shared`

## Non-goals

- No AI provider registration (reserved `ai` fields only)
- No filesystem persistence yet (host wires storage later)

```bash
pnpm --filter @jobjitsu/config build
pnpm --filter @jobjitsu/config test
```
