/**
 * Typed domain event names — facts that happened.
 * Catalog SSOT: docs/architecture/EVENT_SYSTEM.md
 */
export const EVENT_NAMES = [
  // App / identity / mail
  "App.Started",
  "Plugin.Loaded",
  "Resume.Imported",
  "Resume.Attached",
  "Resume.Generated",
  "Job.Imported",
  "Jobs.Synced",
  "Email.Synced",
  // Agent / Workflow
  "Agent.Started",
  "Agent.Paused",
  "Agent.Resumed",
  "Agent.Progress",
  "Agent.Idle",
  "Agent.Failed",
  "Workflow.Started",
  "Workflow.Completed",
  "Workflow.Failed",
  // Discovery
  "Discovery.RolesFound",
  "Discovery.RolesCurated",
  // Applications
  "Application.DraftCreated",
  "Application.Tailored",
  "Application.Updated",
  "Application.StageChanged",
  "Application.Submitted",
  // Knowledge
  "Knowledge.Updated",
  // Queue
  "Queue.Enqueued",
  "Queue.Approved",
  "Queue.Rejected",
  "Queue.Cleared",
  // Send (egress)
  "Send.Attempted",
  "Send.Succeeded",
  "Send.Failed",
  "Send.Unknown",
  // Follow-ups
  "FollowUp.Scheduled",
  "FollowUp.Due",
  "FollowUp.Sent",
  "FollowUp.Dismissed",
  // AI / Privacy
  "Ai.Started",
  "Ai.Finished",
  "Ai.ValidationCompleted",
  "Ai.LocalModelLoading",
  "Ai.LocalModelReady",
  "Ai.LocalModelFailed",
  "Privacy.EgressRecorded",
  // Extensions / Plugins / Preferences / System
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

export function isEventName(value: string): value is EventName {
  return (EVENT_NAMES as readonly string[]).includes(value);
}

/**
 * Events that must be durably recorded for trust / timeline.
 * @see EVENT_SYSTEM.md durability allowlist
 */
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
  "Application.Submitted",
] as const satisfies readonly EventName[];

export type DurableEventName = (typeof DURABLE_EVENT_NAMES)[number];
