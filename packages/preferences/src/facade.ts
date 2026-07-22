import type { SettingsStore } from "@jobjitsu/config";

/**
 * Preferences façade — domain API over config SettingsStore (SSOT).
 * UI and host talk here; they do not reach into storage keys directly.
 */
export type PreferencesFacade = {
  getApprovalBeforeSend(): Promise<boolean>;
  setApprovalBeforeSend(value: boolean): Promise<boolean>;
};

export function createPreferencesFacade(store: SettingsStore): PreferencesFacade {
  return {
    async getApprovalBeforeSend() {
      const settings = await store.get();
      return settings.requireApprovalBeforeSend;
    },
    async setApprovalBeforeSend(value) {
      const next = await store.set({ requireApprovalBeforeSend: value });
      return next.requireApprovalBeforeSend;
    },
  };
}
