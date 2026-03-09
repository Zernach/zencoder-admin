import React, { useCallback } from "react";
import { Tabs } from "expo-router";
import type { EventArg, NavigationState, PartialState } from "@react-navigation/native";
import { DashboardShell } from "@/components/shell";
import { navigationStateToSegments } from "@/features/search/navigation/navigationStateSegments";
import { TAB_ORDER, TABS } from "@/constants/routes";
import { useThemeMode } from "@/providers/ThemeProvider";
import { useAppDispatch } from "@/store";
import { setCurrentSegments } from "@/store/slices/navigationHistorySlice";
import { semanticThemes } from "@/theme/themes";

function isTabStatePayload(
  value: unknown,
): value is { state: NavigationState | PartialState<NavigationState> } {
  return (
    typeof value === "object"
    && value !== null
    && "state" in value
    && (
      value as {
        state?: NavigationState | PartialState<NavigationState>;
      }
    ).state != null
  );
}

export default function DashboardLayout() {
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  type TabStateEvent = EventArg<"state", false, unknown>;

  const handleTabStateChange = useCallback(
    (event: TabStateEvent) => {
      if (!isTabStatePayload(event.data)) {
        return;
      }

      dispatch(setCurrentSegments(navigationStateToSegments(event.data.state)));
    },
    [dispatch],
  );

  return (
    <DashboardShell>
      <Tabs
        backBehavior="history"
        detachInactiveScreens={false}
        initialRouteName={TABS.DASHBOARD}
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.bg.canvas },
          animation: "none",
          lazy: false,
          freezeOnBlur: false,
          popToTopOnBlur: false,
        }}
        screenListeners={{
          state: handleTabStateChange,
        }}
      >
        {TAB_ORDER.map((tab) => (
          <Tabs.Screen key={tab} name={tab} />
        ))}
      </Tabs>
    </DashboardShell>
  );
}
