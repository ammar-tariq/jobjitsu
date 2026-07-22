# `@jobjitsu/identity`

Profile and résumé source of truth (local).

## Status

| Piece                                      | State                       |
| ------------------------------------------ | --------------------------- |
| `Profile` / `ProfileRepository`            | Done — KV-backed            |
| `createKvProfileRepository`                | Done — on-device CRUD       |
| `createMemoryProfileRepository`            | Done — browser-safe host    |
| `ResumeVersion` / `ResumeLibrary`          | Done — import + label       |
| `createMemoryResumeLibrary`                | Done — browser-safe host    |
| `createStorageResumeLibrary`               | Done — KV + blob originals  |
| `ResumeStore` / `ResumeDocument` contracts | Done                        |
| `createFakeResumeStore`                    | Done — **no PDF/OCR/cloud** |
| `createLocalResumeStore`                   | Done — KV profile + resume  |
| Structured parse / version select UI       | Not yet (PE03-S03+)         |

## Profile (on-device)

```ts
import { createMemoryProfileRepository } from "@jobjitsu/identity";

const profiles = createMemoryProfileRepository();
await profiles.upsert({ displayName: "Sam Chen", location: "On this device" });
```

Durable KV path: `createKvProfileRepository(kv)` with `@jobjitsu/storage` (Node/host FS — not the Vite webview).

UI must call host identity APIs (`identity.getProfile` / `identity.setProfile`), never storage directly.

## Resume library (on-device)

```ts
import { createMemoryResumeLibrary } from "@jobjitsu/identity";

const library = createMemoryResumeLibrary();
await library.import({
  label: "Baseline 2026",
  fileName: "sam.md",
  bytes: new TextEncoder().encode("# Sam Chen"),
});
```

Durable path (Node/host FS — not the Vite webview):

```ts
import { createStorageResumeLibrary } from "@jobjitsu/identity/storage";
```

UI: `identity.importResume` / `identity.listResumeVersions` — never talk to storage from the shell.

## Fake Resume

```ts
import { createFakeResumeStore } from "@jobjitsu/identity";

const store = createFakeResumeStore();
const resume = await store.getResume();
```

Seeded fixture identity for demos and tests. Stays on-device in process memory.

See [docs/architecture/PACKAGE_BOUNDARIES.md](../../docs/architecture/PACKAGE_BOUNDARIES.md).
