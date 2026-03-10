import { StyleSheet, type TextStyle } from "react-native";
import { semanticThemes } from "@/theme/themes";
import { fontSizes } from "@/theme/tokens";
import type { ThemeName } from "@/theme/tokens";

function buildCellText(themeName: ThemeName) {
  const t = semanticThemes[themeName];
  return StyleSheet.create({
    primary: { color: t.text.primary, fontSize: fontSizes.sm, fontWeight: "500" } as TextStyle,
    secondary: { color: t.text.secondary, fontSize: fontSizes.sm, fontWeight: "500" } as TextStyle,
    brand: { color: t.text.brand, fontSize: fontSizes.sm, fontWeight: "500" } as TextStyle,
    link: { color: t.border.brand, fontSize: fontSizes.sm, fontWeight: "500", textDecorationLine: "underline", textDecorationColor: t.border.brand } as TextStyle,
    success: { color: t.state.success, fontSize: fontSizes.sm, fontWeight: "600" } as TextStyle,
    warning: { color: t.state.warning, fontSize: fontSizes.sm, fontWeight: "600" } as TextStyle,
    error: { color: t.state.error, fontSize: fontSizes.sm, fontWeight: "600" } as TextStyle,
  });
}

const cellTextByTheme = {
  dark: buildCellText("dark"),
  light: buildCellText("light"),
};

const successRateGreenShadesByTheme: Record<ThemeName, readonly [string, string, string]> = {
  dark: ["#00ca51", "#00b347", "#008f37"],
  light: ["#00a743", "#008f37", "#0f6d2e"],
};

export function cellText(mode: ThemeName) {
  return cellTextByTheme[mode];
}

export function getSuccessRateColor(rate: number, mode: ThemeName = "dark"): string {
  const t = semanticThemes[mode];
  if (rate >= 0.8) return t.state.success;
  if (rate >= 0.6) return t.state.warning;
  return t.state.error;
}

export function getSuccessRateGreenShadeColor(rate: number, mode: ThemeName = "dark"): string {
  const [high, medium, low] = successRateGreenShadesByTheme[mode];
  if (rate >= 0.8) return high;
  if (rate >= 0.6) return medium;
  return low;
}

function buildChartColors(themeName: ThemeName) {
  const t = semanticThemes[themeName];
  return {
    success: t.state.success,
    warning: t.state.warning,
    error: t.state.error,
  } as const;
}

const chartColorsByTheme = {
  dark: buildChartColors("dark"),
  light: buildChartColors("light"),
};

export function chartColors(mode: ThemeName) {
  return chartColorsByTheme[mode];
}
