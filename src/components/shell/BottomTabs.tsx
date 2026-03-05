import React from "react";
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
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

const TABS: { icon: LucideIcon; label: string; route: string }[] = [
  { icon: Home, label: "Home", route: "/(dashboard)/dashboard" },
  { icon: Bot, label: "Agents", route: "/(dashboard)/agents" },
  { icon: DollarSign, label: "Costs", route: "/(dashboard)/costs" },
  { icon: Shield, label: "Governance", route: "/(dashboard)/governance" },
  { icon: Settings, label: "Settings", route: "/(dashboard)/settings" },
];

export function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg.canvas, borderTopColor: theme.border.default }]}>
      {TABS.map((tab) => {
        const active = pathname.includes(
          tab.route.replace("/(dashboard)", "")
        );
        const Icon = tab.icon;
        return (
          <Pressable
            key={tab.route}
            onPress={() => router.push(tab.route as never)}
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
    paddingBottom: 20,
    paddingTop: 8,
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
    top: -8,
    width: 24,
    height: 2,
    borderRadius: 1,
  },
});
