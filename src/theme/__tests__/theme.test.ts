import { motion, ease, breakpoints } from "@/theme";
import { semanticThemes } from "@/theme/themes";

describe("theme tokens", () => {
  it("motion timings are correct", () => {
    expect(motion.fast).toBe(120);
    expect(motion.base).toBe(180);
    expect(motion.slow).toBe(260);
  });

  it("breakpoints are correct", () => {
    expect(breakpoints.mobile).toBe(0);
    expect(breakpoints.tablet).toBe(768);
    expect(breakpoints.desktop).toBe(1024);
  });

  it("dark theme canvas is #0a0a0a and accent is #30a8dc", () => {
    expect(semanticThemes.dark.bg.canvas).toBe("#0a0a0a");
    expect(semanticThemes.dark.border.brand).toBe("#30a8dc");
  });

  it("ease values are defined", () => {
    expect(ease.standard).toBe("cubic-bezier(0.22, 1, 0.36, 1)");
    expect(ease.emphasized).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
    expect(ease.linear).toBe("linear");
  });

  it("all token maps import without runtime error", () => {
    expect(semanticThemes.dark).toBeDefined();
    expect(semanticThemes.light).toBeDefined();
    expect(motion).toBeDefined();
    expect(breakpoints).toBeDefined();
  });
});
