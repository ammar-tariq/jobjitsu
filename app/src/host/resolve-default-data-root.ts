import { defaultJobJitsuDataPath } from "./data-root-store.js";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function detectPlatform(): "darwin" | "win32" | "linux" {
  if (typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)) {
    return "darwin";
  }
  if (typeof navigator !== "undefined" && /Win/i.test(navigator.platform)) {
    return "win32";
  }
  if (typeof process !== "undefined" && process.platform === "darwin") {
    return "darwin";
  }
  if (typeof process !== "undefined" && process.platform === "win32") {
    return "win32";
  }
  return "linux";
}

/**
 * Absolute default data folder for the host.
 * In Tauri, resolves the real home directory (webview has no reliable HOME env).
 */
export async function resolveDefaultDataRoot(): Promise<string> {
  if (isTauriRuntime()) {
    const { homeDir } = await import("@tauri-apps/api/path");
    const home = (await homeDir()).replace(/[/\\]+$/, "");
    return defaultJobJitsuDataPath({
      platform: detectPlatform(),
      homeDir: home,
    });
  }

  if (typeof process !== "undefined") {
    const home = process.env.HOME ?? process.env.USERPROFILE;
    if (home) {
      return defaultJobJitsuDataPath({
        platform: detectPlatform(),
        homeDir: home,
      });
    }
  }

  return defaultJobJitsuDataPath();
}
