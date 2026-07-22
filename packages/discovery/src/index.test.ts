import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.js";

describe("@jobjitsu/discovery", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/discovery");
  });
});
