import type { EventBus } from "@jobjitsu/events";
import type { ApplicationId, FollowUpId } from "@jobjitsu/shared";
import type {
  ApplicationDraftInput,
  ApplicationDraftPatch,
  ApplicationRepository,
  CreateDraftResult,
  UpdateDraftResult,
} from "./types.js";

/**
 * Create a local application draft and emit Application.DraftCreated.
 * Never sends. Duplicate soft-warn is returned; create still proceeds.
 */
export async function createApplicationDraft(options: {
  readonly repository: ApplicationRepository;
  readonly bus?: EventBus;
  readonly input: ApplicationDraftInput;
}): Promise<CreateDraftResult> {
  const result = await options.repository.create(options.input);
  if (options.bus) {
    await options.bus.publish("Application.DraftCreated", {
      applicationId: result.application.id,
      roleId: result.application.roleId,
    });
  }
  return result;
}

/**
 * Update a local application draft and emit Application.Updated.
 * Stage changes also emit Application.StageChanged and Queue.* when relevant.
 * Follow-up schedule changes emit FollowUp.Scheduled / FollowUp.Dismissed.
 */
export async function updateApplicationDraft(options: {
  readonly repository: ApplicationRepository;
  readonly bus?: EventBus;
  readonly patch: ApplicationDraftPatch;
}): Promise<UpdateDraftResult> {
  const before = await options.repository.get(options.patch.id);
  const result = await options.repository.update(options.patch);
  if (options.bus) {
    await options.bus.publish("Application.Updated", {
      applicationId: result.application.id,
    });
    if (before && before.stage !== result.application.stage) {
      await options.bus.publish("Application.StageChanged", {
        applicationId: result.application.id,
        stage: result.application.stage,
      });
      if (result.application.stage === "queue") {
        await options.bus.publish("Queue.Enqueued", {
          applicationId: result.application.id,
        });
      } else if (result.application.stage === "approve") {
        await options.bus.publish("Queue.Approved", {
          applicationId: result.application.id,
        });
      } else if (before.stage === "queue" || before.stage === "approve") {
        await options.bus.publish("Queue.Rejected", {
          applicationId: result.application.id,
        });
      }
    }
    if (before?.followUpAt && !result.application.followUpAt && before.followUpId) {
      await options.bus.publish("FollowUp.Dismissed", {
        followUpId: before.followUpId as FollowUpId,
      });
    } else if (
      result.application.followUpAt &&
      result.application.followUpId &&
      before?.followUpAt !== result.application.followUpAt
    ) {
      await options.bus.publish("FollowUp.Scheduled", {
        followUpId: result.application.followUpId as FollowUpId,
        applicationId: result.application.id,
        notBefore: result.application.followUpAt,
      });
    }
  }
  return result;
}

/**
 * Delete a local application draft. Never sends.
 */
export async function deleteApplicationDraft(options: {
  readonly repository: ApplicationRepository;
  readonly bus?: EventBus;
  readonly id: ApplicationId;
}): Promise<boolean> {
  const existing = await options.repository.get(options.id);
  const removed = await options.repository.delete(options.id);
  if (removed && options.bus && existing) {
    await options.bus.publish("Application.Updated", {
      applicationId: options.id,
    });
  }
  return removed;
}
