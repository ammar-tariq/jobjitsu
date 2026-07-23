import { createKvProfileRepository } from "@jobjitsu/identity";
import { createStoragePathLibrary, createStorageResumeLibrary } from "@jobjitsu/identity/storage";
import { createPreferencesFacade } from "@jobjitsu/preferences";
import { createKvSettingsStore } from "@jobjitsu/preferences/storage";
import { createIoStorageProvider, type LocalFsIo, type StorageProvider } from "@jobjitsu/storage";
import type { PathLibrary, ProfileRepository, ResumeLibrary } from "@jobjitsu/identity";
import type { PreferencesFacade } from "@jobjitsu/preferences";
import type { AppearanceStore } from "./appearance-store.js";
import type { ThemePreference } from "../ipc/commands.js";
import type { SettingsStore } from "@jobjitsu/config";

export type DurableHostStores = {
  readonly provider: StorageProvider;
  readonly profiles: ProfileRepository;
  readonly resumeLibrary: ResumeLibrary;
  readonly pathLibrary: PathLibrary;
  readonly preferences: PreferencesFacade;
  readonly appearance: AppearanceStore;
  readonly settings: SettingsStore;
};

/**
 * Open identity + preferences under an on-device data root.
 */
export async function openDurableHostStores(
  dataRoot: string,
  io: LocalFsIo,
): Promise<DurableHostStores> {
  const provider = await createIoStorageProvider({ dataRoot, io });
  const settings = createKvSettingsStore(provider.kv);
  const preferences = createPreferencesFacade(settings);
  const appearance = createSettingsAppearanceStore(settings);
  return {
    provider,
    profiles: createKvProfileRepository(provider.kv),
    resumeLibrary: createStorageResumeLibrary(provider.kv, provider.blobs),
    pathLibrary: createStoragePathLibrary(provider.kv),
    preferences,
    appearance,
    settings,
  };
}

function createSettingsAppearanceStore(store: SettingsStore): AppearanceStore {
  return {
    async getTheme() {
      return toShellTheme((await store.get()).theme);
    },
    async setTheme(theme) {
      const next = await store.set({ theme });
      return toShellTheme(next.theme);
    },
  };
}

function toShellTheme(theme: string): ThemePreference {
  return theme === "light" ? "light" : "dark";
}
