import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@/components/buttons";
import { useNavigation, usePathname, useRouter } from "expo-router";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { TabActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { isRouteActive, ROUTES, TABS, type NavRoute } from "@/constants/routes";
import { TOP_NAV_ITEMS } from "@/constants/navigation";
import { spacing, radius } from "@/theme/tokens";

function findTabNavigator(
  navigation: NavigationProp<ParamListBase>,
  routeName: TABS,
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

export const BottomTabs = React.memo(function BottomTabs() {
  const { t } = useTranslation();
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
    (tab: TABS, route: NavRoute, active: boolean) => {
      if (active) {
        // Already at tab root — no-op. Dashboard has two root paths: "/" and "/dashboard".
        const atRoot = pathnameRef.current === route
          || (route === ROUTES.ROOT && pathnameRef.current === ROUTES.DASHBOARD);
        if (!atRoot) {
          router.navigate(route as never);
        }
        return;
      }

      const tabNavigation = findTabNavigator(navigation, tab);

      if (tabNavigation) {
        tabNavigation.dispatch(TabActions.jumpTo(tab));
        return;
      }

      router.navigate(route as never);
    },
    [navigation, router],
  );

  // Cache press handlers per tab to avoid inline closure recreation in .map()
  const pressHandlerCache = useRef(new Map<string, () => void>()).current;
  const handleTabPressRef = useRef(handleTabPress);
  handleTabPressRef.current = handleTabPress;
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const getTabPressHandler = useCallback((tab: TABS, route: NavRoute) => {
    const cacheKey = `${tab}_${route}`;
    let handler = pressHandlerCache.get(cacheKey);
    if (!handler) {
      handler = () => {
        const active = isRouteActive(pathnameRef.current, route);
        handleTabPressRef.current(tab, route, active);
      };
      pressHandlerCache.set(cacheKey, handler);
    }
    return handler;
  }, [pressHandlerCache]);

  const containerStyle = useMemo(() => [
    styles.container,
    {
      backgroundColor: theme.bg.canvas,
      borderTopColor: theme.border.default,
      paddingBottom: insets.bottom === 0 ? 4 : insets.bottom,
      paddingTop: insets.bottom === 0 ? 4 : 8,
    },
  ], [theme.bg.canvas, theme.border.default, insets.bottom]);

  return (
    <View style={containerStyle}>
      {TOP_NAV_ITEMS.map((tab) => {
        const active = isRouteActive(pathname, tab.route);
        const Icon = tab.icon;
        return (
          <CustomButton
            key={tab.route}
            onPress={getTabPressHandler(tab.tab, tab.route)}
            disablePressedStyle={active}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.label)}
            accessibilityState={{ selected: active }}
          >
            <Icon size={20} color={active ? theme.border.brand : theme.text.tertiary} />
            <Text style={[styles.label, { color: active ? theme.border.brand : theme.text.tertiary }]}>
              {t(tab.label)}
            </Text>
            {active && <View style={[styles.indicator, { backgroundColor: theme.border.brand }]} />}
          </CustomButton>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: spacing[4],
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
    borderRadius: radius.sm,
  },
});
