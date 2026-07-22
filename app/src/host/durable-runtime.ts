import type { LocalFsIo } from "@jobjitsu/storage";
import { allowDataDirectory } from "./allow-data-directory.js";
import { createDurableDataRootStore } from "./durable-data-root-store.js";
import { openDurableHostStores, type DurableHostStores } from "./durable-stores.js";
import { createHostFolderPicker, type FolderPicker } from "./folder-picker.js";
import { resolveDefaultDataRoot } from "./resolve-default-data-root.js";
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
  const resolvedDefault = defaultDataRoot ?? (await resolveDefaultDataRoot());
  assertAbsoluteDataPath(resolvedDefault);

  await allowDataDirectory(resolvedDefault);
  await io.mkdir(resolvedDefault);

  const dataRootStore = createDurableDataRootStore({
    defaultPath: resolvedDefault,
    io,
  });
  const active = await dataRootStore.get();
  assertAbsoluteDataPath(active.path);
  await allowDataDirectory(active.path);
  await io.mkdir(active.path);

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
      getCraftPreferences: () => stores.preferences.getCraftPreferences(),
      setCraftPreferences: (patch) => stores.preferences.setCraftPreferences(patch),
    },
    dataRoot: dataRootStore,
    folderPicker,
    onDataRootChanged: async (snapshot) => {
      assertAbsoluteDataPath(snapshot.path);
      await allowDataDirectory(snapshot.path);
      await io.mkdir(snapshot.path);
      stores = await openDurableHostStores(snapshot.path, io);
    },
  });
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function assertAbsoluteDataPath(path: string): void {
  if (path.startsWith("~") || path.includes("://")) {
    throw new Error(
      "Data folder path must be an absolute path on this device (not a home shortcut).",
    );
  }
  const absolute = path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path) || path.startsWith("\\\\");
  if (!absolute) {
    throw new Error("Data folder path must be absolute on this device.");
  }
}

/**
 * Desktop entry helper — durable under Tauri; memory stubs in plain browser Vite.
 * Falls back to memory if durable boot fails so the shell never stays blank.
 */
export async function createAppHostRuntime(
  options: CreateHostRuntimeOptions = {},
): Promise<HostRuntime> {
  if (!isTauriRuntime()) {
    return createHostRuntime(options);
  }
  try {
    const { createTauriFsIo } = await import("./tauri-fs-io.js");
    return await createDurableHostRuntime({
      ...options,
      io: createTauriFsIo(),
    });
  } catch (cause) {
    console.error("JobJitsu durable storage failed to open; using session memory.", cause);
    return createHostRuntime(options);
  }
}
