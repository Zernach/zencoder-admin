import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@/components/buttons";
import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react-native";
import { spacing, radius } from "@/theme/tokens";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useRouter, usePathname, useNavigation } from "expo-router";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { TabActions } from "@react-navigation/native";
import { SidebarNavItem } from "./SidebarNavItem";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { isWeb } from "@/constants/platform";
import { isRouteActive, ROUTES, type NavRoute, type TABS } from "@/constants/routes";
import { TOP_NAV_ITEMS, hasSubsections, getSubsections } from "@/constants/navigation";
import { SidebarSubsectionItem } from "./SidebarSubsectionItem";
import { useSectionScroll } from "@/hooks/useSectionScroll";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectSidebarExpanded, toggleSidebar } from "@/store/slices/sidebarSlice";

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

export const Sidebar = React.memo(function Sidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const expanded = useAppSelector(selectSidebarExpanded);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const { scrollToSection } = useSectionScroll();
  const sidebarWidth = useSharedValue(expanded ? 264 : 76);
  // Use refs for values that change on navigation — keeps press handlers stable
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const routerRef = useRef(router);
  routerRef.current = router;
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;

  // Stable press handler cache — handlers reference refs so they never go stale
  const navPressHandlers = useRef(new Map<string, () => void>()).current;
  const subPressHandlers = useRef(new Map<string, () => void>()).current;

  const getNavPressHandler = useCallback(
    (route: NavRoute, tab: TABS) => {
      let handler = navPressHandlers.get(route);
      if (!handler) {
        handler = () => {
          if (isRouteActive(pathnameRef.current, route)) {
            // Active tab pressed — reset stack to root (no-op if already at root).
            // Dashboard has two root paths: "/" and "/dashboard".
            const atRoot = pathnameRef.current === route
              || (route === ROUTES.ROOT && pathnameRef.current === ROUTES.DASHBOARD);
            if (!atRoot) {
              routerRef.current.navigate(route as never);
            }
            return;
          }
          // Inactive tab — jump without resetting its stack
          const tabNav = findTabNavigator(navigationRef.current, tab);
          if (tabNav) {
            tabNav.dispatch(TabActions.jumpTo(tab));
            return;
          }
          routerRef.current.navigate(route as never);
        };
        navPressHandlers.set(route, handler);
      }
      return handler;
    },
    [navPressHandlers],
  );

  const getSubPressHandler = useCallback(
    (sectionId: string) => {
      let handler = subPressHandlers.get(sectionId);
      if (!handler) {
        handler = () => scrollToSection(sectionId);
        subPressHandlers.set(sectionId, handler);
      }
      return handler;
    },
    [scrollToSection, subPressHandlers],
  );

  const handleToggle = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  useEffect(() => {
    sidebarWidth.value = withTiming(expanded ? 264 : 76, {
      duration: 220,
      easing: Easing.out(Easing.ease),
    });
  }, [expanded, sidebarWidth]);

  useEffect(() => {
    if (!isWeb) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "[") handleToggle();
      if (e.key === "]") handleToggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleToggle]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: sidebarWidth.value,
  }));

  const sidebarStyle = useMemo(
    () => [styles.sidebar, { backgroundColor: theme.bg.canvas, borderRightColor: theme.border.default }, animatedStyle],
    [theme.bg.canvas, theme.border.default, animatedStyle],
  );

  const isDark = mode === "dark";

  return (
    <Animated.View style={sidebarStyle}>
      <View style={styles.header}>
        {expanded && (
          isDark ? (
            <Image
              source={require("../../assets/images/zencoder-text-dark-bg.png")}
              style={styles.brandImage}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/images/zencoder-orange.png")}
                style={styles.brandIcon}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <Text style={[styles.brandText, { color: theme.text.primary }]}>zencoder</Text>
            </View>
          )
        )}
        <CustomButton
          onPress={handleToggle}
          style={styles.toggleBtn}
          buttonMode="ghost"
          buttonSize="iconSm"
          accessibilityRole="button"
          accessibilityLabel={expanded ? t("navigation.collapseSidebar") : t("navigation.expandSidebar")}
        >
          {expanded ? (
            <PanelLeftClose size={18} color={theme.text.secondary} />
          ) : (
            <PanelLeftOpen size={18} color={theme.text.secondary} />
          )}
        </CustomButton>
      </View>
      <View style={styles.nav}>
        {TOP_NAV_ITEMS.map((item) => {
          const active = isRouteActive(pathname, item.route);
          return (
            <React.Fragment key={item.route}>
              <SidebarNavItem
                icon={item.icon}
                label={item.label}
                route={item.route}
                active={active}
                expanded={expanded}
                onPress={getNavPressHandler(item.route, item.tab)}
              />
              {active && expanded && hasSubsections(item.route) && (
                <View accessibilityRole="list" accessibilityLabel={t("navigation.subsectionsLabel", { label: t(item.label) })}>
                  {getSubsections(item.route).map((sub) => (
                    <SidebarSubsectionItem
                      key={sub.id}
                      label={sub.label}
                      onPress={getSubPressHandler(sub.id)}
                    />
                  ))}
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    paddingVertical: spacing[16],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: spacing[0],
    marginBottom: spacing[24],
    minHeight: 32,
  },
  brandImage: {
    width: 150,
    height: 28,
    alignSelf: "flex-start",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
    paddingHorizontal: spacing[10],
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  toggleBtn: {
    marginLeft: "auto",
  },
  nav: {
    gap: spacing[2],
    paddingHorizontal: spacing[8],
  },
});
