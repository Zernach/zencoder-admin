import React from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { Menu, Search, Filter, Clock } from "lucide-react-native";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";

interface TopBarProps {
  onToggleSidebar?: () => void;
  showMenuButton?: boolean;
}

export function TopBar({ onToggleSidebar, showMenuButton }: TopBarProps) {
  const { preset, activeFilterCount } = useDashboardFilters();

  const presetLabels: Record<string, string> = {
    "24h": "Last 24 hours",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    custom: "Custom range",
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showMenuButton && onToggleSidebar && (
          <Pressable
            onPress={onToggleSidebar}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Toggle sidebar"
          >
            <Menu size={20} color="#a3a3a3" />
          </Pressable>
        )}
        <View style={styles.searchContainer}>
          <Search size={14} color="#7a7a7a" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search agents, projects, runs..."
            placeholderTextColor="#7a7a7a"
          />
        </View>
      </View>
      <View style={styles.right}>
        <Pressable style={styles.presetBtn} accessibilityRole="button">
          <Clock size={14} color="#a3a3a3" />
          <Text style={styles.presetText}>
            {presetLabels[preset] ?? preset}
          </Text>
        </Pressable>
        <Pressable style={styles.iconBtn} accessibilityRole="button">
          <Filter size={16} color="#a3a3a3" />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d2d",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    flex: 1,
    maxWidth: 400,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#e5e5e5",
  },
  presetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#1a1a1a",
  },
  presetText: {
    fontSize: 12,
    color: "#a3a3a3",
  },
  filterBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#30a8dc",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 9,
    color: "#00131c",
    fontWeight: "700",
  },
});
