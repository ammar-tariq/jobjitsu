import { describe, expect, it } from "vitest";
import { defaultJobJitsuDataPath } from "./data-root-store.js";

describe("resolveDefaultDataRoot helpers", () => {
  it("builds an absolute macOS default when home is provided", () => {
    expect(
      defaultJobJitsuDataPath({
        platform: "darwin",
        homeDir: "/Users/sam",
      }),
    ).toBe("/Users/sam/Library/Application Support/JobJitsu");
  });

  it("must not be used with a literal tilde home in durable boot", () => {
    const path = defaultJobJitsuDataPath({
      platform: "darwin",
      homeDir: "~",
    });
    expect(path.startsWith("~")).toBe(true);
  });
});
