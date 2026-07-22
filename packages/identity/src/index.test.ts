import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createFsStorageProvider } from "@jobjitsu/storage";
import {
  FAKE_RESUME_ID,
  PACKAGE_NAME,
  createDefaultFakeResume,
  createFakeResumeStore,
  createKvProfileRepository,
  createLocalResumeStore,
  createMemoryProfileRepository,
} from "./index.js";

const tempRoots: string[] = [];

afterEach(async () => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop();
    if (root) {
      await rm(root, { recursive: true, force: true });
    }
  }
});

async function tempKv() {
  const root = await mkdtemp(join(tmpdir(), "jobjitsu-identity-"));
  tempRoots.push(root);
  const storage = await createFsStorageProvider({ dataRoot: root });
  return storage.kv;
}

describe("@jobjitsu/identity", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/identity");
  });

  it("seeds an in-memory résumé without network", async () => {
    const store = createFakeResumeStore();
    const resume = await store.getResume();
    expect(resume?.id).toBe(FAKE_RESUME_ID);
    expect(resume?.fullName).toBe("Alex Rivera");

    const profile = await store.getProfile();
    expect(profile?.displayName).toBe("Alex Rivera");
    expect(profile?.id).toBeTruthy();
    expect(profile?.location).toMatch(/device/i);
  });

  it("persists profile CRUD on-device via KV (survives restart)", async () => {
    const dataRoot = await mkdtemp(join(tmpdir(), "jobjitsu-identity-"));
    tempRoots.push(dataRoot);

    const first = await createFsStorageProvider({ dataRoot });
    const repo = createKvProfileRepository(first.kv);
    expect(await repo.get()).toBeUndefined();

    const created = await repo.upsert({
      displayName: "Sam Chen",
      email: "sam@example.com",
      location: "On this device",
    });
    expect(created.displayName).toBe("Sam Chen");
    expect(created.id.startsWith("profile_")).toBe(true);

    const restarted = await createFsStorageProvider({ dataRoot });
    const again = createKvProfileRepository(restarted.kv);
    const loaded = await again.get();
    expect(loaded).toEqual(created);

    const updated = await again.upsert({ displayName: "Sam C." });
    expect(updated.displayName).toBe("Sam C.");
    expect(updated.email).toBe("sam@example.com");
    expect(updated.id).toBe(created.id);
  });

  it("keeps a browser-safe memory profile on-device", async () => {
    const profiles = createMemoryProfileRepository();
    const saved = await profiles.upsert({
      displayName: "Sam Chen",
      location: "On this device",
    });
    expect(saved.displayName).toBe("Sam Chen");
    expect(await profiles.get()).toEqual(saved);
  });

  it("exposes local resume store profile APIs without cloud wording", async () => {
    const kv = await tempKv();
    const store = createLocalResumeStore(kv);
    await store.saveProfile({
      id: "profile_x",
      displayName: "Jordan Lee",
      email: "jordan@example.com",
      location: "Stored on this device",
      updatedAt: new Date().toISOString(),
    });
    const profile = await store.getProfile();
    expect(profile?.displayName).toBe("Jordan Lee");
    expect(profile?.location).toMatch(/device/i);
  });

  it("persists fake resume updates in memory", async () => {
    const store = createFakeResumeStore({
      resume: createDefaultFakeResume({ fullName: "Sam Chen" }),
    });
    const saved = await store.saveResume(
      createDefaultFakeResume({
        fullName: "Sam Chen",
        summary: "Updated summary",
      }),
    );
    expect(saved.summary).toBe("Updated summary");
  });
});
