import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  Play,
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

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/(dashboard)/dashboard" },
  { icon: FolderKanban, label: "Projects", route: "/(dashboard)/projects" },
  { icon: Bot, label: "Agents", route: "/(dashboard)/agents" },
  { icon: Play, label: "Runs", route: "/(dashboard)/runs" },
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

  return (
    <Animated.View style={[styles.sidebar, animatedStyle]}>
      <View style={styles.header}>
        {expanded && <Text style={styles.brand}>Zencoder</Text>}
        <Pressable
          onPress={onToggle}
          style={styles.toggleBtn}
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? (
            <PanelLeftClose size={18} color="#a3a3a3" />
          ) : (
            <PanelLeftOpen size={18} color="#a3a3a3" />
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
    backgroundColor: "#0a0a0a",
    borderRightWidth: 1,
    borderRightColor: "#2d2d2d",
    paddingVertical: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
    minHeight: 32,
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e5e5",
  },
  toggleBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  nav: {
    gap: 2,
    paddingHorizontal: 8,
  },
});
