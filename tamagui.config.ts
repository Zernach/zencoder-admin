import { createFont, createTamagui, createTokens } from "@tamagui/core";
import { semanticThemes } from "@/theme/themes";

const interFont = createFont({
  family: "Inter",
  size: { xs: 11, sm: 12, md: 14, lg: 16, xl: 18, "2xl": 22, "3xl": 28 },
  lineHeight: {
    xs: 16,
    sm: 17,
    md: 20,
    lg: 23,
    xl: 26,
    "2xl": 26,
    "3xl": 34,
  },
  weight: { regular: "400", medium: "500", semibold: "600", bold: "700" },
  letterSpacing: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0, "2xl": -0.2, "3xl": -0.3 },
});

const menloFont = createFont({
  family: "Menlo",
  size: { xs: 11, sm: 12, md: 14, lg: 16, xl: 18, "2xl": 22, "3xl": 28 },
  lineHeight: {
    xs: 16,
    sm: 17,
    md: 20,
    lg: 23,
    xl: 26,
    "2xl": 26,
    "3xl": 34,
  },
  weight: { regular: "400", semibold: "600" },
  letterSpacing: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0, "2xl": 0, "3xl": 0 },
});

const tokens = createTokens({
  color: {
    // Dark theme colors
    darkCanvas: "#0a0a0a",
    darkSurface: "#1a1a1a",
    darkElevated: "#262626",
    darkAccent: "#30a8dc",
    darkTextPrimary: "#e5e5e5",
    darkTextSecondary: "#a3a3a3",
    darkTextTertiary: "#7a7a7a",
    darkSuccess: "#22c55e",
    darkWarning: "#f59e0b",
    darkError: "#ef4444",
    darkInfo: "#38bdf8",
    // Light theme colors
    lightCanvas: "#f6f7f8",
    lightSurface: "#ffffff",
    lightElevated: "#fbfdff",
    lightAccent: "#2b9fce",
    lightTextPrimary: "#0f1720",
    lightTextSecondary: "#435160",
    lightTextTertiary: "#6b7683",
    lightSuccess: "#16803d",
    lightWarning: "#a16207",
    lightError: "#b91c1c",
    lightInfo: "#0369a1",
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    9: 48,
    10: 64,
    11: 80,
    12: 96,
    13: 128,
    14: 160,
    15: 192,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    9: 48,
    10: 64,
    11: 80,
    12: 96,
    13: 128,
    14: 160,
    15: 192,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 999,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
});

function flattenSemanticColors(theme: (typeof semanticThemes)["dark"]) {
  return {
    background: theme.bg.canvas,
    backgroundSubtle: theme.bg.subtle,
    backgroundSurface: theme.bg.surface,
    backgroundElevated: theme.bg.surfaceElevated,
    backgroundHover: theme.bg.surfaceHover,
    backgroundBrandSubtle: theme.bg.brandSubtle,
    borderColor: theme.border.default,
    borderSubtle: theme.border.subtle,
    borderStrong: theme.border.strong,
    borderBrand: theme.border.brand,
    color: theme.text.primary,
    colorSecondary: theme.text.secondary,
    colorTertiary: theme.text.tertiary,
    colorBrand: theme.text.brand,
    colorOnBrand: theme.text.onBrand,
    iconPrimary: theme.icon.primary,
    iconSecondary: theme.icon.secondary,
    success: theme.state.success,
    warning: theme.state.warning,
    error: theme.state.error,
    info: theme.state.info,
    dataGridLine: theme.data.gridLine,
    dataSeriesPrimary: theme.data.seriesPrimary,
    dataSeriesSecondary: theme.data.seriesSecondary,
  };
}

const config = createTamagui({
  tokens,
  themes: {
    dark: flattenSemanticColors(semanticThemes.dark),
    light: flattenSemanticColors(semanticThemes.light),
  },
  fonts: {
    heading: interFont,
    body: interFont,
    mono: menloFont,
  },
  media: {
    mobile: { maxWidth: 767 },
    tablet: { minWidth: 768, maxWidth: 1023 },
    desktop: { minWidth: 1024 },
  },
});

export type AppConfig = typeof config;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
