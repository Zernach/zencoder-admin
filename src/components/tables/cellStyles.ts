import { StyleSheet, type TextStyle } from "react-native";
import { semanticThemes } from "@/theme/themes";
import { fontSizes } from "@/theme/tokens";

const dark = semanticThemes.dark;

export const cellText = StyleSheet.create({
  primary: {
    color: dark.text.primary,
    fontSize: fontSizes.sm,
  } as TextStyle,
  secondary: {
    color: dark.text.secondary,
    fontSize: fontSizes.sm,
  } as TextStyle,
  brand: {
    color: dark.text.brand,
    fontSize: fontSizes.sm,
  } as TextStyle,
  success: {
    color: dark.state.success,
    fontSize: fontSizes.sm,
  } as TextStyle,
  warning: {
    color: dark.state.warning,
    fontSize: fontSizes.sm,
  } as TextStyle,
  error: {
    color: dark.state.error,
    fontSize: fontSizes.sm,
  } as TextStyle,
});

export function getSuccessRateColor(rate: number): string {
  if (rate >= 0.8) return dark.state.success;
  if (rate >= 0.6) return dark.state.warning;
  return dark.state.error;
}

export const chartColors = {
  success: dark.state.success,
  warning: dark.state.warning,
  error: dark.state.error,
} as const;
