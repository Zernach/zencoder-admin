import { StyleSheet, type TextStyle } from "react-native";
import { semanticThemes } from "@/theme/themes";
import { fontSizes } from "@/theme/tokens";
import type { ThemeName } from "@/theme/tokens";

function buildCellText(themeName: ThemeName) {
  const t = semanticThemes[themeName];
  return StyleSheet.create({
    primary: { color: t.text.primary, fontSize: fontSizes.sm } as TextStyle,
    secondary: { color: t.text.secondary, fontSize: fontSizes.sm } as TextStyle,
    brand: { color: t.text.brand, fontSize: fontSizes.sm } as TextStyle,
    success: { color: t.state.success, fontSize: fontSizes.sm } as TextStyle,
    warning: { color: t.state.warning, fontSize: fontSizes.sm } as TextStyle,
    error: { color: t.state.error, fontSize: fontSizes.sm } as TextStyle,
  });
}

const cellTextByTheme = {
  dark: buildCellText("dark"),
  light: buildCellText("light"),
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
