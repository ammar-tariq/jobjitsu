import { describe, expect, it } from "vitest";
import { createFakeAiProvider, createFakeContextAssembler } from "@jobjitsu/ai";
import { createMemoryApplicationRepository } from "@jobjitsu/applications";
import { createInMemoryEventBus, type EventPayloadMap } from "@jobjitsu/events";
import {
  createMemoryPathLibrary,
  createMemoryProfileRepository,
  createMemoryResumeLibrary,
} from "@jobjitsu/identity";
import { createMemorySettingsStore, createPreferencesFacade } from "@jobjitsu/preferences";
import { createMemoryDataRootStore } from "../host/data-root-store.js";
import { createStubFolderPicker } from "../host/folder-picker.js";
import { parseImportDraftWithAi } from "../host/parse-import-draft.js";
import { refineCraftChatWithAi } from "../host/craft-chat-refine.js";
import { generateCraftDraftsWithAi } from "../host/craft-generate.js";
import { generateApplicationCoverLetterWithAi } from "../host/cover-letter-application-draft.js";
import { tailorApplicationDraftWithAi } from "../host/tailor-application-draft.js";
import {
  IPC_ALLOWLIST,
  createHostIpcDispatcher,
  createIpcBridge,
  createIpcDispatcher,
  isIpcCommandName,
} from "./index.js";

describe("IPC allowlist", () => {
  it("exports ping, theme, ai status, and identity commands", () => {
    expect(IPC_ALLOWLIST).toEqual([
      "ping",
      "theme.get",
      "theme.set",
      "ai.getStatus",
      "ai.listLocalModels",
      "identity.getProfile",
      "identity.setProfile",
      "identity.listProfiles",
      "identity.selectProfile",
      "identity.listResumeVersions",
      "identity.importResume",
      "identity.parseImportDraft",
      "identity.getSelectedResume",
      "identity.selectResume",
      "identity.attachResume",
      "identity.listPaths",
      "identity.upsertPath",
      "identity.archivePath",
      "identity.selectPath",
      "storage.getDataRoot",
      "storage.setDataRoot",
      "storage.resetDataRoot",
      "storage.pickDataRoot",
      "preferences.getApprovalBeforeSend",
      "preferences.setApprovalBeforeSend",
      "preferences.getOnboardingCompleted",
      "preferences.setOnboardingCompleted",
      "preferences.getCraftPreferences",
      "preferences.setCraftPreferences",
      "preferences.getLocalModelPath",
      "preferences.setLocalModelPath",
      "applications.list",
      "applications.createDraft",
      "applications.updateDraft",
      "applications.deleteDraft",
      "applications.tailorDraft",
      "applications.generateCoverLetter",
      "craft.generate",
      "craft.exportResume",
      "craft.chatRefine",
      "craft.getSession",
      "craft.patchSession",
      "craft.prepareDrafts",
      "system.getResources",
    ]);
  });

  it("rejects AI complete as an allowlisted name", () => {
    expect(isIpcCommandName("ai.complete")).toBe(false);
    expect(isIpcCommandName("ai.embed")).toBe(false);
    expect(isIpcCommandName("ping")).toBe(true);
    expect(isIpcCommandName("identity.selectResume")).toBe(true);
  });
});

describe("IPC dispatcher", () => {
  it("fails closed on unknown commands", async () => {
    const dispatcher = createIpcDispatcher();
    const result = await dispatcher.invoke("ai.complete", { prompt: "leak" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("permission");
      expect(result.error.detail).toBe("denied:ai.complete");
    }
  });

  it("returns unavailable when an allowlisted command has no handler", async () => {
    const dispatcher = createIpcDispatcher({});
    const result = await dispatcher.invoke("ping");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("unavailable");
    }
  });
});

