# `@jobjitsu/app`

Desktop **shell** + event-driven **host runtime** for JobJitsu.

Dojo shows the startup cascade. Other destinations stay **Coming Soon**.

## Run the shell

```bash
pnpm install
pnpm --filter @jobjitsu/ui build
pnpm --filter @jobjitsu/app dev
```

Open **http://localhost:1420** — window title **JobJitsu**, Midnight Ink dark theme.

```bash
pnpm --filter @jobjitsu/app build
pnpm --filter @jobjitsu/app test
```

## Layout

```
┌────────────────────────────────────────────┐
│ JobJitsu                                   │
├──────────────┬─────────────────────────────┤
│ Dojo         │  App.Started                │
│ Opportunities│  Plugin.Loaded              │
│ Resume       │  Resume.Generated           │
│ Inbox        │  Email.Synced               │
│ …            │                             │
├──────────────┴─────────────────────────────┤
│                    Agent · On-device        │
└────────────────────────────────────────────┘
```

## Architecture notes

| Concern      | Choice                                                          |
| ------------ | --------------------------------------------------------------- |
| UI           | React (ADR 0002) — subscribes only                              |
| Host         | `src/host` owns AI / resume / mail fakes                        |
| Bus          | `@jobjitsu/events` — awaited async handlers                     |
| Cascade      | `App.Started → Plugin.Loaded → Resume.Generated → Email.Synced` |
| UI → AI      | **Forbidden** (`ui-ai-fence` test)                              |
| Desktop host | Tauri later (ADR 0001)                                          |

See [EVENT_SYSTEM.md](../docs/architecture/EVENT_SYSTEM.md).

## Boundaries

- No career egress from the renderer.
- Shell must not import `@jobjitsu/ai`.
- Narrow IPC only when the Tauri host arrives ([ADR 0013](../docs/adr/0013-ipc-bridge.md)).
