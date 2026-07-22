import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const shellDir = join(dirname(fileURLToPath(import.meta.url)));

function listShellSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listShellSources(path);
    }
    if (entry.name.includes(".test.")) {
      return [];
    }
    return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [path] : [];
  });
}

describe("UI → AI fence", () => {
  it("forbids shell UI from importing @jobjitsu/ai", () => {
    const files = listShellSources(shellDir);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/from\s+["']@jobjitsu\/ai["']/);
    }
  });
});
