import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.js";
import type { AiProvider, ContextAssembler } from "./index.js";

describe("@jobjitsu/ai", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/ai");
  });

  it("requires health and complete on providers", () => {
    const keys: Array<keyof AiProvider> = ["id", "locality", "health", "complete"];
    expect(keys).toContain("health");
    expect(keys).toContain("complete");
  });

  it("types ContextAssembler", () => {
    const key: keyof ContextAssembler = "assemble";
    expect(key).toBe("assemble");
  });
});