describe("typed IPC bridge", () => {
  it("pings the host through the allowlist", async () => {
    const bridge = createIpcBridge(createHostIpcDispatcher());
    const result = await bridge.ping();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ ok: true, service: "jobjitsu-host" });
    }
  });

  it("reads local resource usage without career egress", async () => {
    const bridge = createIpcBridge(createHostIpcDispatcher());
    const result = await bridge.getResources();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.resources.message).toMatch(/device|Browser|desktop/i);
      expect(typeof result.value.resources.available).toBe("boolean");
    }
  });

  it("reads and writes theme stubs", async () => {
    const bridge = createIpcBridge(createHostIpcDispatcher({ initialTheme: "dark" }));
    const before = await bridge.getTheme();
    expect(before.ok && before.value.theme).toBe("dark");

    const after = await bridge.setTheme("light");
    expect(after.ok && after.value.theme).toBe("light");
  });

  it("exposes ai.getStatus without complete", async () => {
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        aiStatus: { ready: true, locality: "local" },
      }),
    );
    const status = await bridge.getAiStatus();
    expect(status.ok && status.value).toEqual({ ready: true, locality: "local" });

    expect(bridge).not.toHaveProperty("complete");

    const listedUnavailable = await bridge.listLocalModels();
    expect(listedUnavailable.ok && listedUnavailable.value.listStatus).toBe("unavailable");
  });

  it("lists local Ollama models via host without exposing send", async () => {
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        listLocalModels: async () => ({
          models: ["qwen3:8b", "qwen3.6:27b"],
          listStatus: "ready",
        }),
      }),
    );
    const listed = await bridge.listLocalModels();
    expect(listed.ok && listed.value).toEqual({
      models: ["qwen3:8b", "qwen3.6:27b"],
      listStatus: "ready",
    });
    expect(bridge).not.toHaveProperty("complete");
    expect(bridge).not.toHaveProperty("approveSend");
  });

  it("exposes bridge keys for allowlisted methods only", async () => {
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        aiStatus: { ready: true, locality: "local" },
      }),
    );
    expect(Object.keys(bridge).sort()).toEqual([
      "archivePath",
      "attachResume",
      "createApplicationDraft",
      "deleteApplicationDraft",
      "exportCraftResume",
      "generateApplicationCoverLetter",
      "generateCraftDrafts",
      "getAiStatus",
      "getApprovalBeforeSend",
      "getCraftPreferences",
      "getCraftSession",
      "getDataRoot",
      "getLocalModelPath",
      "getOnboardingCompleted",
      "getProfile",
      "getResources",
      "getSelectedResume",
      "getTheme",
      "importResume",
      "listApplications",
      "listLocalModels",
      "listPaths",
      "listProfiles",
      "listResumeVersions",
      "parseImportDraft",
      "patchCraftSession",
      "pickDataRoot",
      "ping",
      "prepareCraftDrafts",
      "refineCraftChat",
      "resetDataRoot",
      "selectPath",
      "selectProfile",
      "selectResume",
      "setApprovalBeforeSend",
      "setCraftPreferences",
      "setDataRoot",
      "setLocalModelPath",
      "setOnboardingCompleted",
      "setProfile",
      "setTheme",
      "tailorApplicationDraft",
      "updateApplicationDraft",
      "upsertPath",
    ]);
  });

  it("prefills import draft via host parse without exposing AI complete", async () => {
    const ai = createFakeAiProvider();
    const assembler = createFakeContextAssembler();
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        parseImportDraft: (input) => parseImportDraftWithAi({ ai, assembler, input }),
      }),
    );

    const parsed = await bridge.parseImportDraft({
      contentBase64: btoa("# Sam Chen\nsam@example.com\n"),
      fileName: "sam.md",
      contentType: "text/markdown",
    });
    expect(parsed.ok && parsed.value.parseStatus).toBe("prefilled");
    expect(parsed.ok && parsed.value.contactName).toBe("Sam Chen");
    expect(parsed.ok && parsed.value.contactEmail).toBe("sam@example.com");
    expect(bridge).not.toHaveProperty("complete");
  });

  it("returns calm unavailable parse when Agent is not wired", async () => {
    const bridge = createIpcBridge(createHostIpcDispatcher());
    const parsed = await bridge.parseImportDraft({
      contentBase64: btoa("# Sam Chen\n"),
      fileName: "sam.md",
    });
    expect(parsed.ok && parsed.value).toEqual({
      contactName: "",
      contactEmail: "",
      notes: "",
      parseStatus: "unavailable",
    });
  });

  it("tailors application résumé draft via host without exposing send", async () => {
    const ai = createFakeAiProvider();
    const assembler = createFakeContextAssembler();
    const applications = createMemoryApplicationRepository();
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        applications,
        tailorApplicationDraft: (input) =>
          tailorApplicationDraftWithAi({ ai, assembler, repository: applications, input }),
      }),
    );

    const created = await bridge.createApplicationDraft({
      companyName: "Acme",
      roleTitle: "Staff Engineer",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }

    const tailored = await bridge.tailorApplicationDraft({
      applicationId: created.value.application.id,
    });
    expect(tailored.ok && tailored.value.tailorStatus).toBe("ready");
    expect(tailored.ok && tailored.value.draftText).toMatch(/Tailored résumé draft/i);
    expect(tailored.ok && tailored.value.application?.trackingStatus).toBe("ResumePrepared");
    expect(bridge).not.toHaveProperty("complete");
    expect(bridge).not.toHaveProperty("approveSend");
  });

  it("clarifies thin craft chat without exposing send", async () => {
    const ai = createFakeAiProvider();
    const assembler = createFakeContextAssembler();
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        refineCraftChat: (input) => refineCraftChatWithAi({ ai, assembler, input }),
      }),
    );
    const clarified = await bridge.refineCraftChat({
      message: "Rewrite everything",
      target: "resume",
      resumeText: "x",
      jobDescription: "y",
      resumeDraft: "",
      coverLetterDraft: "",
    });
    expect(clarified.ok && clarified.value.chatStatus).toBe("clarify");
    expect(clarified.ok && clarified.value.clarifyingQuestions.length).toBeGreaterThan(0);
    expect(bridge).not.toHaveProperty("approveSend");
  });

  it("exports résumé HTML and PDF on device without sending", async () => {
    const { createStubFileSaver } = await import("../host/file-saver.js");
    const saved: string[] = [];
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        fileSaver: createStubFileSaver(async ({ defaultPath, contents }) => {
          saved.push(defaultPath);
          expect(contents).toBeTruthy();
          return { status: "saved", path: `/tmp/${defaultPath}` };
        }),
      }),
    );
    const preview = await bridge.exportCraftResume({
      draftText: "Sam Chen\nStaff engineer",
      format: "html",
    });
    expect(preview.ok && preview.value.exportStatus).toBe("ready");
    expect(preview.ok && preview.value.html).toContain("Sam Chen");

    const pdf = await bridge.exportCraftResume({
      draftText: "Sam Chen\nStaff engineer",
      format: "pdf",
      save: true,
    });
    expect(pdf.ok && pdf.value.exportStatus).toBe("saved");
    expect(pdf.ok && pdf.value.pdfBase64.length).toBeGreaterThan(20);
    expect(saved).toContain("jobjitsu-resume-draft.pdf");
    expect(bridge).not.toHaveProperty("approveSend");
  });

  it("generates craft drafts via host without exposing send", async () => {
    const ai = createFakeAiProvider();
    const assembler = createFakeContextAssembler();
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        generateCraftDrafts: (input) => generateCraftDraftsWithAi({ ai, assembler, input }),
      }),
    );
    const crafted = await bridge.generateCraftDrafts({
      kind: "both",
      resumeText: "Sam Chen\nStaff engineer",
      jobDescription: "Staff Engineer at Acme",
    });
    expect(crafted.ok && crafted.value.craftStatus).toBe("ready");
    expect(crafted.ok && crafted.value.resumeDraft).toMatch(/Tailored résumé draft/i);
    expect(crafted.ok && crafted.value.coverLetterDraft).toMatch(/Cover letter draft/i);
    expect(bridge).not.toHaveProperty("complete");
    expect(bridge).not.toHaveProperty("approveSend");
  });

  it("returns calm unavailable tailor when host use-case is not wired", async () => {
    const bridge = createIpcBridge(createHostIpcDispatcher());
    const tailored = await bridge.tailorApplicationDraft({
      applicationId: "application_missing",
    });
    expect(tailored.ok && tailored.value).toEqual({
      application: null,
      draftText: "",
      tailorStatus: "unavailable",
    });
  });

  it("generates cover letter drafts via host without exposing send", async () => {
    const ai = createFakeAiProvider();
    const assembler = createFakeContextAssembler();
    const applications = createMemoryApplicationRepository();
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        applications,
        generateApplicationCoverLetter: (input) =>
          generateApplicationCoverLetterWithAi({
            ai,
            assembler,
            repository: applications,
            input,
          }),
      }),
    );

    const created = await bridge.createApplicationDraft({
      companyName: "Acme",
      roleTitle: "Staff Engineer",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }

    const letter = await bridge.generateApplicationCoverLetter({
      applicationId: created.value.application.id,
    });
    expect(letter.ok && letter.value.coverLetterStatus).toBe("ready");
    expect(letter.ok && letter.value.draftText).toMatch(/Cover letter draft/i);
    expect(letter.ok && letter.value.application?.coverLetterDraftText).toMatch(
      /Cover letter draft/i,
    );
    expect(bridge).not.toHaveProperty("complete");
    expect(bridge).not.toHaveProperty("approveSend");
  });

  it("returns calm unavailable cover letter when host use-case is not wired", async () => {
    const bridge = createIpcBridge(createHostIpcDispatcher());
    const letter = await bridge.generateApplicationCoverLetter({
      applicationId: "application_missing",
    });
    expect(letter.ok && letter.value).toEqual({
      application: null,
      draftText: "",
      coverLetterStatus: "unavailable",
    });
  });

  it("reads and writes profile through identity APIs", async () => {
    const profiles = createMemoryProfileRepository();
    const bridge = createIpcBridge(createHostIpcDispatcher({ profiles }));

    const empty = await bridge.getProfile();
    expect(empty.ok && empty.value.profile).toBeNull();

    const saved = await bridge.setProfile({
      displayName: "Sam Chen",
      email: "sam@example.com",
      location: "On this device",
    });
    expect(saved.ok).toBe(true);
    if (saved.ok) {
      expect(saved.value.profile.displayName).toBe("Sam Chen");
      expect(saved.value.profile.location).toMatch(/device/i);
    }

    const loaded = await bridge.getProfile();
    expect(loaded.ok && loaded.value.profile?.displayName).toBe("Sam Chen");
    expect(await profiles.get()).toEqual(saved.ok ? saved.value.profile : undefined);
  });

  it("imports a resume through identity APIs and emits Resume.Imported id only", async () => {
    const bus = createInMemoryEventBus();
    const imported: string[] = [];
    bus.subscribe("Resume.Imported", async (event) => {
      imported.push(event.payload.resumeId);
    });

    const resumeLibrary = createMemoryResumeLibrary();
    const bridge = createIpcBridge(createHostIpcDispatcher({ resumeLibrary, bus }));

    const contentBase64 = btoa("# Sam Chen\n");
    const saved = await bridge.importResume({
      label: "Baseline 2026",
      fileName: "sam.md",
      contentBase64,
      contentType: "text/markdown",
    });
    expect(saved.ok).toBe(true);
    if (saved.ok) {
      expect(saved.value.version.label).toBe("Baseline 2026");
      expect(saved.value.version.format).toBe("document");
      expect(imported).toEqual([saved.value.version.id]);
    }

    const listed = await bridge.listResumeVersions();
    expect(listed.ok && listed.value.versions).toHaveLength(1);
    expect(listed.ok && listed.value.versions[0]?.label).toBe("Baseline 2026");
    expect(listed.ok && listed.value.selectedId).toBe(saved.ok ? saved.value.version.id : null);
  });

  it("attaches a reviewed resume to path and optionally identity", async () => {
    const profiles = createMemoryProfileRepository();
    const pathLibrary = createMemoryPathLibrary();
    const resumeLibrary = createMemoryResumeLibrary();
    const bus = createInMemoryEventBus();
    const attached: EventPayloadMap["Resume.Attached"][] = [];
    bus.subscribe("Resume.Attached", async (event) => {
      attached.push(event.payload);
    });

    const profile = await profiles.upsert({
      displayName: "Sam Chen",
      email: "keep@example.com",
    });
    const path = await pathLibrary.upsert({
      name: "Fullstack",
      profileId: profile.id,
    });
    const version = await resumeLibrary.import({
      label: "Baseline",
      fileName: "a.md",
      bytes: new TextEncoder().encode("a"),
      pathId: path.id,
      profileId: profile.id,
      contactName: "Other",
      contactEmail: "other@example.com",
    });

    const bridge = createIpcBridge(
      createHostIpcDispatcher({ profiles, pathLibrary, resumeLibrary, bus }),
    );
    const pathOnly = await bridge.attachResume({
      resumeId: version.id,
      pathId: path.id,
    });
    expect(pathOnly.ok).toBe(true);
    expect((await profiles.get())?.email).toBe("keep@example.com");
    expect((await pathLibrary.get(path.id))?.selectedResumeVersionId).toBe(version.id);
    expect(attached[0]).toEqual({ resumeId: version.id, pathId: path.id });
  });

  it("returns a calm error when import payload is empty", async () => {
    const resumeLibrary = createMemoryResumeLibrary();
    const bridge = createIpcBridge(createHostIpcDispatcher({ resumeLibrary }));
    const result = await bridge.importResume({
      label: "Empty",
      fileName: "empty.txt",
      contentBase64: btoa(""),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/empty/i);
    }
  });

  it("selects a resume version without exposing send on the bridge", async () => {
    const resumeLibrary = createMemoryResumeLibrary();
    const first = await resumeLibrary.import({
      label: "Baseline",
      fileName: "a.md",
      bytes: new TextEncoder().encode("a"),
    });
    const second = await resumeLibrary.import({
      label: "Alt",
      fileName: "b.md",
      bytes: new TextEncoder().encode("b"),
      parentVersionId: first.id,
    });

    const bridge = createIpcBridge(createHostIpcDispatcher({ resumeLibrary }));
    expect(bridge).not.toHaveProperty("send");
    expect(bridge).not.toHaveProperty("approveSend");

    const selected = await bridge.selectResume(second.id);
    expect(selected.ok && selected.value.version.id).toBe(second.id);
    expect(selected.ok && selected.value.version.parentVersionId).toBe(first.id);

    const current = await bridge.getSelectedResume();
    expect(current.ok && current.value.version?.id).toBe(second.id);

    const listed = await bridge.listResumeVersions();
    expect(listed.ok && listed.value.selectedId).toBe(second.id);
    expect(listed.ok && listed.value.versions).toHaveLength(2);
  });

  it("creates and selects career paths without send", async () => {
    const pathLibrary = createMemoryPathLibrary();
    const bridge = createIpcBridge(createHostIpcDispatcher({ pathLibrary }));

    expect(bridge).not.toHaveProperty("send");

    const created = await bridge.upsertPath({ name: "Fullstack Developer" });
    expect(created.ok && created.value.path.name).toBe("Fullstack Developer");

    const mobile = await bridge.upsertPath({ name: "Mobile App", notes: "React Native" });
    expect(mobile.ok).toBe(true);

    const listed = await bridge.listPaths();
    expect(listed.ok && listed.value.paths).toHaveLength(2);
    expect(listed.ok && listed.value.selectedId).toBe(created.ok ? created.value.path.id : null);

    if (!mobile.ok) {
      return;
    }
    const selected = await bridge.selectPath(mobile.value.path.id);
    expect(selected.ok && selected.value.path.name).toBe("Mobile App");

    const archived = await bridge.archivePath(mobile.value.path.id);
    expect(archived.ok && archived.value.path.archived).toBe(true);

    const after = await bridge.listPaths();
    expect(after.ok && after.value.paths).toHaveLength(1);
    expect(after.ok && after.value.selectedId).toBeNull();
  });

  it("reads and updates the on-device data folder through storage APIs", async () => {
    const bus = createInMemoryEventBus();
    const changed: string[][] = [];
    bus.subscribe("Preferences.Changed", async (event) => {
      changed.push([...event.payload.keys]);
    });

    const dataRoot = createMemoryDataRootStore({
      defaultPath: "/Users/sam/Library/Application Support/JobJitsu",
    });
    const bridge = createIpcBridge(createHostIpcDispatcher({ dataRoot, bus }));

    const before = await bridge.getDataRoot();
    expect(before.ok && before.value.dataRoot.path).toContain("JobJitsu");
    expect(before.ok && before.value.dataRoot.isCustom).toBe(false);

    const saved = await bridge.setDataRoot("/Volumes/Vault/JobJitsu");
    expect(saved.ok && saved.value.dataRoot.path).toBe("/Volumes/Vault/JobJitsu");
    expect(saved.ok && saved.value.dataRoot.isCustom).toBe(true);
    expect(changed).toEqual([["dataRoot"]]);

    const reset = await bridge.resetDataRoot();
    expect(reset.ok && reset.value.dataRoot.isCustom).toBe(false);
    expect(changed).toEqual([["dataRoot"], ["dataRoot"]]);
  });

  it("picks a data folder through the host folder picker", async () => {
    const bus = createInMemoryEventBus();
    const changed: string[][] = [];
    bus.subscribe("Preferences.Changed", async (event) => {
      changed.push([...event.payload.keys]);
    });

    const dataRoot = createMemoryDataRootStore({
      defaultPath: "/Users/sam/Library/Application Support/JobJitsu",
    });
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        dataRoot,
        folderPicker: createStubFolderPicker(async () => "/Volumes/Vault/JobJitsu"),
        bus,
      }),
    );

    const picked = await bridge.pickDataRoot();
    expect(picked.ok && picked.value.cancelled).toBe(false);
    expect(picked.ok && picked.value.dataRoot?.path).toBe("/Volumes/Vault/JobJitsu");
    expect(changed).toEqual([["dataRoot"]]);

    const cancelled = await createIpcBridge(
      createHostIpcDispatcher({
        dataRoot,
        folderPicker: createStubFolderPicker(async () => null),
        bus,
      }),
    ).pickDataRoot();
    expect(cancelled.ok && cancelled.value.cancelled).toBe(true);
    expect(cancelled.ok && cancelled.value.dataRoot).toBeNull();
  });

  it("defaults approval-before-send on and emits Preferences.Changed on edit", async () => {
    const bus = createInMemoryEventBus();
    const changed: string[][] = [];
    bus.subscribe("Preferences.Changed", async (event) => {
      changed.push([...event.payload.keys]);
    });

    const preferences = createPreferencesFacade(createMemorySettingsStore());
    const bridge = createIpcBridge(createHostIpcDispatcher({ preferences, bus }));

    const before = await bridge.getApprovalBeforeSend();
    expect(before.ok && before.value.requireApprovalBeforeSend).toBe(true);

    const after = await bridge.setApprovalBeforeSend(false);
    expect(after.ok && after.value.requireApprovalBeforeSend).toBe(false);
    expect(changed).toEqual([["requireApprovalBeforeSend"]]);
    expect(await preferences.getApprovalBeforeSend()).toBe(false);
  });

  it("persists fit tone and constraints through preferences APIs", async () => {
    const bus = createInMemoryEventBus();
    const changed: string[][] = [];
    bus.subscribe("Preferences.Changed", async (event) => {
      changed.push([...event.payload.keys]);
    });

    const preferences = createPreferencesFacade(createMemorySettingsStore());
    const bridge = createIpcBridge(createHostIpcDispatcher({ preferences, bus }));

    const before = await bridge.getCraftPreferences();
    expect(before.ok && before.value.craft).toEqual({
      fitKeywords: [],
      tone: "",
      constraints: [],
    });

    const saved = await bridge.setCraftPreferences({
      fitKeywords: ["remote", "platform"],
      tone: "calm and precise",
      constraints: ["no relocate"],
    });
    expect(saved.ok && saved.value.craft.fitKeywords).toEqual(["remote", "platform"]);
    expect(changed).toEqual([["fitKeywords", "tone", "constraints"]]);
    expect(await preferences.getCraftPreferences()).toEqual({
      fitKeywords: ["remote", "platform"],
      tone: "calm and precise",
      constraints: ["no relocate"],
    });
  });

  it("reads and writes local model path through preferences APIs", async () => {
    const bus = createInMemoryEventBus();
    const changed: string[][] = [];
    bus.subscribe("Preferences.Changed", async (event) => {
      changed.push([...event.payload.keys]);
    });

    const preferences = createPreferencesFacade(createMemorySettingsStore());
    const bridge = createIpcBridge(createHostIpcDispatcher({ preferences, bus }));

    const before = await bridge.getLocalModelPath();
    expect(before.ok && before.value.path).toBeNull();

    const saved = await bridge.setLocalModelPath("/models/agent.gguf");
    expect(saved.ok && saved.value.path).toBe("/models/agent.gguf");
    expect(changed).toEqual([["ai.localModelPath"]]);
    expect(await preferences.getLocalModelPath()).toBe("/models/agent.gguf");
  });
});
