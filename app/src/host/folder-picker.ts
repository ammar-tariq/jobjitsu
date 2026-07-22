/**
 * Native folder picker — host-owned so the UI never talks to the filesystem.
 */

export type PickDirectoryOptions = {
  readonly title?: string;
  readonly defaultPath?: string;
};

export type FolderPicker = {
  /** Returns an absolute folder path, or null when the user cancels. */
  pickDirectory(options?: PickDirectoryOptions): Promise<string | null>;
};

/** Injected in unit tests — no OS dialog. */
export function createStubFolderPicker(
  pick: (options?: PickDirectoryOptions) => Promise<string | null>,
): FolderPicker {
  return { pickDirectory: pick };
}

/**
 * Browser / Vite fallback — folder picking needs the desktop host.
 * Users can still type a path until Tauri dialog is available.
 */
export function createUnavailableFolderPicker(
  message = "Folder picking needs the desktop app. Enter a path on this device, or open JobJitsu with Tauri.",
): FolderPicker {
  return {
    async pickDirectory() {
      throw new Error(message);
    },
  };
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Prefer the native dialog in Tauri; otherwise fail calmly for typed-path fallback.
 */
export function createHostFolderPicker(): FolderPicker {
  if (!isTauriRuntime()) {
    return createUnavailableFolderPicker();
  }
  return {
    async pickDirectory(options = {}) {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        directory: true,
        multiple: false,
        title: options.title ?? "Choose JobJitsu data folder",
        defaultPath: options.defaultPath,
      });
      if (selected === null || Array.isArray(selected)) {
        return null;
      }
      return selected;
    },
  };
}
