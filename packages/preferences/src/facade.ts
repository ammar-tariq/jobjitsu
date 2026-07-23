import type { SettingsStore } from "@jobjitsu/config";

/**
 * Preferences façade — domain API over config SettingsStore (SSOT).
 * UI and host talk here; they do not reach into storage keys directly.
 */
export type CraftPreferences = {
  readonly fitKeywords: readonly string[];
  readonly tone: string;
  readonly constraints: readonly string[];
};

export type CraftPreferencesPatch = {
  readonly fitKeywords?: readonly string[];
  readonly tone?: string;
  readonly constraints?: readonly string[];
};

export type PreferencesFacade = {
  getApprovalBeforeSend(): Promise<boolean>;
  setApprovalBeforeSend(value: boolean): Promise<boolean>;
  getCraftPreferences(): Promise<CraftPreferences>;
  setCraftPreferences(patch: CraftPreferencesPatch): Promise<CraftPreferences>;
  /** On-device model path for local Agent — empty means not configured. */
  getLocalModelPath(): Promise<string | undefined>;
  setLocalModelPath(path: string | undefined): Promise<string | undefined>;
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
    async getCraftPreferences() {
      const settings = await store.get();
      return toCraft(settings);
    },
    async setCraftPreferences(patch) {
      const update: {
        fitKeywords?: string[];
        tone?: string;
        constraints?: string[];
      } = {};
      if (patch.fitKeywords !== undefined) {
        update.fitKeywords = normalizeList(patch.fitKeywords);
      }
      if (patch.tone !== undefined) {
        update.tone = normalizeTone(patch.tone);
      }
      if (patch.constraints !== undefined) {
        update.constraints = normalizeList(patch.constraints);
      }
      const next = await store.set(update);
      return toCraft(next);
    },
    async getLocalModelPath() {
      const settings = await store.get();
      const path = settings.ai.localModelPath?.trim();
      return path && path.length > 0 ? path : undefined;
    },
    async setLocalModelPath(path) {
      const trimmed = path?.trim() ?? "";
      const next = await store.set({
        ai: { localModelPath: trimmed.length > 0 ? trimmed : undefined },
      });
      const saved = next.ai.localModelPath?.trim();
      return saved && saved.length > 0 ? saved : undefined;
    },
  };
}

function toCraft(settings: {
  readonly fitKeywords: readonly string[];
  readonly tone: string;
  readonly constraints: readonly string[];
}): CraftPreferences {
  return {
    fitKeywords: [...settings.fitKeywords],
    tone: settings.tone,
    constraints: [...settings.constraints],
  };
}

function normalizeTone(value: string): string {
  return value.trim().slice(0, 120);
}

function normalizeList(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const item = raw.trim().replace(/\s+/g, " ");
    if (!item) {
      continue;
    }
    const key = item.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(item.slice(0, 80));
    if (out.length >= 40) {
      break;
    }
  }
  return out;
}
