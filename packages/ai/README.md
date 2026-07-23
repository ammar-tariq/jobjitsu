# `@jobjitsu/ai`

Local Intelligence contracts plus a **fake** in-process provider.

## Status

| Piece                                                 | State                            |
| ----------------------------------------------------- | -------------------------------- |
| `AiProvider` / registry / context assembler contracts | Done                             |
| `createFakeAiProvider`                                | Done — **no Ollama, no network** |
| Real local model runner                               | Not yet                          |

## Fake AI

```ts
import { createFakeAiProvider, createAiProviderRegistry } from "@jobjitsu/ai";

const provider = createFakeAiProvider();
const registry = createAiProviderRegistry([provider]);
```

- `locality: "local"` with an honest “fake” health message
- Deterministic `complete` / `embed`
- Registry keeps the first/local active until `setActive` — no silent remote promotion
- Safe for unit tests and early shell demos

## Laws

- Primary path is local
- Remote only when user-configured; must not be labeled “Local LLM” / must not fake as real Agent health in production UI without labeling
- No egress tools on the provider

See [docs/architecture/AI_ARCHITECTURE.md](../../docs/architecture/AI_ARCHITECTURE.md).
