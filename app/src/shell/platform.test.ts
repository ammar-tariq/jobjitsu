import { describe, expect, it } from "vitest";
import { detectShellPlatform } from "./platform.js";

describe("detectShellPlatform", () => {
  it("treats browser tests as web even on a Mac user agent", () => {
    expect(detectShellPlatform()).toBe("web");
  });
});
