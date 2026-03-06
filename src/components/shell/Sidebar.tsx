import React, { useCallback, useEffect } from "react";
import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react-native";
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
import { ROUTES } from "@/constants/routes";
import { TOP_TOP_NAV_ITEMS } from "@/constants/navigation";

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

function isSidebarRouteActive(pathname: string, route: ROUTES): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function Sidebar({ expanded, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const sidebarWidth = useSharedValue(expanded ? 264 : 76);
  const handleNavigate = useCallback(
    (route: ROUTES) => {
      if (isSidebarRouteActive(pathname, route)) return;
      router.navigate(route as never);
    },
    [pathname, router],
  );

  useEffect(() => {
    sidebarWidth.value = withTiming(expanded ? 264 : 76, {
      duration: 220,
      easing: Easing.out(Easing.ease),
    });
  }, [expanded, sidebarWidth]);

  useEffect(() => {
    if (!isWeb) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "[") onToggle();
      if (e.key === "]") onToggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onToggle]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: sidebarWidth.value,
  }));

  const isDark = mode === "dark";

  return (
    <Animated.View style={[styles.sidebar, { backgroundColor: theme.bg.canvas, borderRightColor: theme.border.default }, animatedStyle]}>
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
        <Pressable
          onPress={onToggle}
          style={styles.toggleBtn}
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? (
            <PanelLeftClose size={18} color={theme.text.secondary} />
          ) : (
            <PanelLeftOpen size={18} color={theme.text.secondary} />
          )}
        </Pressable>
      </View>
      <View style={styles.nav}>
        {TOP_NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.route}
            icon={item.icon}
            label={item.label}
            route={item.route}
            active={isSidebarRouteActive(pathname, item.route)}
            expanded={expanded}
            onPress={() => handleNavigate(item.route)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    paddingVertical: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 0,
    marginBottom: 24,
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
    gap: 8,
    paddingHorizontal: 10,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  toggleBtn: {
    width: 32,
    height: 32,
    marginLeft: "auto",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  nav: {
    gap: 2,
    paddingHorizontal: 8,
  },
});
