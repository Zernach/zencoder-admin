import React from "react";
import { Tabs } from "expo-router";
import { DashboardShell } from "@/components/shell";
import { isAndroid } from "@/constants/platform";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

export default function DashboardLayout() {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <DashboardShell>
      <Tabs
        backBehavior="history"
        detachInactiveScreens={false}
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.bg.canvas },
          animation: "none",
          lazy: isAndroid,
          freezeOnBlur: isAndroid,
          popToTopOnBlur: false,
        }}
      />
    </DashboardShell>
  );
}
