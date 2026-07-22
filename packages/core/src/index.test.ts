import { describe, expect, it } from "vitest";
import { createMemoryLogSink, createLogger } from "@jobjitsu/logger";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { createMemorySettingsStore } from "@jobjitsu/config";
import {
  FoundationKeys,
  PACKAGE_NAME,
  PIPELINE_STAGES,
  createErrorReporter,
  createServiceRegistry,
  ok,
} from "./index.js";

describe("@jobjitsu/core", () => {
  it("exports package identity and pipeline stages", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/core");
    expect(PIPELINE_STAGES).toContain("send");
  });

  it("re-exports Result helpers from shared", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
  });

  it("maps unknown errors without cloud upload", () => {
    const sink = createMemoryLogSink();
    const reporter = createErrorReporter({ logger: createLogger(sink) });
    const mapped = reporter.report(new Error("boom"), { source: "shell" });

    expect(mapped.code).toBe("unknown");
    expect(mapped.title).toBe("Something went wrong");
    expect(reporter.recent()).toHaveLength(1);
    expect(sink.records[0]?.level).toBe("error");
  });

  it("registers foundation services without AI keys", () => {
    const registry = createServiceRegistry();
    const logger = createLogger(createMemoryLogSink());
    const bus = createInMemoryEventBus();
    const settings = createMemorySettingsStore();
    const errors = createErrorReporter({ logger });

    registry.register(FoundationKeys.logger, logger);
    registry.register(FoundationKeys.eventBus, bus);
    registry.register(FoundationKeys.settingsStore, settings);
    registry.register(FoundationKeys.errorReporter, errors);

    expect(registry.resolve(FoundationKeys.logger)).toBe(logger);
    expect(Object.keys(FoundationKeys)).not.toContain("ai");
    expect(Object.keys(FoundationKeys)).not.toContain("aiProvider");
  });
});
