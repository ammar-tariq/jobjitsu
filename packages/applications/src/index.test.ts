import { describe, expect, it } from "vitest";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { createEntityId, type RoleId } from "@jobjitsu/shared";
import {
  PACKAGE_NAME,
  createApplicationDraft,
  createMemoryApplicationRepository,
  trackingStatusForStage,
  updateApplicationDraft,
} from "./index.js";

describe("@jobjitsu/applications drafts (PE08-S01)", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/applications");
  });

  it("creates and updates drafts with DATA_MODELS stage mapping", async () => {
    const repository = createMemoryApplicationRepository();
    const bus = createInMemoryEventBus();
    const names: string[] = [];
    bus.subscribeAll((event) => {
      names.push(event.name);
    });

    const created = await createApplicationDraft({
      repository,
      bus,
      input: {
        companyName: "Acme",
        roleTitle: "Staff Engineer",
        sourceUrl: "https://example.com/jobs/1",
        roleId: createEntityId("role") as RoleId,
        notes: "Manual fixture role",
      },
    });

    expect(created.application.stage).toBe("discover");
    expect(trackingStatusForStage(created.application.stage)).toBe("Discovered");
    expect(created.application.roleId).toBeTruthy();
    expect(names).toContain("Application.DraftCreated");

    const updated = await updateApplicationDraft({
      repository,
      bus,
      patch: {
        id: created.application.id,
        notes: "Edited on device",
        stage: "tailor",
      },
    });
    expect(updated.application.notes).toBe("Edited on device");
    expect(updated.application.stage).toBe("tailor");
    expect(trackingStatusForStage(updated.application.stage)).toBe("ResumePrepared");
    expect(names).toContain("Application.Updated");
    expect(names).toContain("Application.StageChanged");

    const listed = await repository.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(created.application.id);
  });

  it("soft-warns on duplicate keys but still creates", async () => {
    const repository = createMemoryApplicationRepository();
    const first = await createApplicationDraft({
      repository,
      input: {
        companyName: "Acme",
        roleTitle: "Staff Engineer",
        sourceUrl: "https://example.com/jobs/1",
      },
    });
    expect(first.duplicateWarning).toBeUndefined();

    const second = await createApplicationDraft({
      repository,
      input: {
        companyName: "  acme ",
        roleTitle: "Staff  Engineer",
        sourceUrl: "https://example.com/jobs/1",
      },
    });
    expect(second.duplicateWarning?.matchedApplicationId).toBe(first.application.id);
    expect(second.duplicateWarning?.message).toMatch(/similar application draft/i);
    expect(await repository.list()).toHaveLength(2);
  });

  it("allows drafts without a Job Provider role id", async () => {
    const repository = createMemoryApplicationRepository();
    const created = await createApplicationDraft({
      repository,
      input: { companyName: "Local Co", roleTitle: "Designer" },
    });
    expect(created.application.roleId).toBeUndefined();
    expect(created.application.companyName).toBe("Local Co");
  });
});
