import type { LocalFsIo } from "@jobjitsu/storage";
import { CONFIG_DIR, joinStoragePath } from "@jobjitsu/storage";
import {
  createMemoryDataRootStore,
  normalizeDataPath,
  type DataRootSnapshot,
  type DataRootStore,
} from "./data-root-store.js";

type DataRootPointer = {
  readonly path: string;
};

/**
 * Persists the active data-folder pointer under the platform default root
 * (`config/data-root.json`) so custom folders do not hold the pointer.
 */
export function createDurableDataRootStore(options: {
  readonly defaultPath: string;
  readonly io: LocalFsIo;
}): DataRootStore {
  const defaultPath = normalizeDataPath(options.defaultPath);
  const pointerPath = joinStoragePath(defaultPath, CONFIG_DIR, "data-root.json");
  const memory = createMemoryDataRootStore({ defaultPath });
  let hydrated = false;

  async function hydrate(): Promise<void> {
    if (hydrated) {
      return;
    }
    hydrated = true;
    try {
      if (!(await options.io.exists(pointerPath))) {
        return;
      }
      const raw = await options.io.readText(pointerPath);
      const parsed = JSON.parse(raw) as DataRootPointer;
      if (parsed.path && parsed.path !== defaultPath) {
        await memory.set(parsed.path);
      }
    } catch {
      // Missing or corrupt pointer → stay on default.
    }
  }

  async function persist(snapshot: DataRootSnapshot): Promise<void> {
    await options.io.mkdir(joinStoragePath(defaultPath, CONFIG_DIR));
    if (!snapshot.isCustom) {
      if (await options.io.exists(pointerPath)) {
        await options.io.remove(pointerPath);
      }
      return;
    }
    const pointer: DataRootPointer = { path: snapshot.path };
    await options.io.writeText(pointerPath, `${JSON.stringify(pointer, null, 2)}\n`);
  }

  return {
    async get() {
      await hydrate();
      return memory.get();
    },
    async set(path) {
      await hydrate();
      const next = await memory.set(path);
      await persist(next);
      return next;
    },
    async reset() {
      await hydrate();
      const next = await memory.reset();
      await persist(next);
      return next;
    },
  };
}
