import type { ThemePreference } from "../ipc/commands.js";

/**
 * On-device appearance persistence stub (W0).
 * Real FS storage lands with PE02; this store survives process-local restarts when shared.
 */
export type AppearanceStore = {
  getTheme(): Promise<ThemePreference>;
  setTheme(theme: ThemePreference): Promise<ThemePreference>;
};

export function createMemoryAppearanceStore(initial: ThemePreference = "dark"): AppearanceStore {
  let theme: ThemePreference = initial;
  return {
    async getTheme() {
      return theme;
    },
    async setTheme(next) {
      theme = next;
      return theme;
    },
  };
}

const WEB_THEME_KEY = "jobjitsu.appearance.theme";

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "dark" || value === "light";
}

/**
 * Webview / browser stub — persists theme in localStorage (on-device, no cloud).
 */
export function createLocalStorageAppearanceStore(
  storage: Pick<Storage, "getItem" | "setItem"> = globalThis.localStorage,
): AppearanceStore {
  return {
    async getTheme() {
      const raw = storage.getItem(WEB_THEME_KEY);
      return isThemePreference(raw) ? raw : "dark";
    },
    async setTheme(theme) {
      storage.setItem(WEB_THEME_KEY, theme);
      return theme;
    },
  };
}
