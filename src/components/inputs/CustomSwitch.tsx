import React from "react";
import { Switch } from "react-native";
import type { ColorValue, SwitchProps } from "react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme";

export interface CustomSwitchProps extends Omit<SwitchProps, "trackColor" | "thumbColor"> {
  trackColor?: {
    false: ColorValue;
    true: ColorValue;
  };
  thumbColor?: ColorValue;
}

export function CustomSwitch({
  value,
  onValueChange,
  trackColor,
  thumbColor,
  accessibilityRole,
  accessibilityState,
  ...props
}: CustomSwitchProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const resolvedTrackColor = trackColor ?? {
    false: theme.border.default,
    true: theme.border.brand,
  };

  return (
    <Switch
      {...props}
      value={value}
      onValueChange={onValueChange}
      trackColor={resolvedTrackColor}
      thumbColor={thumbColor ?? "#ffffff"}
      accessibilityRole={accessibilityRole ?? "switch"}
      accessibilityState={{
        ...accessibilityState,
        checked: accessibilityState?.checked ?? Boolean(value),
      }}
    />
  );
}
