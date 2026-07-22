import { describe, expect, it } from "vitest";
import { jjDark, jjLight, jjPrimitive } from "./jjColors.js";
import { createJjTheme, jjTheme } from "./jjTheme.js";
import { contrastRatio } from "./contrast.js";

describe("jjTheme palette", () => {
  it("defaults to Midnight Ink dark canvas", () => {
    expect(jjTheme.palette.mode).toBe("dark");
    expect(jjTheme.palette.background.default).toBe(jjPrimitive.indigo950);
    expect(jjTheme.palette.background.paper).toBe(jjPrimitive.indigo900);
    expect(jjTheme.palette.background.default).toBe(jjDark.bgCanvas);
    expect(jjTheme.palette.primary.main).toBe(jjDark.accent);
  });

  it("builds Soft Cloud light theme when requested", () => {
    const light = createJjTheme("light");
    expect(light.palette.mode).toBe("light");
    expect(light.palette.background.default).toBe(jjLight.bgCanvas);
    expect(light.palette.text.primary).toBe(jjLight.textPrimary);
    expect(light.palette.primary.main).toBe(jjLight.accent);
  });
});

describe("AA contrast smoke (primary text)", () => {
  it("meets WCAG AA (≥ 4.5:1) for dark primary text on canvas", () => {
    const ratio = contrastRatio(jjDark.textPrimary, jjDark.bgCanvas);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("meets WCAG AA (≥ 4.5:1) for light primary text on canvas", () => {
    const ratio = contrastRatio(jjLight.textPrimary, jjLight.bgCanvas);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
