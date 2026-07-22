import type {
  ApplicationId,
  FollowUpId,
  JobId,
  PipelineStage,
  PluginId,
  RoleId,
} from "@jobjitsu/shared";
import type { EventName } from "./names.js";

/** Coarse destination class for egress audit — never full payloads. */
export type EgressDestinationClass = "board" | "mail" | "file_export" | "other";

export type SendOutcome = "succeeded" | "failed" | "unknown";

/**
 * ID-centric payloads — no résumé bodies on high-volume events.
 */
export interface EventPayloadMap {
  "Agent.Started": { readonly runId?: string };
  "Agent.Paused": { readonly runId?: string };
  "Agent.Resumed": { readonly runId?: string };
  "Agent.Progress": {
    readonly stage?: PipelineStage;
    readonly count?: number;
    readonly message?: string;
  };
  "Agent.Idle": Record<string, never>;
  "Agent.Failed": { readonly code?: string; readonly message?: string };
  "Discovery.RolesFound": { readonly sourceId: string; readonly count: number };
  "Discovery.RolesCurated": { readonly count: number };
  "Application.DraftCreated": { readonly applicationId: ApplicationId; readonly roleId?: RoleId };
  "Application.Tailored": { readonly applicationId: ApplicationId };
  "Application.Updated": { readonly applicationId: ApplicationId };
  "Queue.Enqueued": { readonly applicationId: ApplicationId };
  "Queue.Approved": { readonly applicationId: ApplicationId };
  "Queue.Rejected": { readonly applicationId: ApplicationId };
  "Queue.Cleared": { readonly applicationId: ApplicationId };
  "Send.Attempted": {
    readonly applicationId: ApplicationId;
    readonly destinationClass: EgressDestinationClass;
  };
  "Send.Succeeded": {
    readonly applicationId: ApplicationId;
    readonly destinationClass: EgressDestinationClass;
  };
  "Send.Failed": {
    readonly applicationId: ApplicationId;
    readonly destinationClass: EgressDestinationClass;
    readonly code?: string;
  };
  "Send.Unknown": {
    readonly applicationId: ApplicationId;
    readonly destinationClass: EgressDestinationClass;
  };
  "FollowUp.Scheduled": {
    readonly followUpId: FollowUpId;
    readonly applicationId: ApplicationId;
    readonly notBefore: string;
  };
  "FollowUp.Due": { readonly followUpId: FollowUpId; readonly applicationId: ApplicationId };
  "FollowUp.Sent": { readonly followUpId: FollowUpId; readonly applicationId: ApplicationId };
  "FollowUp.Dismissed": { readonly followUpId: FollowUpId };
  "Ai.LocalModelLoading": { readonly providerId?: string };
  "Ai.LocalModelReady": { readonly providerId?: string; readonly locality: "local" | "remote" };
  "Ai.LocalModelFailed": { readonly providerId?: string; readonly code?: string };
  "Privacy.EgressRecorded": {
    readonly applicationId: ApplicationId;
    readonly destinationClass: EgressDestinationClass;
    readonly outcome: SendOutcome;
  };
  "Preferences.Changed": { readonly keys: readonly string[] };
  "Scheduler.JobRan": {
    readonly jobId: JobId;
    readonly jobType: string;
    readonly status: "succeeded" | "failed" | "deferred";
  };
  "Plugin.Enabled": { readonly pluginId: PluginId };
  "Plugin.Disabled": { readonly pluginId: PluginId };
}

export type DomainEvent<N extends EventName = EventName> = {
  readonly name: N;
  readonly payload: EventPayloadMap[N];
  readonly occurredAt: string;
  readonly id?: string;
};

export type EventHandler<N extends EventName = EventName> = (
  event: DomainEvent<N>,
) => void | Promise<void>;

export type Unsubscribe = () => void;
