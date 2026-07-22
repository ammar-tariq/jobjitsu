/**
 * On-device data folder preference (browser-safe host stub).
 * Real FS binding uses `@jobjitsu/storage` resolveUserDataRoot in the Tauri host later —
 * this store must not import Node FS (Vite webview).
 */

export type DataRootSnapshot = {
  readonly path: string;
  readonly defaultPath: string;
  readonly isCustom: boolean;
};

export type DataRootStore = {
  get(): Promise<DataRootSnapshot>;
  set(path: string): Promise<DataRootSnapshot>;
  reset(): Promise<DataRootSnapshot>;
};

export type CreateMemoryDataRootStoreOptions = {
  /** Injected default for tests / host. */
  readonly defaultPath?: string;
  readonly platform?: "darwin" | "win32" | "linux";
  readonly homeDir?: string;
};

/**
 * Platform-shaped default data folder — display + preference SSOT for the shell.
 * Matches `resolveUserDataRoot` layout without Node FS imports.
 */
export function defaultJobJitsuDataPath(
  options: {
    readonly platform?: "darwin" | "win32" | "linux";
    readonly homeDir?: string;
  } = {},
): string {
  const platform = options.platform ?? detectPlatform();
  const home = options.homeDir ?? detectHomeHint();
  if (platform === "darwin") {
    return `${home}/Library/Application Support/JobJitsu`;
  }
  if (platform === "win32") {
    return `${home}/AppData/Local/JobJitsu`;
  }
  return `${home}/.local/share/JobJitsu`;
}

export function createMemoryDataRootStore(
  options: CreateMemoryDataRootStoreOptions = {},
): DataRootStore {
  const defaultPath =
    options.defaultPath ??
    defaultJobJitsuDataPath({
      platform: options.platform,
      homeDir: options.homeDir,
    });
  let customPath: string | undefined;

  return {
    async get() {
      return snapshot(defaultPath, customPath);
    },
    async set(path) {
      const next = normalizeDataPath(path);
      customPath = next;
      return snapshot(defaultPath, customPath);
    },
    async reset() {
      customPath = undefined;
      return snapshot(defaultPath, customPath);
    },
  };
}

export function normalizeDataPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new Error("Choose a folder path for your JobJitsu data.");
  }
  if (trimmed.includes("\0")) {
    throw new Error("That folder path is not valid. Try another location on this device.");
  }
  return trimmed.replace(/[/\\]+$/, "") || trimmed;
}

function snapshot(defaultPath: string, customPath: string | undefined): DataRootSnapshot {
  const path = customPath ?? defaultPath;
  return {
    path,
    defaultPath,
    isCustom: customPath !== undefined && customPath !== defaultPath,
  };
}

function detectPlatform(): "darwin" | "win32" | "linux" {
  if (typeof process !== "undefined" && process.platform === "darwin") {
    return "darwin";
  }
  if (typeof process !== "undefined" && process.platform === "win32") {
    return "win32";
  }
  if (typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)) {
    return "darwin";
  }
  if (typeof navigator !== "undefined" && /Win/i.test(navigator.platform)) {
    return "win32";
  }
  return "linux";
}

function detectHomeHint(): string {
  if (typeof process !== "undefined") {
    const home = process.env.HOME ?? process.env.USERPROFILE;
    if (home) {
      return home;
    }
  }
  return "~";
}
