# `@jobjitsu/identity`

Profile and résumé source of truth (local).

## Status

| Piece                                      | State                                     |
| ------------------------------------------ | ----------------------------------------- |
| `Profile` / `ProfileRepository`            | Done — KV-backed                          |
| `createKvProfileRepository`                | Done — on-device CRUD                     |
| `createMemoryProfileRepository`            | Done — browser-safe host                  |
| `ResumeVersion` / `ResumeLibrary`          | Done — import, list, select               |
| `Path` / `PathLibrary`                     | Done — create, archive, select (UI: Path) |
| `createMemoryResumeLibrary`                | Done — browser-safe host                  |
| `createMemoryPathLibrary`                  | Done — browser-safe host                  |
| `createStorageResumeLibrary`               | Done — KV + blob originals                |
| `createStoragePathLibrary`                 | Done — KV paths                           |
| Optional `parentVersionId`                 | Done — version graph                      |
| `ResumeStore` / `ResumeDocument` contracts | Done                                      |
| `createFakeResumeStore`                    | Done — **no PDF/OCR/cloud**               |
| `createLocalResumeStore`                   | Done — KV profile + resume                |
| Tailor draft / structured parse            | Not yet (PE03-S04+)                       |
| Attach import to path                      | Not yet (PE03-S07)                        |

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

UI: `identity.importResume` / `identity.listResumeVersions` / `identity.selectResume` —
never talk to storage from the shell. **Select does not send.**

## Paths (on-device)

Career faces under one Profile (e.g. Fullstack Developer, Mobile App). UI says **Path**, not sub-profile.

```ts
import { createMemoryPathLibrary } from "@jobjitsu/identity";

const paths = createMemoryPathLibrary();
await paths.upsert({ name: "Fullstack Developer" });
await paths.upsert({ name: "Mobile App", notes: "React Native" });
```

Durable: `createStoragePathLibrary(kv)` from `@jobjitsu/identity/storage`.

UI: `identity.listPaths` / `identity.upsertPath` / `identity.archivePath` / `identity.selectPath` —
**Select does not send.**

## Fake Resume

```ts
import { createFakeResumeStore } from "@jobjitsu/identity";

const store = createFakeResumeStore();
const resume = await store.getResume();
```

Seeded fixture identity for demos and tests. Stays on-device in process memory.

See [docs/architecture/PACKAGE_BOUNDARIES.md](../../docs/architecture/PACKAGE_BOUNDARIES.md).
