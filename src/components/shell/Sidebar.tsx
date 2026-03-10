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
import { useRouter, usePathname } from "expo-router";
import { SidebarNavItem } from "./SidebarNavItem";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { isWeb } from "@/constants/platform";
import { isRouteActive, type TabRoute } from "@/constants/routes";
import { TOP_NAV_ITEMS, hasSubsections, getSubsections } from "@/constants/navigation";
import { SidebarSubsectionItem } from "./SidebarSubsectionItem";
import { useSectionScroll } from "@/hooks/useSectionScroll";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectSidebarExpanded, toggleSidebar } from "@/store/slices/sidebarSlice";

export const Sidebar = React.memo(function Sidebar() {
  const { t } = useTranslation();
  const router = useRouter();
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

  // Stable press handler cache — handlers reference refs so they never go stale
  const navPressHandlers = useRef(new Map<string, () => void>()).current;
  const subPressHandlers = useRef(new Map<string, () => void>()).current;

  const getNavPressHandler = useCallback(
    (route: TabRoute) => {
      let handler = navPressHandlers.get(route);
      if (!handler) {
        handler = () => {
          if (isRouteActive(pathnameRef.current, route)) {
            if (pathnameRef.current !== route) {
              routerRef.current.navigate(route as never);
            }
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
                onPress={getNavPressHandler(item.route)}
              />
              {active && expanded && hasSubsections(item.route) && (
                <View accessibilityRole="list" accessibilityLabel={t("navigation.subsections", { label: t(item.label) })}>
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
