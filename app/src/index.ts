/** Desktop shell identity — host/UI wiring grows under Desktop Foundation. */
export const APP_NAME = "JobJitsu" as const;

/** Sidebar destinations for the shell (placeholders until domain modules land). */
export const SHELL_NAV_ITEMS = [
  { id: "dojo", label: "Dojo" },
  { id: "opportunities", label: "Opportunities" },
  { id: "resume", label: "Resume" },
  { id: "inbox", label: "Inbox" },
  { id: "recruiters", label: "Recruiters" },
  { id: "analytics", label: "Analytics" },
  { id: "extensions", label: "Extensions" },
  { id: "settings", label: "Settings" },
] as const;

export type ShellNavId = (typeof SHELL_NAV_ITEMS)[number]["id"];

export const DEFAULT_SHELL_NAV_ID: ShellNavId = "dojo";

export function isShellNavId(value: string): value is ShellNavId {
  return SHELL_NAV_ITEMS.some((item) => item.id === value);
}

export function shellPageTitle(id: ShellNavId): string {
  if (id === "dojo") {
    return "Welcome";
  }
  const item = SHELL_NAV_ITEMS.find((entry) => entry.id === id);
  return item?.label ?? "Welcome";
}
