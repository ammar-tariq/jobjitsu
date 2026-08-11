# `@jobjitsu/ai`

Local Intelligence contracts: **AI Provider**, fake in-process provider, and **Context Builder**.

## Status

| Piece                                                 | State                            |
| ----------------------------------------------------- | -------------------------------- |
| `AiProvider` / registry / context assembler contracts | Done                             |
| `createFakeAiProvider`                                | Done — **no Ollama, no network** |
| `createContextAssembler` (Context Builder)            | Done — allowlist + budget        |
| `KnowledgeReader` port                                | Done — no-op OK until PE14       |
| Real local model runner                               | Not yet                          |

## Fake AI

```ts
import {
  createFakeAiProvider,
  createAiProviderRegistry,
  createPathGatedAiProvider,
} from "@jobjitsu/ai";

const inner = createFakeAiProvider();
const provider = createPathGatedAiProvider({
  inner,
  getLocalModelPath: async () => "/models/local.gguf",
});
const registry = createAiProviderRegistry([provider]);
```

- `locality: "local"` with an honest “fake” health message
- Deterministic `complete` / `embed`
- `createPathGatedAiProvider` gates health/complete on a configured local model path (no weight load in `health`)
- Registry keeps the first/local active until `setActive` — no silent remote promotion
- Offline / local-primary: health + complete work with `fetch` disabled; local failure never auto-calls a remote provider
- Safe for unit tests and early shell demos

## Context Builder

```ts
import { createContextAssembler, createNoopKnowledgeReader } from "@jobjitsu/ai";

const assembler = createContextAssembler({
  knowledgeReader: createNoopKnowledgeReader(), // PE14 wires a real reader
});

const prompt = assembler.assemble({
  role: "tailor",
  profileExcerpt: "Alex",
  resumeExcerpts: ["Built APIs"],
  currentJobExcerpt: "Staff Engineer",
  roleDescription: "Platform role",
  tonePreferences: "calm",
});
```

- Allowlisted slices only (Profile → Resume → Projects → Achievements → Current Job → …)
- Character budget by task role — never dumps Timeline into prompts
- `KnowledgeReader` may return nothing until Knowledge Base (PE14)

## Laws

- Primary path is local
- Remote only when user-configured; must not be labeled “Local LLM” / must not fake as real Agent health in production UI without labeling
- No egress tools on the provider
- Context stays minimal — craft slices, not full history

See [docs/architecture/AI_ARCHITECTURE.md](../../docs/architecture/AI_ARCHITECTURE.md).
