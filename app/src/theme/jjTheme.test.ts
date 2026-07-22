import { describe, expect, it } from "vitest";
import { jjDark, jjPrimitive } from "./jjColors.js";
import { jjTheme } from "./jjTheme.js";

describe("jjTheme palette", () => {
  it("uses design-token Midnight Ink canvas and Deep Indigo surfaces", () => {
    expect(jjTheme.palette.background.default).toBe(jjPrimitive.indigo950);
    expect(jjTheme.palette.background.paper).toBe(jjPrimitive.indigo900);
    expect(jjTheme.palette.background.default).toBe(jjDark.bgCanvas);
    expect(jjTheme.palette.background.paper).toBe(jjDark.bgSurface);
  });

  it("uses Electric Teal as the accent (primary)", () => {
    expect(jjTheme.palette.primary.main).toBe(jjPrimitive.teal400);
    expect(jjTheme.palette.primary.main).toBe(jjDark.accent);
  });
});
