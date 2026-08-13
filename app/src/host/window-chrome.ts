import { detectShellPlatform } from "../shell/platform.js";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Apply native window materials: glass on macOS, Mica/Acrylic on Windows.
 * Linux stays opaque. No-op outside Tauri.
 */
export async function applyNativeWindowChrome(): Promise<void> {
  const platform = detectShellPlatform();
  document.documentElement.setAttribute("data-platform", platform);
  if (!isTauriRuntime()) {
    return;
  }
  try {
    const { Effect, EffectState, getCurrentWindow } = await import("@tauri-apps/api/window");
    const window = getCurrentWindow();
    if (platform === "macos") {
      await window.setEffects({
        effects: [Effect.HeaderView],
        state: EffectState.FollowsWindowActiveState,
        radius: 12,
      });
      return;
    }
    if (platform === "windows") {
      try {
        await window.setEffects({ effects: [Effect.Mica] });
      } catch {
        await window.setEffects({ effects: [Effect.Acrylic] });
      }
    }
  } catch {
    // Browser preview and hosts without window-effect permission stay opaque.
  }
}
