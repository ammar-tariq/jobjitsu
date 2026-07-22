import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  PACKAGE_NAME,
  assertSafeStorageSegment,
  createDocumentStore,
  createFsStorageProvider,
  resolveStorageLayout,
  resolveUserDataRoot,
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

async function tempDataRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "jobjitsu-storage-"));
  tempRoots.push(root);
  return root;
}

describe("@jobjitsu/storage", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/storage");
  });

  it("resolves platform user-data roots under JobJitsu", () => {
    expect(
      resolveUserDataRoot({
        platform: "darwin",
        homeDir: "/Users/demo",
      }),
    ).toBe("/Users/demo/Library/Application Support/JobJitsu");

    expect(
      resolveUserDataRoot({
        platform: "linux",
        homeDir: "/home/demo",
        env: {},
      }),
    ).toBe("/home/demo/.local/share/JobJitsu");

    expect(
      resolveUserDataRoot({
        platform: "win32",
        homeDir: "C:\\Users\\demo",
        env: { LOCALAPPDATA: "C:\\Users\\demo\\AppData\\Local" },
      }),
    ).toMatch(/JobJitsu$/);

    const layout = resolveStorageLayout("/tmp/jj-data");
    expect(layout.kvRoot).toContain("kv");
    expect(layout.blobsRoot).toContain("blobs");
  });

  it("rejects unsafe storage key segments", () => {
    expect(assertSafeStorageSegment("../etc", "namespace").ok).toBe(false);
    expect(assertSafeStorageSegment("a/b", "id").ok).toBe(false);
    expect(assertSafeStorageSegment("prefs", "namespace").ok).toBe(true);
  });

  it("roundtrips KV documents in a temp directory", async () => {
    const dataRoot = await tempDataRoot();
    const store = await createFsStorageProvider({ dataRoot });

    const key = { namespace: "preferences", id: "appearance" };
    const write = await store.kv.set(key, { theme: "dark" });
    expect(write.ok).toBe(true);

    const read = await store.kv.get<{ theme: string }>(key);
    expect(read.ok && read.value).toEqual({ theme: "dark" });

    const listed = await store.kv.list("preferences");
    expect(listed.ok && listed.value).toEqual(["appearance"]);

    // Simulate restart: new provider, same dataRoot
    const again = await createFsStorageProvider({ dataRoot });
    const afterRestart = await again.kv.get<{ theme: string }>(key);
    expect(afterRestart.ok && afterRestart.value).toEqual({ theme: "dark" });
  });

  it("puts and gets blobs under the user-data path across restart", async () => {
    const dataRoot = await tempDataRoot();
    const store = await createFsStorageProvider({ dataRoot });
    const bytes = new TextEncoder().encode("resume.pdf-bytes");

    const put = await store.blobs.put(bytes, {
      contentType: "application/pdf",
      fileName: "resume.pdf",
    });
    expect(put.ok).toBe(true);
    if (!put.ok) {
      return;
    }

    expect(put.value.byteLength).toBe(bytes.byteLength);
    expect(store.dataRoot).toBe(dataRoot);

    const restarted = await createFsStorageProvider({ dataRoot });
    const got = await restarted.blobs.get(put.value.id);
    expect(got.ok && got.value && Array.from(got.value)).toEqual(Array.from(bytes));

    const meta = await restarted.blobs.getMeta(put.value.id);
    expect(meta.ok && meta.value?.fileName).toBe("resume.pdf");
  });

  it("supports document store collections over KV", async () => {
    const dataRoot = await tempDataRoot();
    const store = await createFsStorageProvider({ dataRoot });
    const docs = createDocumentStore<{ id: string; title: string }>(store.kv, "applications");

    const put = await docs.put({ id: "app_1", title: "Staff Engineer" });
    expect(put.ok).toBe(true);
    const list = await docs.list();
    expect(list.ok && list.value).toEqual([{ id: "app_1", title: "Staff Engineer" }]);
  });
});
