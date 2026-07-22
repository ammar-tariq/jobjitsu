/**
 * Settings / preferences contracts — policy the OS enforces.
 * Defaults: approval-before-send on; notification sound off.
 */

export interface QuietHours {
  /** Local time `HH:mm` (24h). */
  readonly start: string;
  /** Local time `HH:mm` (24h). */
  readonly end: string;
  /** IANA timezone optional — host may use system TZ when omitted. */
  readonly timeZone?: string;
}

export interface AiSettings {
  /** Active provider id (local adapter by default when implementations exist). */
  readonly providerId?: string;
  /** Filesystem path to local model / runtime — user controlled. */
  readonly localModelPath?: string;
  /**
   * Optional remote endpoint — only when user explicitly configures.
   * UI must not label this as Local LLM.
   */
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

/**
 * Full settings document stored on-device.
 */
export interface AppSettings {
  readonly requireApprovalBeforeSend: boolean;
  readonly theme: "dark" | "light" | "system";
  readonly ai: AiSettings;
  readonly notifications: NotificationSettings;
  readonly agent: AgentSettings;
  /** Fit keywords / constraints for curation (opaque strings for now). */
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
  /** Replace entire document (import / reset). */
  replace(settings: AppSettings): Promise<AppSettings>;
}

/** Narrow policy helpers — pure contracts for queue/send/scheduler. */
export interface SettingsPolicy {
  requiresApprovalBeforeSend(settings: AppSettings): boolean;
  isInQuietHours(settings: AppSettings, at?: Date): boolean;
}
