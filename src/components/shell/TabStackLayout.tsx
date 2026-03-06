import React from "react";
import { Stack } from "expo-router";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

export function TabStackLayout() {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: theme.bg.canvas },
      }}
    />
  );
}
