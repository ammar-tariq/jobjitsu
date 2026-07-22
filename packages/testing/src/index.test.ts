import { describe, expect, it } from "vitest";
import { FoundationKeys } from "@jobjitsu/core";
import { createAppError, err, ok } from "@jobjitsu/shared";
import { PACKAGE_NAME, createTestFoundation, expectErr, expectOk } from "./index.js";

describe("@jobjitsu/testing", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/testing");
  });

  it("asserts Result ok/err", () => {
    expect(expectOk(ok(7))).toBe(7);
    expect(expectErr(err(createAppError("not_found", "Missing")), "not_found").title).toBe(
      "Missing",
    );
  });

  it("boots foundation without AI services", () => {
    const { registry } = createTestFoundation();
    expect(registry.has(FoundationKeys.logger)).toBe(true);
    expect(registry.has(FoundationKeys.eventBus)).toBe(true);
    expect(Object.getOwnPropertyNames(FoundationKeys)).not.toContain("ai");
  });
});
