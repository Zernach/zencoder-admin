import React from "react";
import { Platform, Switch } from "react-native";
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

interface WebSwitchProps extends SwitchProps {
  activeThumbColor?: ColorValue;
}

const WebCompatibleSwitch = Switch as React.ComponentType<WebSwitchProps>;

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
  const resolvedThumbColor = thumbColor ?? "#ffffff";

  return (
    <WebCompatibleSwitch
      {...props}
      value={value}
      onValueChange={onValueChange}
      trackColor={resolvedTrackColor}
      thumbColor={resolvedThumbColor}
      activeThumbColor={Platform.OS === "web" ? resolvedThumbColor : undefined}
      accessibilityRole={accessibilityRole ?? "switch"}
      accessibilityState={{
        ...accessibilityState,
        checked: accessibilityState?.checked ?? Boolean(value),
      }}
    />
  );
}
