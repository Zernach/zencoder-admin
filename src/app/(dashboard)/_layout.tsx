import React from "react";
import { Tabs } from "expo-router";
import { DashboardShell } from "@/components/shell";
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
        initialRouteName="dashboard"
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.bg.canvas },
          animation: "none",
          lazy: false,
          freezeOnBlur: false,
          popToTopOnBlur: false,
        }}
      >
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="agents" />
        <Tabs.Screen name="costs" />
        <Tabs.Screen name="governance" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </DashboardShell>
  );
}
