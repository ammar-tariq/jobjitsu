# `@jobjitsu/preferences`

**Settings façade** over `@jobjitsu/config` (SSOT): approval gates, quiet hours, fit rules.

## Defaults (philosophy)

- `requireApprovalBeforeSend: true`
- `notifications.soundEnabled: false`
- `theme: "dark"`

## Status

| Piece                          | State                                          |
| ------------------------------ | ---------------------------------------------- |
| `AppSettings` / policy helpers | Done (via `@jobjitsu/config`)                  |
| `createPreferencesFacade`      | Done — approval + craft (fit/tone/constraints) |
| `createMemorySettingsStore`    | Done — browser/host boot                       |
| `createKvSettingsStore`        | Done — `@jobjitsu/preferences/storage`         |

```ts
import { createMemorySettingsStore, createPreferencesFacade } from "@jobjitsu/preferences";

const prefs = createPreferencesFacade(createMemorySettingsStore());
expect(await prefs.getApprovalBeforeSend()).toBe(true);
```

UI must call host preferences IPC — never storage or config stores directly.

See [docs/product/PRINCIPLES.md](../../docs/product/PRINCIPLES.md).
