import type { LocalFsIo } from "@jobjitsu/storage";
import { allowDataDirectory } from "./allow-data-directory.js";
import { defaultJobJitsuDataPath } from "./data-root-store.js";
import { createDurableDataRootStore } from "./durable-data-root-store.js";
import { openDurableHostStores, type DurableHostStores } from "./durable-stores.js";
import { createHostFolderPicker, type FolderPicker } from "./folder-picker.js";
import { createHostRuntime, type CreateHostRuntimeOptions, type HostRuntime } from "./runtime.js";

export type CreateDurableHostRuntimeOptions = CreateHostRuntimeOptions & {
  /** Required filesystem IO — Node in tests, Tauri in desktop. */
  readonly io: LocalFsIo;
  /** Platform default data folder (pointer lives under this path). */
  readonly defaultDataRoot?: string;
  readonly folderPicker?: FolderPicker;
};

/**
 * Host runtime with career data on disk under the active data folder.
 * Profile, resumes, and preferences land in `kv/` + `blobs/` for backup/inspectability.
 */
export async function createDurableHostRuntime(
  options: CreateDurableHostRuntimeOptions,
): Promise<HostRuntime> {
  const { io, defaultDataRoot, folderPicker: folderPickerOption, ...hostOptions } = options;
  const resolvedDefault = defaultDataRoot ?? defaultJobJitsuDataPath();
  await io.mkdir(resolvedDefault);
  await allowDataDirectory(resolvedDefault);

  const dataRootStore = createDurableDataRootStore({
    defaultPath: resolvedDefault,
    io,
  });
  const active = await dataRootStore.get();
  await io.mkdir(active.path);
  await allowDataDirectory(active.path);

  let stores: DurableHostStores = await openDurableHostStores(active.path, io);
  const folderPicker = folderPickerOption ?? createHostFolderPicker();

  return createHostRuntime({
    ...hostOptions,
    appearance: {
      getTheme: () => stores.appearance.getTheme(),
      setTheme: (theme) => stores.appearance.setTheme(theme),
    },
    profiles: {
      get: () => stores.profiles.get(),
      upsert: (patch) => stores.profiles.upsert(patch),
    },
    resumeLibrary: {
      import: (input) => stores.resumeLibrary.import(input),
      list: () => stores.resumeLibrary.list(),
      get: (id) => stores.resumeLibrary.get(id),
      getSelected: () => stores.resumeLibrary.getSelected(),
      select: (id) => stores.resumeLibrary.select(id),
    },
    preferences: {
      getApprovalBeforeSend: () => stores.preferences.getApprovalBeforeSend(),
      setApprovalBeforeSend: (value) => stores.preferences.setApprovalBeforeSend(value),
    },
    dataRoot: dataRootStore,
    folderPicker,
    onDataRootChanged: async (snapshot) => {
      await io.mkdir(snapshot.path);
      await allowDataDirectory(snapshot.path);
      stores = await openDurableHostStores(snapshot.path, io);
    },
  });
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Desktop entry helper — durable under Tauri; memory stubs in plain browser Vite.
 */
export async function createAppHostRuntime(
  options: CreateHostRuntimeOptions = {},
): Promise<HostRuntime> {
  if (!isTauriRuntime()) {
    return createHostRuntime(options);
  }
  const { createTauriFsIo } = await import("./tauri-fs-io.js");
  return createDurableHostRuntime({
    ...options,
    io: createTauriFsIo(),
  });
}
