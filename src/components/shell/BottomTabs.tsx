import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  LayoutDashboard,
  FolderKanban,
  Play,
  DollarSign,
  MoreHorizontal,
} from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";
import type { LucideIcon } from "lucide-react-native";

const TABS: { icon: LucideIcon; label: string; route: string }[] = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/(dashboard)/dashboard" },
  { icon: FolderKanban, label: "Projects", route: "/(dashboard)/projects" },
  { icon: Play, label: "Runs", route: "/(dashboard)/runs" },
  { icon: DollarSign, label: "Costs", route: "/(dashboard)/costs" },
  { icon: MoreHorizontal, label: "More", route: "/(dashboard)/settings" },
];

export function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
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
            <Icon size={20} color={active ? "#30a8dc" : "#7a7a7a"} />
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
            {active && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderTopColor: "#2d2d2d",
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
    color: "#7a7a7a",
  },
  activeLabel: {
    color: "#30a8dc",
  },
  indicator: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 2,
    backgroundColor: "#30a8dc",
    borderRadius: 1,
  },
});
