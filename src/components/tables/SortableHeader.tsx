import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { ChevronUp, ChevronDown } from "lucide-react-native";

interface SortableHeaderProps {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onPress: () => void;
}

export function SortableHeader({
  label,
  active,
  direction,
  onPress,
}: SortableHeaderProps) {
  const Icon = direction === "asc" ? ChevronUp : ChevronDown;

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={styles.label}>{label}</Text>
      {active && (
        <View style={styles.icon}>
          <Icon size={12} color="#e5e5e5" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a3a3a3",
  },
  icon: {
    width: 12,
    height: 12,
  },
});
