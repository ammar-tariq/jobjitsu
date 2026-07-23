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
 * ID-centric payloads — no résumé bodies on Progress / high-volume events.
 * Full documents stay in `@jobjitsu/storage`; events reference them by id.
 */
export interface EventPayloadMap {
  "App.Started": { readonly version?: string };
  "Plugin.Loaded": { readonly pluginId: PluginId | string };
  "Resume.Imported": { readonly resumeId: string };
  /**
   * User attached a reviewed import to identity and/or a path — ids only.
   * Never implies outbound send.
   */
  "Resume.Attached": {
    readonly resumeId: string;
    readonly profileId?: string;
    readonly pathId?: string;
  };
  /** Résumé prepared on-device — ID only, never full body on the bus. */
  "Resume.Generated": { readonly resumeId: string };
  "Job.Imported": { readonly roleId: RoleId };
  "Jobs.Synced": { readonly sourceId: string; readonly count: number };
  /** Fake or real mailbox sync finished — counts only. */
  "Email.Synced": { readonly channelId: string; readonly messageCount: number };

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
  "Workflow.Started": { readonly workflowId: string };
  "Workflow.Completed": { readonly workflowId: string };
  "Workflow.Failed": { readonly workflowId: string; readonly code?: string };

  "Discovery.RolesFound": { readonly sourceId: string; readonly count: number };
  "Discovery.RolesCurated": { readonly count: number };

  "Application.DraftCreated": { readonly applicationId: ApplicationId; readonly roleId?: RoleId };
  "Application.Tailored": { readonly applicationId: ApplicationId };
  "Application.Updated": { readonly applicationId: ApplicationId };
  "Application.StageChanged": {
    readonly applicationId: ApplicationId;
    readonly stage: PipelineStage;
  };
  "Application.Submitted": {
    readonly applicationId: ApplicationId;
    readonly destinationClass?: EgressDestinationClass;
  };

  "Knowledge.Updated": { readonly entryId: string; readonly kind: string };

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

  "Ai.Started": { readonly taskId?: string; readonly providerId?: string };
  "Ai.Finished": { readonly taskId?: string; readonly providerId?: string };
  "Ai.ValidationCompleted": {
    readonly pass: number;
    readonly warn: number;
    readonly fail: number;
  };
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
  "Extension.Registered": { readonly extensionId: string };
  "Extension.Enabled": { readonly extensionId: string };
  "Extension.Disabled": { readonly extensionId: string };
  "Extension.Unloaded": { readonly extensionId: string };
  "Extension.Failed": {
    readonly extensionId: string;
    readonly code?: string;
    readonly message?: string;
  };
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

/** Allowed keys on Agent.Progress — keeps résumé bodies off the bus. */
export const AGENT_PROGRESS_PAYLOAD_KEYS = ["stage", "count", "message"] as const;
