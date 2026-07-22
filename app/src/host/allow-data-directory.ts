/**
 * Ask the native host to allow recursive FS access under a data folder.
 * No-op outside Tauri.
 */
export async function allowDataDirectory(path: string): Promise<void> {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
    return;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("allow_data_directory", { path });
}
