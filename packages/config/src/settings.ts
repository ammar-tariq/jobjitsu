/**
 * App settings — policy the OS enforces on-device.
 * Defaults: approval-before-send on; notification sound off; dark theme.
 *
 * `ai` fields exist for future wiring only — no providers in Desktop Foundation.
 */

export interface QuietHours {
  /** Local time `HH:mm` (24h). */
  readonly start: string;
  /** Local time `HH:mm` (24h). */
  readonly end: string;
  /** IANA timezone optional — host may use system TZ when omitted. */
  readonly timeZone?: string;
}

/**
 * Reserved for later Agent runtime configuration.
 * Do not register AI providers because these fields exist.
 */
export interface AiSettings {
  readonly providerId?: string;
  readonly localModelPath?: string;
  readonly remoteEndpoint?: string;
}

export interface NotificationSettings {
  /** Default off per brand. */
  readonly soundEnabled: boolean;
  readonly quietHours?: QuietHours;
}

export interface AgentSettings {
  /** Max preparative applications per run — leverage over volume. */
  readonly maxThrowsPerRun?: number;
}

export type ThemePreference = "dark" | "light" | "system";

/** Full settings document stored on-device. */
export interface AppSettings {
  readonly requireApprovalBeforeSend: boolean;
  readonly theme: ThemePreference;
  readonly ai: AiSettings;
  readonly notifications: NotificationSettings;
  readonly agent: AgentSettings;
  readonly fitKeywords: readonly string[];
  readonly updatedAt?: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  requireApprovalBeforeSend: true,
  theme: "dark",
  ai: {},
  notifications: {
    soundEnabled: false,
  },
  agent: {},
  fitKeywords: [],
};

export interface SettingsStore {
  get(): Promise<AppSettings>;
  set(patch: Partial<AppSettings>): Promise<AppSettings>;
  replace(settings: AppSettings): Promise<AppSettings>;
}

export interface SettingsPolicy {
  requiresApprovalBeforeSend(settings: AppSettings): boolean;
  isInQuietHours(settings: AppSettings, at?: Date): boolean;
}

export function requiresApprovalBeforeSend(settings: AppSettings): boolean {
  return settings.requireApprovalBeforeSend;
}

/**
 * Quiet-hours check — inclusive window in local wall clock.
 * Cross-midnight windows (e.g. 22:00–07:00) are supported.
 */
export function isInQuietHours(settings: AppSettings, at: Date = new Date()): boolean {
  const quiet = settings.notifications.quietHours;
  if (!quiet) {
    return false;
  }

  const minutes = at.getHours() * 60 + at.getMinutes();
  const start = parseHhMm(quiet.start);
  const end = parseHhMm(quiet.end);
  if (start === null || end === null) {
    return false;
  }
  if (start === end) {
    return true;
  }
  if (start < end) {
    return minutes >= start && minutes < end;
  }
  return minutes >= start || minutes < end;
}

function parseHhMm(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (hours > 23 || mins > 59) {
    return null;
  }
  return hours * 60 + mins;
}

export const defaultSettingsPolicy: SettingsPolicy = {
  requiresApprovalBeforeSend,
  isInQuietHours,
};
