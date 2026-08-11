/**
 * Native file save — host-owned so the UI never talks to the filesystem.
 */

export type SaveTextFileOptions = {
  readonly defaultPath: string;
  readonly contents: string;
  readonly filters?: readonly { readonly name: string; readonly extensions: readonly string[] }[];
  readonly title?: string;
};

export type SaveBytesFileOptions = {
  readonly defaultPath: string;
  readonly contents: Uint8Array;
  readonly filters?: readonly { readonly name: string; readonly extensions: readonly string[] }[];
  readonly title?: string;
};

export type SaveFileResult =
  | { readonly status: "saved"; readonly path: string }
  | { readonly status: "cancelled" }
  | { readonly status: "unavailable"; readonly message: string };

export type FileSaver = {
  saveText(options: SaveTextFileOptions): Promise<SaveFileResult>;
  saveBytes(options: SaveBytesFileOptions): Promise<SaveFileResult>;
};

export function createStubFileSaver(
  save: (options: {
    readonly defaultPath: string;
    readonly contents: string | Uint8Array;
  }) => Promise<SaveFileResult>,
): FileSaver {
  return {
    saveText: (options) => save({ defaultPath: options.defaultPath, contents: options.contents }),
    saveBytes: (options) => save({ defaultPath: options.defaultPath, contents: options.contents }),
  };
}

export function createUnavailableFileSaver(
  message = "Saving files needs the desktop app. Open JobJitsu with Tauri, or copy the draft.",
): FileSaver {
  return {
    async saveText() {
      return { status: "unavailable", message };
    },
    async saveBytes() {
      return { status: "unavailable", message };
    },
  };
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function createHostFileSaver(): FileSaver {
  if (!isTauriRuntime()) {
    return createUnavailableFileSaver();
  }
  return {
    async saveText(options) {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");
      const path = await save({
        title: options.title ?? "Save on this device",
        defaultPath: options.defaultPath,
        filters: options.filters?.map((filter) => ({
          name: filter.name,
          extensions: [...filter.extensions],
        })),
      });
      if (path === null) {
        return { status: "cancelled" };
      }
      await writeTextFile(path, options.contents);
      return { status: "saved", path };
    },
    async saveBytes(options) {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeFile } = await import("@tauri-apps/plugin-fs");
      const path = await save({
        title: options.title ?? "Save on this device",
        defaultPath: options.defaultPath,
        filters: options.filters?.map((filter) => ({
          name: filter.name,
          extensions: [...filter.extensions],
        })),
      });
      if (path === null) {
        return { status: "cancelled" };
      }
      await writeFile(path, options.contents);
      return { status: "saved", path };
    },
  };
}
