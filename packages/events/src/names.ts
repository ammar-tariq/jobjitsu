/**
 * Typed domain event names — facts that happened.
 * @see docs/architecture/EVENT_SYSTEM.md
 */
export const EVENT_NAMES = [
  "Agent.Started",
  "Agent.Paused",
  "Agent.Resumed",
  "Agent.Progress",
  "Agent.Idle",
  "Agent.Failed",
  "Discovery.RolesFound",
  "Discovery.RolesCurated",
  "Application.DraftCreated",
  "Application.Tailored",
  "Application.Updated",
  "Queue.Enqueued",
  "Queue.Approved",
  "Queue.Rejected",
  "Queue.Cleared",
  "Send.Attempted",
  "Send.Succeeded",
  "Send.Failed",
  "Send.Unknown",
  "FollowUp.Scheduled",
  "FollowUp.Due",
  "FollowUp.Sent",
  "FollowUp.Dismissed",
  "Ai.LocalModelLoading",
  "Ai.LocalModelReady",
  "Ai.LocalModelFailed",
  "Privacy.EgressRecorded",
  "Preferences.Changed",
  "Scheduler.JobRan",
  "Plugin.Enabled",
  "Plugin.Disabled",
  "Extension.Registered",
  "Extension.Enabled",
  "Extension.Disabled",
  "Extension.Unloaded",
  "Extension.Failed",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/** Events that must be durably recorded for trust / timeline. */
export const DURABLE_EVENT_NAMES = [
  "Send.Attempted",
  "Send.Succeeded",
  "Send.Failed",
  "Send.Unknown",
  "Privacy.EgressRecorded",
  "Queue.Approved",
  "Queue.Rejected",
  "Agent.Paused",
  "Preferences.Changed",
  "Plugin.Enabled",
  "Plugin.Disabled",
  "Extension.Enabled",
  "Extension.Disabled",
] as const satisfies readonly EventName[];

export type DurableEventName = (typeof DURABLE_EVENT_NAMES)[number];
