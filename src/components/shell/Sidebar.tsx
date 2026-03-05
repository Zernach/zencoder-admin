import React, { useEffect } from "react";
import { View, Image, Pressable, StyleSheet, Platform } from "react-native";
import {
  Home,
  Bot,
  DollarSign,
  Shield,
  Settings,
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

const NAV_ITEMS = [
  { icon: Home, label: "Home", route: "/(dashboard)/dashboard" },
  { icon: Bot, label: "Agents", route: "/(dashboard)/agents" },
  { icon: DollarSign, label: "Costs", route: "/(dashboard)/costs" },
  { icon: Shield, label: "Governance", route: "/(dashboard)/governance" },
  { icon: Settings, label: "Settings", route: "/(dashboard)/settings" },
] as const;

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

export function Sidebar({ expanded, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const sidebarWidth = useSharedValue(expanded ? 264 : 76);

  useEffect(() => {
    sidebarWidth.value = withTiming(expanded ? 264 : 76, {
      duration: 220,
      easing: Easing.out(Easing.ease),
    });
  }, [expanded, sidebarWidth]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
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
  const brandImage = isDark
    ? require("../../assets/images/zencoder-text-dark-bg.png")
    : require("../../assets/images/zencoder-text-dark-bg.png");

  return (
    <Animated.View style={[styles.sidebar, { backgroundColor: theme.bg.canvas, borderRightColor: theme.border.default }, animatedStyle]}>
      <View style={styles.header}>
        {expanded && (
          <Image
            source={brandImage}
            style={styles.brandImage}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
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
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.route}
            icon={item.icon}
            label={item.label}
            route={item.route}
            active={pathname.includes(item.route.replace("/(dashboard)", ""))}
            expanded={expanded}
            onPress={() => router.push(item.route as never)}
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
