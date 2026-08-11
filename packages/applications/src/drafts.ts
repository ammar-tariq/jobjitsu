import type { EventBus } from "@jobjitsu/events";
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
 * Stage changes also emit Application.StageChanged.
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
    }
  }
  return result;
}
