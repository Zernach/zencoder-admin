import React, { useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  Home,
  Bot,
  DollarSign,
  Shield,
  Settings,
} from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isAndroid } from "@/constants/platform";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { ROUTES } from "@/constants/routes";

const TABS: { icon: LucideIcon; label: string; route: ROUTES }[] = [
  { icon: Home, label: "Home", route: ROUTES.DASHBOARD },
  { icon: Bot, label: "Agents", route: ROUTES.AGENTS },
  { icon: DollarSign, label: "Costs", route: ROUTES.COSTS },
  { icon: Shield, label: "Governance", route: ROUTES.GOVERNANCE },
  { icon: Settings, label: "Settings", route: ROUTES.SETTINGS },
];

function isTabRouteActive(pathname: string, route: ROUTES): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isAndroid) return;
    for (const tab of TABS) {
      router.prefetch(tab.route as never);
    }
  }, [router]);

  const handleTabPress = useCallback(
    (route: ROUTES, active: boolean) => {
      if (active) return;
      router.navigate(route as never);
    },
    [router],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bg.canvas,
          borderTopColor: theme.border.default,
          paddingBottom: insets.bottom === 0 ? 4 : insets.bottom,
          paddingTop: insets.bottom === 0 ? 4 : 8,
        },
      ]}
    >
      {TABS.map((tab) => {
        const active = isTabRouteActive(pathname, tab.route);
        const Icon = tab.icon;
        return (
          <Pressable
            key={tab.route}
            onPress={() => handleTabPress(tab.route, active)}
            disabled={active}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
          >
            <Icon size={20} color={active ? theme.border.brand : theme.text.tertiary} />
            <Text style={[styles.label, { color: active ? theme.border.brand : theme.text.tertiary }]}>
              {tab.label}
            </Text>
            {active && <View style={[styles.indicator, { backgroundColor: theme.border.brand }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    justifyContent: "center",
    position: "relative",
  },
  label: {
    fontSize: 10,
  },
  indicator: {
    position: "absolute",
    top: -4,
    width: 24,
    height: 2,
    borderRadius: 1,
  },
});
