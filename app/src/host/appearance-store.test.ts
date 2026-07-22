import { describe, expect, it } from "vitest";
import {
  createLocalStorageAppearanceStore,
  createMemoryAppearanceStore,
} from "./appearance-store.js";
import { createHostRuntime } from "./runtime.js";

describe("appearance store", () => {
  it("defaults to dark", async () => {
    const store = createMemoryAppearanceStore();
    expect(await store.getTheme()).toBe("dark");
  });

  it("persists theme across host restarts when the store is shared", async () => {
    const appearance = createMemoryAppearanceStore("dark");
    const first = createHostRuntime({ appearance });
    const set = await first.bridge.setTheme("light");
    expect(set.ok && set.value.theme).toBe("light");

    const second = createHostRuntime({ appearance });
    const get = await second.bridge.getTheme();
    expect(get.ok && get.value.theme).toBe("light");
  });

  it("persists theme in a localStorage stub", async () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    const store = createLocalStorageAppearanceStore(storage);
    expect(await store.getTheme()).toBe("dark");
    await store.setTheme("light");
    expect(await createLocalStorageAppearanceStore(storage).getTheme()).toBe("light");
  });
});
