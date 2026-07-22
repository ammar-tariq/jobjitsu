import { describe, expect, it } from "vitest";
import {
  createMemoryDataRootStore,
  defaultJobJitsuDataPath,
  normalizeDataPath,
} from "./data-root-store.js";

describe("data root store", () => {
  it("defaults to a platform JobJitsu folder on this device", async () => {
    const store = createMemoryDataRootStore({
      platform: "darwin",
      homeDir: "/Users/sam",
    });
    const snap = await store.get();
    expect(snap.path).toBe("/Users/sam/Library/Application Support/JobJitsu");
    expect(snap.defaultPath).toBe(snap.path);
    expect(snap.isCustom).toBe(false);
  });

  it("lets the user change and reset the data folder", async () => {
    const store = createMemoryDataRootStore({
      defaultPath: "/Users/sam/Library/Application Support/JobJitsu",
    });
    const custom = await store.set("/Volumes/Vault/JobJitsu");
    expect(custom.path).toBe("/Volumes/Vault/JobJitsu");
    expect(custom.isCustom).toBe(true);

    const reset = await store.reset();
    expect(reset.path).toBe(reset.defaultPath);
    expect(reset.isCustom).toBe(false);
  });

  it("rejects an empty path with calm copy", () => {
    expect(() => normalizeDataPath("   ")).toThrow(/folder path/i);
  });

  it("shapes linux and windows defaults without network paths", () => {
    expect(defaultJobJitsuDataPath({ platform: "linux", homeDir: "/home/sam" })).toBe(
      "/home/sam/.local/share/JobJitsu",
    );
    expect(defaultJobJitsuDataPath({ platform: "win32", homeDir: "C:\\Users\\sam" })).toBe(
      "C:\\Users\\sam/AppData/Local/JobJitsu",
    );
  });
});
