# `@jobjitsu/storage`

On-device persistence: `KvStore`, `BlobStore`, `DocumentStore`, `StorageProvider`.

## Layout

Under the user-data root (macOS Application Support / XDG / LocalAppData → `JobJitsu/`):

```
<dataRoot>/
  kv/<namespace>/<id>.json
  blobs/<blobId>/data
  blobs/<blobId>/meta.json
  config/data-root.json   # optional pointer when using a custom folder
```

No cloud sync. Host-only — do not call Node FS from the Vite shell.

## Usage

Browser-safe / injectable IO (Tauri or tests):

```ts
import { createIoStorageProvider } from "@jobjitsu/storage";

const store = await createIoStorageProvider({ dataRoot, io });
```

Node host / package tests:

```ts
import { createFsStorageProvider, resolveUserDataRoot } from "@jobjitsu/storage/node";

const store = await createFsStorageProvider({
  dataRoot: resolveUserDataRoot(), // or a temp dir in tests
});
```

See [docs/adr/0006-storage.md](../../docs/adr/0006-storage.md).
