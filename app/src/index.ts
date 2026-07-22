/** Desktop shell identity — host/UI wiring grows under Desktop Foundation. */
export const APP_NAME = "JobJitsu" as const;

/**
 * Primary H1 destinations — nouns from docs/product/TERMINOLOGY.md
 * and docs/architecture/DESKTOP_ARCHITECTURE.md.
 */
export const SHELL_NAV_ITEMS = [
  { id: "applications", label: "Applications" },
  { id: "queue", label: "Queue" },
  { id: "follow-ups", label: "Follow-ups" },
  { id: "agent", label: "Agent" },
  { id: "preferences", label: "Preferences" },
  { id: "timeline", label: "Timeline" },
] as const;

export type ShellNavId = (typeof SHELL_NAV_ITEMS)[number]["id"];

export const DEFAULT_SHELL_NAV_ID: ShellNavId = "applications";

export function isShellNavId(value: string): value is ShellNavId {
  return SHELL_NAV_ITEMS.some((item) => item.id === value);
}

export function shellPageTitle(id: ShellNavId): string {
  const item = SHELL_NAV_ITEMS.find((entry) => entry.id === id);
  return item?.label ?? "Applications";
}
