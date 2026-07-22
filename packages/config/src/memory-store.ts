import { DEFAULT_APP_SETTINGS, type AppSettings, type SettingsStore } from "./settings.js";

function deepMergeSettings(base: AppSettings, patch: Partial<AppSettings>): AppSettings {
  return {
    ...base,
    ...patch,
    ai: { ...base.ai, ...patch.ai },
    notifications: { ...base.notifications, ...patch.notifications },
    agent: { ...base.agent, ...patch.agent },
    fitKeywords: patch.fitKeywords ?? base.fitKeywords,
    updatedAt: new Date().toISOString(),
  };
}

/** In-memory settings store — for tests and boot before FS persistence. */
export function createMemorySettingsStore(
  initial: AppSettings = DEFAULT_APP_SETTINGS,
): SettingsStore {
  let current: AppSettings = { ...initial, ai: { ...initial.ai } };

  return {
    async get() {
      return current;
    },
    async set(patch) {
      current = deepMergeSettings(current, patch);
      return current;
    },
    async replace(settings) {
      current = {
        ...settings,
        ai: { ...settings.ai },
        notifications: { ...settings.notifications },
        agent: { ...settings.agent },
        fitKeywords: [...settings.fitKeywords],
        updatedAt: new Date().toISOString(),
      };
      return current;
    },
  };
}
