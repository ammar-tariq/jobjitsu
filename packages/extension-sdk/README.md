# `@jobjitsu/extension-sdk`

Type-safe **host extension** SDK for JobJitsu.

Extensions contribute optional breadth (discovery sources, UI panels, send channels,
exporters, …) without forking the Career OS. This package provides the **contracts and
manager** — it does **not** ship any product extensions.

## Goals

| Requirement          | How                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------- |
| Type-safe            | `ContributionTypeMap` + `contribute(point, id, contribution)`                         |
| Event-driven         | Publishes `Extension.*` on an optional `@jobjitsu/events` bus                         |
| Zero circular deps   | Depends only on `shared` → `logger` / `events` / `core` (not `sdk`, not `plugin-sdk`) |
| Lifecycle hooks      | `onRegister` → enable/`register` → `onEnable` → `onDisable` → `onUnload`              |
| Dependency injection | Host `ServiceRegistry` + per-extension scoped overlay                                 |
| Registration         | `createExtensionManager().register / enable / disable / unregister`                   |

## Quick start

```ts
import { createExtensionManager, defineExtension } from "@jobjitsu/extension-sdk";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { createServiceRegistry } from "@jobjitsu/core";

const services = createServiceRegistry();
const eventBus = createInMemoryEventBus();
const manager = createExtensionManager({ services, eventBus });

const demo = defineExtension({
  manifest: {
    id: "example.ui.demo",
    name: "Demo panel",
    version: "0.0.1",
    contributes: [{ type: "ui.panel", id: "demo" }],
  },
  register(api) {
    api.contribute("ui.panel", "demo", {
      kind: "ui.panel",
      title: "Demo",
    });
  },
});

await manager.register(demo); // known, disabled
await manager.enable("example.ui.demo"); // contributions live
```

## Contribution points

`discovery.source` · `send.channel` · `agent.skill` · `ui.panel` · `ui.status` ·
`timeline.exporter` · `scheduler.jobType`

Unknown points fail closed. Contributions must be **declared** in the manifest before
`contribute()` on enable. `send.channel` markers always set `requiresApproval: true`.

## Lifecycle

```
register (discover) → enable (grant + contribute) → disable (revoke) → unregister (unload)
```

## DI

- Host passes a `ServiceRegistry` into `createExtensionManager`.
- Each extension gets a **scoped** registry: local overrides parent; parent stays intact.
- Register the manager itself with `ExtensionServiceKeys.manager` at the composition root.

## Events

When `eventBus` is provided:

| Event                  | When                          |
| ---------------------- | ----------------------------- |
| `Extension.Registered` | After successful `register`   |
| `Extension.Enabled`    | After successful `enable`     |
| `Extension.Disabled`   | After successful `disable`    |
| `Extension.Unloaded`   | After successful `unregister` |
| `Extension.Failed`     | Validation / hook failures    |

`Extension.Enabled` / `Extension.Disabled` are durable (trust posture).

## Non-goals

- No official/community extensions in this package
- No AI provider wiring
- No send execute / ambient network
- Plugin **skills** remain `@jobjitsu/plugin-sdk` (related, separate)

## Scripts

```bash
pnpm --filter @jobjitsu/extension-sdk build
pnpm --filter @jobjitsu/extension-sdk test
pnpm --filter @jobjitsu/extension-sdk typecheck
```

## See also

- [EXTENSION_SYSTEM.md](../../docs/architecture/EXTENSION_SYSTEM.md)
- [PLUGIN_ARCHITECTURE.md](../../docs/architecture/PLUGIN_ARCHITECTURE.md)
- Sprint story **DF-10** in [sprint-1.md](../../docs/backlog/sprint-1.md)
