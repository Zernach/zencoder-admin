import React, { useCallback, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { useNavigation, usePathname, useRouter } from "expo-router";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { TabActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { ROUTES } from "@/constants/routes";
import { TOP_NAV_ITEMS } from "@/constants/navigation";

function isTabRouteActive(pathname: string, route: ROUTES): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function toTabRouteName(route: ROUTES): string {
  return route.replace(/^\//, "");
}

function findTabNavigator(
  navigation: NavigationProp<ParamListBase>,
  routeName: string,
): NavigationProp<ParamListBase> | null {
  let current: NavigationProp<ParamListBase> | undefined = navigation;

  while (current) {
    const state = current.getState();
    if (state.type === "tab" && state.routeNames.includes(routeName)) {
      return current;
    }

    current = current.getParent();
  }

  return null;
}

export function BottomTabs() {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    for (const tab of TOP_NAV_ITEMS) {
      router.prefetch(tab.route as never);
    }
  }, [router]);

  const handleTabPress = useCallback(
    (route: ROUTES, active: boolean) => {
      if (active) return;
      const routeName = toTabRouteName(route);
      const tabNavigation = findTabNavigator(navigation, routeName);

      if (tabNavigation) {
        tabNavigation.dispatch(TabActions.jumpTo(routeName));
        return;
      }

      router.navigate(route as never);
    },
    [navigation, router],
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
      {TOP_NAV_ITEMS.map((tab) => {
        const active = isTabRouteActive(pathname, tab.route);
        const Icon = tab.icon;
        return (
          <CustomButton
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
          </CustomButton>
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
