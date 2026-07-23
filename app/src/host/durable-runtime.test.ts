import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createNodeFsIo } from "@jobjitsu/storage/node";
import { createDurableHostRuntime } from "./durable-runtime.js";

const tempRoots: string[] = [];

afterEach(async () => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop();
    if (root) {
      await rm(root, { recursive: true, force: true });
    }
  }
});

async function tempRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  tempRoots.push(root);
  return root;
}

describe("durable host data folder", () => {
  it("rejects non-absolute default data paths", async () => {
    const io = createNodeFsIo();
    await expect(
      createDurableHostRuntime({
        version: "0.0.0-test",
        io,
        defaultDataRoot: "~/Library/Application Support/JobJitsu",
      }),
    ).rejects.toThrow(/absolute/i);
  });

  it("persists profile and resume under the active data folder across restart", async () => {
    const defaultDataRoot = await tempRoot("jobjitsu-default-");
    const io = createNodeFsIo();

    const first = await createDurableHostRuntime({
      version: "0.0.0-test",
      io,
      defaultDataRoot,
    });

    await first.profiles.upsert({
      displayName: "Sam",
      email: "sam@example.com",
    });
    const imported = await first.resumeLibrary.import({
      label: "Primary",
      fileName: "sam.pdf",
      bytes: new TextEncoder().encode("%PDF-1.4 durable"),
      contentType: "application/pdf",
    });

    const active = await first.dataRoot.get();
    expect(active.path).toBe(defaultDataRoot);

    const profileOnDisk = await readFile(
      join(active.path, "kv", "identity", "profiles.json"),
      "utf8",
    );
    expect(profileOnDisk).toContain("Sam");

    const second = await createDurableHostRuntime({
      version: "0.0.0-test",
      io,
      defaultDataRoot,
    });
    expect((await second.profiles.get())?.displayName).toBe("Sam");
    expect((await second.resumeLibrary.getSelected())?.id).toBe(imported.id);
    expect((await second.resumeLibrary.list()).map((row) => row.label)).toEqual(["Primary"]);
  });

  it("persists career paths under the data folder across restart", async () => {
    const defaultDataRoot = await tempRoot("jobjitsu-paths-");
    const io = createNodeFsIo();

    const first = await createDurableHostRuntime({
      version: "0.0.0-test",
      io,
      defaultDataRoot,
    });
    await first.pathLibrary.upsert({ name: "Fullstack Developer", notes: "Web" });
    await first.pathLibrary.upsert({ name: "Mobile App" });
    expect((await first.pathLibrary.getSelected())?.name).toBe("Fullstack Developer");

    const second = await createDurableHostRuntime({
      version: "0.0.0-test",
      io,
      defaultDataRoot,
    });
    expect((await second.pathLibrary.list()).map((row) => row.name)).toEqual([
      "Fullstack Developer",
      "Mobile App",
    ]);
    expect((await second.pathLibrary.getSelected())?.name).toBe("Fullstack Developer");
  });

  it("writes career data into a custom folder after setDataRoot", async () => {
    const defaultDataRoot = await tempRoot("jobjitsu-default-");
    const customRoot = await tempRoot("jobjitsu-custom-");
    const io = createNodeFsIo();

    const runtime = await createDurableHostRuntime({
      version: "0.0.0-test",
      io,
      defaultDataRoot,
    });

    const moved = await runtime.bridge.setDataRoot(customRoot);
    expect(moved.ok && moved.value.dataRoot.path).toBe(customRoot);

    await runtime.profiles.upsert({ displayName: "Vault User" });
    await runtime.resumeLibrary.import({
      label: "Vault Resume",
      fileName: "vault.pdf",
      bytes: new TextEncoder().encode("%PDF vault"),
      contentType: "application/pdf",
    });

    const profileOnDisk = await readFile(
      join(customRoot, "kv", "identity", "profiles.json"),
      "utf8",
    );
    expect(profileOnDisk).toContain("Vault User");

    const pointer = await readFile(join(defaultDataRoot, "config", "data-root.json"), "utf8");
    expect(pointer).toContain(customRoot);

    const restarted = await createDurableHostRuntime({
      version: "0.0.0-test",
      io,
      defaultDataRoot,
    });
    expect((await restarted.dataRoot.get()).path).toBe(customRoot);
    expect((await restarted.profiles.get())?.displayName).toBe("Vault User");
  });
});
