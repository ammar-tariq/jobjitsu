import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { APP_NAME } from "./index.js";
import { createHostRuntime } from "./host/runtime.js";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("PE01-S01 launch desktop host", () => {
  it("names the product JobJitsu for the shell and native window", () => {
    expect(APP_NAME).toBe("JobJitsu");

    const conf = JSON.parse(readFileSync(join(appRoot, "src-tauri/tauri.conf.json"), "utf8")) as {
      productName: string;
      identifier: string;
      app: { windows: Array<{ title: string; label: string }> };
    };

    expect(conf.productName).toBe("JobJitsu");
    expect(conf.identifier).toBe("dev.jobjitsu.app");
    expect(conf.app.windows[0]?.title).toBe("JobJitsu");
    expect(conf.app.windows[0]?.label).toBe("main");
  });

  it("uses Tauri without introducing Electron", () => {
    const pkg = JSON.parse(readFileSync(join(appRoot, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(deps.electron).toBeUndefined();
    expect(deps["@tauri-apps/cli"]).toBeDefined();

    const cargo = readFileSync(join(appRoot, "src-tauri/Cargo.toml"), "utf8");
    expect(cargo).toMatch(/tauri\s*=/);
    expect(cargo.toLowerCase()).not.toContain("electron");
  });

  it("keeps host capabilities deny-by-default (dialog + scoped data-folder FS only)", () => {
    const caps = JSON.parse(
      readFileSync(join(appRoot, "src-tauri/capabilities/default.json"), "utf8"),
    ) as { permissions: Array<string | { identifier: string }> };

    const names = caps.permissions.map((entry) =>
      typeof entry === "string" ? entry : entry.identifier,
    );
    expect(names).toContain("core:default");
    expect(names).toContain("dialog:allow-open");
    expect(names).toContain("allow-data-directory");
    expect(names).toContain("fs:scope");
    expect(names.some((name) => name.startsWith("shell:"))).toBe(false);
    expect(names.some((name) => name.startsWith("http:"))).toBe(false);
  });

  it("startup cascade uses local fake mail only — no career network egress", async () => {
    const originalFetch = globalThis.fetch;
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      throw new Error("unexpected network during launch");
    }) as typeof fetch;

    try {
      const runtime = createHostRuntime({ version: "0.0.0-smoke" });
      await runtime.start();

      const names = runtime.getActivity().map((e) => e.name);
      expect(names).toContain("App.Started");
      expect(names).toContain("Email.Synced");
      expect(fetchCalls).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
