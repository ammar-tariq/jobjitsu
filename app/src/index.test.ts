import { describe, expect, it } from "vitest";
import { APP_NAME } from "./index.js";

describe("@jobjitsu/app", () => {
  it("exports app name", () => {
    expect(APP_NAME).toBe("JobJitsu");
  });
});
