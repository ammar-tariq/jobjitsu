export type ShellPlatform = "macos" | "windows" | "linux" | "web";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Native window chrome platform. Browser tests fall back to the user agent.
 */
export function detectShellPlatform(): ShellPlatform {
  if (typeof navigator === "undefined") {
    return "web";
  }
  if (/Mac/i.test(navigator.platform) || /Mac OS/i.test(navigator.userAgent)) {
    return isTauriRuntime() ? "macos" : "web";
  }
  if (/Win/i.test(navigator.platform) || /Windows/i.test(navigator.userAgent)) {
    return isTauriRuntime() ? "windows" : "web";
  }
  if (isTauriRuntime()) {
    return "linux";
  }
  return "web";
}

export const TITLEBAR_HEIGHT_PX = 52;
export const MAC_TRAFFIC_INSET_PX = 78;
