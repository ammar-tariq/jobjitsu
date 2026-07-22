import { describe, expect, it } from "vitest";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { createMemoryProfileRepository, createMemoryResumeLibrary } from "@jobjitsu/identity";
import { createMemorySettingsStore, createPreferencesFacade } from "@jobjitsu/preferences";
import { createMemoryDataRootStore } from "../host/data-root-store.js";
import { createStubFolderPicker } from "../host/folder-picker.js";
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
      "identity.getProfile",
      "identity.setProfile",
      "identity.listResumeVersions",
      "identity.importResume",
      "identity.getSelectedResume",
      "identity.selectResume",
      "storage.getDataRoot",
      "storage.setDataRoot",
      "storage.resetDataRoot",
      "storage.pickDataRoot",
      "preferences.getApprovalBeforeSend",
      "preferences.setApprovalBeforeSend",
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
    expect(Object.keys(bridge).sort()).toEqual([
      "getAiStatus",
      "getApprovalBeforeSend",
      "getDataRoot",
      "getProfile",
      "getSelectedResume",
      "getTheme",
      "importResume",
      "listResumeVersions",
      "pickDataRoot",
      "ping",
      "resetDataRoot",
      "selectResume",
      "setApprovalBeforeSend",
      "setDataRoot",
      "setProfile",
      "setTheme",
    ]);
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
});
