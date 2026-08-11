# `@jobjitsu/ai`

Local Intelligence contracts: **AI Provider**, fake in-process provider, and **Context Builder**.

## Status

| Piece                                                 | State                          |
| ----------------------------------------------------- | ------------------------------ |
| `AiProvider` / registry / context assembler contracts | Done                           |
| `createFakeAiProvider`                                | Done — tests / offline demos   |
| `createOllamaAiProvider` (PE05-S06)                   | Done — loopback Ollama only    |
| `listOllamaModels` (PE05-S07)                         | Done — loopback `/api/tags`    |
| `createContextAssembler` (Context Builder)            | Done — allowlist + budget      |
| `KnowledgeReader` port                                | Done — no-op OK until PE14     |
| In-app model download UI                              | Not yet (use Ollama CLI / app) |

## Local Ollama Agent (PE05-S06)

```ts
import { createOllamaAiProvider, createPathGatedAiProvider } from "@jobjitsu/ai";

const inner = createOllamaAiProvider({
  getModelId: async () => "qwen2.5:3b",
});
const provider = createPathGatedAiProvider({
  inner,
  getLocalModelPath: async () => "qwen2.5:3b",
});
```

- Loopback only (`127.0.0.1` / `localhost`) — rejects remote base URLs
- Desktop host defaults to Ollama; Vitest keeps the fake provider
- Free model install guide: [LOCAL_AGENT_MODELS.md](../../docs/guides/LOCAL_AGENT_MODELS.md)

## Fake AI (tests)

```ts
import {
  createFakeAiProvider,
  createAiProviderRegistry,
  createPathGatedAiProvider,
} from "@jobjitsu/ai";

const inner = createFakeAiProvider();
const provider = createPathGatedAiProvider({
  inner,
  getLocalModelPath: async () => "qwen2.5:3b",
});
const registry = createAiProviderRegistry([provider]);
```

- `locality: "local"` with an honest “fake” health message
- Deterministic `complete` / `embed`
- `createPathGatedAiProvider` gates health/complete on a configured model id/path (no weight load in `health`)
- Registry keeps the first/local active until `setActive` — no silent remote promotion
- Offline / local-primary: fake health + complete work with `fetch` disabled; local failure never auto-calls a remote provider

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

## Craft prepare prompts

```ts
import { buildCraftUserPrompt, systemPromptForRole } from "@jobjitsu/ai";

const system = systemPromptForRole("tailor"); // full ATS résumé writer instructions
const prompt = buildCraftUserPrompt({
  kind: "resume",
  jobDescription: "…",
  resumeText: "…",
  aboutCompany: "…", // optional
  tonePreferences: "calm", // optional Preferences voice
});
```

- Ollama uses `systemPromptForRole` for `tailor` / `cover_letter` (shorter prompts for other roles)
- User prompt is the labeled `## INPUTS` section only — all rules stay in `system` so weak local models stay structured and truthful
- Host Craft prepare wires Preferences tone when set

## Laws

- Primary path is local
- Remote only when user-configured; must not be labeled “Local LLM” / must not fake as real Agent health in production UI without labeling
- No egress tools on the provider
- Context stays minimal — craft slices, not full history

See [docs/architecture/AI_ARCHITECTURE.md](../../docs/architecture/AI_ARCHITECTURE.md).
