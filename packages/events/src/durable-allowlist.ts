import { DURABLE_EVENT_NAMES, type DurableEventName, type EventName } from "./names.js";

/**
 * Trust-relevant categories required by PE02-S03 / EVENT_SYSTEM durability.
 * Used to assert the allowlist covers egress, approval, pause, and prefs.
 */
export const DURABLE_ALLOWLIST_REQUIREMENTS = {
  egress: [
    "Send.Attempted",
    "Send.Succeeded",
    "Send.Failed",
    "Send.Unknown",
    "Privacy.EgressRecorded",
  ],
  approval: ["Queue.Approved", "Queue.Rejected"],
  pause: ["Agent.Paused"],
  prefs: ["Preferences.Changed"],
} as const satisfies Record<string, readonly DurableEventName[]>;

export function isDurableEventName(name: EventName): name is DurableEventName {
  return (DURABLE_EVENT_NAMES as readonly string[]).includes(name);
}

/** Every required trust category name must appear in DURABLE_EVENT_NAMES. */
export function durableAllowlistCoversRequirements(
  names: readonly EventName[] = DURABLE_EVENT_NAMES,
): boolean {
  const set = new Set<string>(names);
  for (const group of Object.values(DURABLE_ALLOWLIST_REQUIREMENTS)) {
    for (const name of group) {
      if (!set.has(name)) {
        return false;
      }
    }
  }
  return true;
}
