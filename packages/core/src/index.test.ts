import { describe, expect, it } from "vitest";
import { PACKAGE_NAME, PIPELINE_STAGES } from "./index.js";
import type { Logger, Result } from "./index.js";

describe("@jobjitsu/core", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/core");
  });

  it("exposes pipeline stages", () => {
    expect(PIPELINE_STAGES).toContain("send");
    expect(PIPELINE_STAGES).toContain("queue");
  });

  it("types Result and Logger as interfaces only", () => {
    const ok: Result<number> = { ok: true, value: 1 };
    expect(ok.ok).toBe(true);

    const _loggerShape: keyof Logger = "info";
    expect(_loggerShape).toBe("info");
  });
});
