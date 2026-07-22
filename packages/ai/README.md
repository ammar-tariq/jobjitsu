# `@jobjitsu/ai`

Local Intelligence contracts: `AiProvider`, `AiProviderRegistry`, `ContextAssembler`.

## Status

Interfaces only — **no fake/local/remote provider implementations**.

## Laws

- Primary path is local
- Remote only when user-configured; must not be labeled “Local LLM”
- No egress tools on the provider

See [docs/architecture/AI_ARCHITECTURE.md](../../docs/architecture/AI_ARCHITECTURE.md).
