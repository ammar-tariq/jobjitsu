import { describe, expect, it, vi } from "vitest";
import { createFakeAiProvider, createFakeContextAssembler } from "@jobjitsu/ai";
import {
  createApplicationDraft,
  createMemoryApplicationRepository,
  trackingStatusForStage,
} from "@jobjitsu/applications";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { tailorApplicationDraftWithAi } from "./tailor-application-draft.js";

describe("tailorApplicationDraftWithAi (PE03-S04)", () => {
  it("writes an editable draft and emits Application.Tailored without sending", async () => {
    const repository = createMemoryApplicationRepository();
    const bus = createInMemoryEventBus();
    const names: string[] = [];
    bus.subscribeAll((event) => {
      names.push(event.name);
    });

    const created = await createApplicationDraft({
      repository,
      input: {
        companyName: "Acme",
        roleTitle: "Staff Engineer",
        notes: "On-device craft",
      },
    });

    const result = await tailorApplicationDraftWithAi({
      ai: createFakeAiProvider({ id: "fake-ai" }),
      assembler: createFakeContextAssembler(),
      repository,
      bus,
      input: { applicationId: created.application.id },
    });

    expect(result.tailorStatus).toBe("ready");
    expect(result.draftText).toMatch(/Tailored résumé draft/i);
    expect(result.application?.resumeDraftText).toBe(result.draftText);
    expect(result.application?.stage).toBe("tailor");
    expect(trackingStatusForStage(result.application!.stage)).toBe("ResumePrepared");
    expect(names).toContain("Application.Tailored");
    expect(names).not.toContain("Application.Sent");
    expect(names).not.toContain("Queue.Enqueued");
  });

  it("returns calm unavailable when Agent is not ready", async () => {
    const repository = createMemoryApplicationRepository();
    const created = await createApplicationDraft({
      repository,
      input: { companyName: "Acme", roleTitle: "Designer" },
    });

    const result = await tailorApplicationDraftWithAi({
      ai: createFakeAiProvider({ healthStatus: "unavailable" }),
      assembler: createFakeContextAssembler(),
      repository,
      input: { applicationId: created.application.id },
    });

    expect(result.tailorStatus).toBe("unavailable");
    expect(result.draftText).toBe("");
    expect(result.application?.stage).toBe("discover");
  });

  it("never invokes send when complete succeeds (fence: tailor ↛ send)", async () => {
    const repository = createMemoryApplicationRepository();
    const created = await createApplicationDraft({
      repository,
      input: { companyName: "Acme", roleTitle: "Engineer" },
    });

    const send = vi.fn();
    const ai = {
      ...createFakeAiProvider(),
      send,
    };

    const result = await tailorApplicationDraftWithAi({
      ai,
      assembler: createFakeContextAssembler(),
      repository,
      input: { applicationId: created.application.id },
    });

    expect(result.tailorStatus).toBe("ready");
    expect(send).not.toHaveBeenCalled();
    expect(Object.keys(ai)).not.toContain("approveSend");
  });
});
