import { describe, expect, it } from "vitest";
import {
  PACKAGE_NAME,
  PIPELINE_STAGES,
  assertNever,
  createAppError,
  createEntityId,
  err,
  isErr,
  isOk,
  isPipelineStage,
  mapResult,
  ok,
} from "./index.js";

describe("@jobjitsu/shared", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/shared");
  });

  it("builds Result helpers", () => {
    const success = ok(42);
    const failure = err(createAppError("validation", "Check the field"));

    expect(isOk(success)).toBe(true);
    expect(isErr(failure)).toBe(true);
    expect(mapResult(success, (n) => n * 2)).toEqual(ok(84));
  });

  it("creates unique entity ids", () => {
    const a = createEntityId("app");
    const b = createEntityId("app");
    expect(a).not.toBe(b);
    expect(a.startsWith("app_")).toBe(true);
  });

  it("knows pipeline stages", () => {
    expect(PIPELINE_STAGES).toContain("send");
    expect(isPipelineStage("queue")).toBe(true);
    expect(isPipelineStage("autopilot")).toBe(false);
  });

  it("assertNever throws for unreachable values", () => {
    expect(() => assertNever("x" as never)).toThrow(/Unexpected value/);
  });
});
