# `@jobjitsu/storage`

On-device persistence: `KvStore`, `BlobStore`, `DocumentStore`, `StorageProvider`.

## Layout

Under the user-data root (macOS Application Support / XDG / LocalAppData → `JobJitsu/`):

```
<dataRoot>/
  kv/<namespace>/<id>.json
  blobs/<blobId>/data
  blobs/<blobId>/meta.json
```

No cloud sync. Host-only — do not call from the renderer.

## Usage

```ts
import { createFsStorageProvider, resolveUserDataRoot } from "@jobjitsu/storage";

const store = await createFsStorageProvider({
  dataRoot: resolveUserDataRoot(), // or a temp dir in tests
});

await store.kv.set({ namespace: "preferences", id: "appearance" }, { theme: "dark" });
await store.blobs.put(new Uint8Array([1, 2, 3]), { fileName: "resume.pdf" });
```

See [docs/adr/0006-storage.md](../../docs/adr/0006-storage.md).
