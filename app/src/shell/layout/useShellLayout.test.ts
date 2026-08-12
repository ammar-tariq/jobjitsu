import { describe, expect, it } from "vitest";
import { layoutFromWidth } from "./useShellLayout.js";

describe("layoutFromWidth", () => {
  it("uses an icon rail below 1024px", () => {
    expect(layoutFromWidth(800)).toBe("compact");
    expect(layoutFromWidth(1023)).toBe("compact");
  });

  it("uses sidebar plus main from 1024px", () => {
    expect(layoutFromWidth(1024)).toBe("standard");
    expect(layoutFromWidth(1439)).toBe("standard");
  });

  it("uses wide layout from 1440px for inspector space", () => {
    expect(layoutFromWidth(1440)).toBe("wide");
  });
});
