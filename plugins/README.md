# Plugins

First-party and sample agent skills / adapters for JobJitsu.

## Rules

- **Off until user-enabled**
- Capability-gated ([ADR 0004](../docs/adr/0004-plugin-system.md))
- Must not call send egress directly
- Prefer inspectable source

## Layout

```
plugins/
├── official/     # First-party plugin packages (workspace members)
└── README.md
```

Add official plugins under `plugins/official/<plugin-name>` with a `package.json` named `@jobjitsu/plugin-*`.

No plugins implemented yet — scaffold only.
