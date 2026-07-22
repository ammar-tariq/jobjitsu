import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.js";

describe("@jobjitsu/send", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/send");
  });
});
