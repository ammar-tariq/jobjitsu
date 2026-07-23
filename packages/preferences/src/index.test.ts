import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createFsStorageProvider } from "@jobjitsu/storage/node";
import {
  DEFAULT_APP_SETTINGS,
  PACKAGE_NAME,
  createMemorySettingsStore,
  createPreferencesFacade,
  requiresApprovalBeforeSend,
} from "./index.js";
import { createKvSettingsStore } from "./kv-settings-store.js";

const tempRoots: string[] = [];

afterEach(async () => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop();
    if (root) {
      await rm(root, { recursive: true, force: true });
    }
  }
});

describe("@jobjitsu/preferences", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/preferences");
  });

  it("defaults approval-before-send on and sound off", () => {
    expect(DEFAULT_APP_SETTINGS.requireApprovalBeforeSend).toBe(true);
    expect(DEFAULT_APP_SETTINGS.notifications.soundEnabled).toBe(false);
    expect(DEFAULT_APP_SETTINGS.theme).toBe("dark");
    expect(requiresApprovalBeforeSend(DEFAULT_APP_SETTINGS)).toBe(true);
  });

  it("exposes a façade over the config settings store", async () => {
    const store = createMemorySettingsStore();
    const prefs = createPreferencesFacade(store);
    expect(await prefs.getApprovalBeforeSend()).toBe(true);
    expect(await prefs.setApprovalBeforeSend(false)).toBe(false);
    expect(await prefs.getApprovalBeforeSend()).toBe(false);
    expect((await store.get()).requireApprovalBeforeSend).toBe(false);

    const craft = await prefs.setCraftPreferences({
      fitKeywords: [" remote ", "platform", "remote"],
      tone: "  calm and precise  ",
      constraints: ["no relocate", ""],
    });
    expect(craft).toEqual({
      fitKeywords: ["remote", "platform"],
      tone: "calm and precise",
      constraints: ["no relocate"],
    });
    expect(await prefs.getCraftPreferences()).toEqual(craft);
    expect(await prefs.getLocalModelPath()).toBeUndefined();
  });

  it("stores local model path for on-device Agent readiness", async () => {
    const store = createMemorySettingsStore();
    const prefs = createPreferencesFacade(store);
    expect(await prefs.getLocalModelPath()).toBeUndefined();
    expect(await prefs.setLocalModelPath("  /models/agent.gguf  ")).toBe("/models/agent.gguf");
    expect(await prefs.getLocalModelPath()).toBe("/models/agent.gguf");
    expect((await store.get()).ai.localModelPath).toBe("/models/agent.gguf");
    expect(await prefs.setLocalModelPath("   ")).toBeUndefined();
    expect(await prefs.getLocalModelPath()).toBeUndefined();
  });

  it("seeds approval-before-send true on a fresh KV store", async () => {
    const dataRoot = await mkdtemp(join(tmpdir(), "jobjitsu-prefs-"));
    tempRoots.push(dataRoot);
    const storage = await createFsStorageProvider({ dataRoot });
    const store = createKvSettingsStore(storage.kv);

    const first = await store.get();
    expect(first.requireApprovalBeforeSend).toBe(true);

    const restarted = await createFsStorageProvider({ dataRoot });
    const again = createKvSettingsStore(restarted.kv);
    expect((await again.get()).requireApprovalBeforeSend).toBe(true);

    await again.set({ requireApprovalBeforeSend: false });
    const third = await createFsStorageProvider({ dataRoot });
    expect((await createKvSettingsStore(third.kv).get()).requireApprovalBeforeSend).toBe(false);
  });
});
