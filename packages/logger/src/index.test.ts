import { describe, expect, it } from "vitest";
import { PACKAGE_NAME, createLogger, createMemoryLogSink } from "./index.js";

describe("@jobjitsu/logger", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/logger");
  });

  it("writes levels to the sink", () => {
    const sink = createMemoryLogSink();
    const logger = createLogger(sink);

    logger.info("booted", { component: "shell" });
    logger.error("failed", { code: "unavailable" });

    expect(sink.records).toHaveLength(2);
    expect(sink.records[0]?.level).toBe("info");
    expect(sink.records[0]?.fields).toEqual({ component: "shell" });
    expect(sink.records[1]?.level).toBe("error");
  });

  it("child merges fields immutably", () => {
    const sink = createMemoryLogSink();
    const root = createLogger(sink, { app: "jobjitsu" });
    const child = root.child({ component: "bus" });

    child.warn("slow handler");

    expect(sink.records[0]?.fields).toEqual({
      app: "jobjitsu",
      component: "bus",
    });
    child.info("ok", { component: "override" });
    expect(sink.records[1]?.fields).toEqual({
      app: "jobjitsu",
      component: "override",
    });
  });
});
