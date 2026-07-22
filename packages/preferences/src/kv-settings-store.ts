import { DEFAULT_APP_SETTINGS, type AppSettings, type SettingsStore } from "@jobjitsu/config";
import type { KvStore } from "@jobjitsu/storage";

export const APP_SETTINGS_STORAGE_KEY = {
  namespace: "config",
  id: "app_settings",
} as const;

/**
 * SettingsStore on local KV — seeds DEFAULT_APP_SETTINGS on first read
 * (approval-before-send defaults on for a fresh install).
 */
export function createKvSettingsStore(kv: KvStore): SettingsStore {
  return {
    async get() {
      const row = await kv.get<AppSettings>(APP_SETTINGS_STORAGE_KEY);
      if (!row.ok) {
        throw new Error(row.error.message ?? row.error.title);
      }
      if (row.value) {
        return hydrate(row.value);
      }
      const seeded = hydrate(DEFAULT_APP_SETTINGS);
      const written = await kv.set(APP_SETTINGS_STORAGE_KEY, seeded);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
      }
      return seeded;
    },

    async set(patch) {
      const current = await this.get();
      const next = merge(current, patch);
      const written = await kv.set(APP_SETTINGS_STORAGE_KEY, next);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
      }
      return next;
    },

    async replace(settings) {
      const next = hydrate(settings);
      const written = await kv.set(APP_SETTINGS_STORAGE_KEY, next);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
      }
      return next;
    },
  };
}

function hydrate(settings: AppSettings): AppSettings {
  return {
    ...DEFAULT_APP_SETTINGS,
    ...settings,
    requireApprovalBeforeSend: settings.requireApprovalBeforeSend ?? true,
    theme: settings.theme ?? DEFAULT_APP_SETTINGS.theme,
    ai: { ...DEFAULT_APP_SETTINGS.ai, ...settings.ai },
    notifications: {
      ...DEFAULT_APP_SETTINGS.notifications,
      ...settings.notifications,
    },
    agent: { ...DEFAULT_APP_SETTINGS.agent, ...settings.agent },
    fitKeywords: settings.fitKeywords ? [...settings.fitKeywords] : [],
    updatedAt: settings.updatedAt ?? new Date().toISOString(),
  };
}

function merge(base: AppSettings, patch: Partial<AppSettings>): AppSettings {
  return hydrate({
    ...base,
    ...patch,
    ai: { ...base.ai, ...patch.ai },
    notifications: { ...base.notifications, ...patch.notifications },
    agent: { ...base.agent, ...patch.agent },
    fitKeywords: patch.fitKeywords ?? base.fitKeywords,
    updatedAt: new Date().toISOString(),
  });
}
