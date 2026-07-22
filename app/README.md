# `@jobjitsu/app`

Desktop shell for JobJitsu (Tauri host + React UI).

## Layout (planned)

```
app/
├── src/           # Shared app package entry (scaffold)
├── host/          # Native/Tauri host (not scaffolded yet)
├── ui/            # React renderer (not scaffolded yet)
└── README.md
```

## Status

Scaffold only — **no business logic**, no Tauri/React wiring yet.  
See backlog [E01 Platform Foundation](../docs/backlog/EPICS.md) and [ADR 0001 Tauri](../docs/adr/0001-tauri.md) / [ADR 0002 React](../docs/adr/0002-react.md).

## Scripts

```bash
pnpm --filter @jobjitsu/app typecheck
pnpm --filter @jobjitsu/app test
```

## Boundaries

- UI must use narrow IPC ([ADR 0013](../docs/adr/0013-ipc-bridge.md)).
- Career egress only via `@jobjitsu/send`.
