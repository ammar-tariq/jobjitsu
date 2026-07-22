import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createFsStorageProvider } from "@jobjitsu/storage/node";
import {
  FAKE_RESUME_ID,
  PACKAGE_NAME,
  createDefaultFakeResume,
  createFakeResumeStore,
  createKvProfileRepository,
  createLocalResumeStore,
  createMemoryProfileRepository,
  createMemoryResumeLibrary,
} from "./index.js";
import { createStorageResumeLibrary } from "./storage-resume-library.js";

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

  it("imports a resume fixture into the memory library with a label", async () => {
    const library = createMemoryResumeLibrary();
    const bytes = new TextEncoder().encode("# Sam Chen\nStaff engineer\n");
    const version = await library.import({
      label: "Baseline 2026",
      fileName: "sam-chen.md",
      bytes,
      contentType: "text/markdown",
    });
    expect(version.label).toBe("Baseline 2026");
    expect(version.format).toBe("document");
    expect(version.fileName).toBe("sam-chen.md");
    expect(version.blobId).toBeTruthy();
    expect(await library.list()).toEqual([version]);
  });

  it("rejects empty imports with a calm recoverable message", async () => {
    const library = createMemoryResumeLibrary();
    await expect(
      library.import({
        label: "Empty",
        fileName: "empty.txt",
        bytes: new Uint8Array(),
      }),
    ).rejects.toThrow(/empty/i);
  });

  it("imports a resume fixture onto FS storage (survives restart)", async () => {
    const dataRoot = await mkdtemp(join(tmpdir(), "jobjitsu-resume-lib-"));
    tempRoots.push(dataRoot);
    const bytes = new TextEncoder().encode("Jordan Lee — product engineer");

    const first = await createFsStorageProvider({ dataRoot });
    const library = createStorageResumeLibrary(first.kv, first.blobs);
    const version = await library.import({
      label: "Product baseline",
      fileName: "jordan.txt",
      bytes,
      contentType: "text/plain",
    });
    expect(version.label).toBe("Product baseline");
    expect(version.blobId).toBeTruthy();

    const blob = await first.blobs.get(version.blobId as import("@jobjitsu/core").BlobId);
    expect(blob.ok && blob.value && new TextDecoder().decode(blob.value)).toContain("Jordan Lee");

    const restarted = await createFsStorageProvider({ dataRoot });
    const again = createStorageResumeLibrary(restarted.kv, restarted.blobs);
    const listed = await again.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(version.id);
    expect(listed[0]?.label).toBe("Product baseline");
    expect((await again.getSelected())?.id).toBe(version.id);
  });

  it("lists a parent/child version graph and selects without side effects", async () => {
    const library = createMemoryResumeLibrary();
    const parent = await library.import({
      label: "Baseline",
      fileName: "base.md",
      bytes: new TextEncoder().encode("# Baseline"),
    });
    const child = await library.import({
      label: "Tailored draft",
      fileName: "tailored.md",
      bytes: new TextEncoder().encode("# Tailored"),
      parentVersionId: parent.id,
    });

    expect(child.parentVersionId).toBe(parent.id);
    expect(await library.list()).toHaveLength(2);
    expect((await library.getSelected())?.id).toBe(parent.id);

    const selected = await library.select(child.id);
    expect(selected.id).toBe(child.id);
    expect((await library.getSelected())?.id).toBe(child.id);
    expect((await library.get(child.id))?.parentVersionId).toBe(parent.id);
  });
});
