# `@jobjitsu/identity`

Profile and résumé source of truth (local).

## Status

| Piece                                      | State                       |
| ------------------------------------------ | --------------------------- |
| `Profile` / `ProfileRepository`            | Done — KV-backed            |
| `createKvProfileRepository`                | Done — on-device CRUD       |
| `createMemoryProfileRepository`            | Done — browser-safe host    |
| `ResumeStore` / `ResumeDocument` contracts | Done                        |
| `createFakeResumeStore`                    | Done — **no PDF/OCR/cloud** |
| `createLocalResumeStore`                   | Done — KV profile + resume  |
| Real import / filesystem résumé files      | Not yet (PE03-S02)          |

## Profile (on-device)

```ts
import { createMemoryProfileRepository } from "@jobjitsu/identity";

const profiles = createMemoryProfileRepository();
await profiles.upsert({ displayName: "Sam Chen", location: "On this device" });
```

Durable KV path: `createKvProfileRepository(kv)` with `@jobjitsu/storage` (Node/host FS — not the Vite webview).

UI must call host identity APIs (`identity.getProfile` / `identity.setProfile`), never storage directly.

## Fake Resume

```ts
import { createFakeResumeStore } from "@jobjitsu/identity";

const store = createFakeResumeStore();
const resume = await store.getResume();
```

Seeded fixture identity for demos and tests. Stays on-device in process memory.

See [docs/architecture/PACKAGE_BOUNDARIES.md](../../docs/architecture/PACKAGE_BOUNDARIES.md).
