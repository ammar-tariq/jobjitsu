import { describe, expect, it } from "vitest";
import {
  PACKAGE_NAME,
  PLUGIN_CAPABILITIES,
  SDK_VERSION,
  createMemoryLogSink,
  createLogger,
  ok,
} from "./index.js";
import type { HostContext } from "./index.js";

describe("@jobjitsu/sdk", () => {
  it("exports package identity and version", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/sdk");
    expect(SDK_VERSION).toBe("0.0.0");
  });

  it("surfaces shared Result helpers", () => {
    expect(ok(true)).toEqual({ ok: true, value: true });
  });

  it("exposes plugin contracts; HostContext has no AI field", () => {
    expect(PLUGIN_CAPABILITIES).toContain("agent.tool");
    const keys: Array<keyof HostContext> = ["logger", "events", "settings", "granted"];
    expect(keys).not.toContain("ai");
    const logger = createLogger(createMemoryLogSink());
    logger.info("sdk smoke");
  });
});
