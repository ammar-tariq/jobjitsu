import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createHostRuntime } from "../host/runtime.js";
import { IPC_ALLOWLIST, isIpcCommandName } from "./index.js";

const appSrc = join(dirname(fileURLToPath(import.meta.url)), "..");

function listSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "ipc") {
        return [];
      }
      return listSources(path);
    }
    if (entry.name.includes(".test.")) {
      return [];
    }
    return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [path] : [];
  });
}

describe("IPC sovereignty contract", () => {
  it("denies unknown commands including AI complete", async () => {
    const runtime = createHostRuntime();
    const denied = await runtime.ipc.invoke("ai.complete", { prompt: "nope" });

    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.error.code).toBe("permission");
    }

    expect(isIpcCommandName("ai.complete")).toBe(false);
    expect(IPC_ALLOWLIST.includes("ai.complete" as never)).toBe(false);
  });

  it("allows typed bridge ping on the host runtime", async () => {
    const runtime = createHostRuntime();
    const ping = await runtime.bridge.ping();
    expect(ping.ok).toBe(true);
  });

  it("keeps shell UI free of AI complete / embed call sites", () => {
    const files = listSources(join(appSrc, "shell"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/\.complete\s*\(/);
      expect(source, file).not.toMatch(/\.embed\s*\(/);
      expect(source, file).not.toMatch(/from\s+["']@jobjitsu\/ai["']/);
    }
  });
});
