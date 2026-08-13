/** Desktop shell identity — host/UI wiring grows under Desktop Foundation. */
export const APP_NAME = "JobJitsu" as const;

export type ShellNavItem = {
  readonly id:
    | "craft"
    | "applications"
    | "queue"
    | "follow-ups"
    | "profile"
    | "job-mail"
    | "sources"
    | "agent"
    | "timeline"
    | "preferences";
  readonly label: string;
};

export type ShellNavGroup = {
  readonly id: "work" | "you" | "system";
  readonly label: string;
  readonly items: readonly ShellNavItem[];
};

/**
 * Primary destinations — nouns from docs/product/TERMINOLOGY.md
 * and docs/product/SHELL_IA.md (Work / You / System).
 */
export const SHELL_NAV_GROUPS: readonly ShellNavGroup[] = [
  {
    id: "work",
    label: "Work",
    items: [
      { id: "craft", label: "Craft" },
      { id: "applications", label: "Applications" },
      { id: "queue", label: "Queue" },
      { id: "follow-ups", label: "Follow-ups" },
    ],
  },
  {
    id: "you",
    label: "You",
    items: [
      { id: "profile", label: "Profile" },
      { id: "job-mail", label: "Job Mail" },
      { id: "sources", label: "Sources" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { id: "agent", label: "Agent" },
      { id: "timeline", label: "Timeline" },
      { id: "preferences", label: "Preferences" },
    ],
  },
];

export const SHELL_NAV_ITEMS: readonly ShellNavItem[] = SHELL_NAV_GROUPS.flatMap(
  (group) => group.items,
);

export type ShellNavId = ShellNavItem["id"];

export const DEFAULT_SHELL_NAV_ID: ShellNavId = "craft";

export function isShellNavId(value: string): value is ShellNavId {
  return SHELL_NAV_ITEMS.some((item) => item.id === value);
}

export function shellPageTitle(id: ShellNavId): string {
  const item = SHELL_NAV_ITEMS.find((entry) => entry.id === id);
  return item?.label ?? "Applications";
}
