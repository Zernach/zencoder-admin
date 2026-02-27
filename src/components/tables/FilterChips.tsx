import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { X } from "lucide-react-native";

interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onClearAll?: () => void;
}

export function FilterChips({ chips, onClearAll }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => (
        <View key={chip.key} style={styles.chip}>
          <Text style={styles.chipText}>{chip.label}</Text>
          <Pressable
            onPress={chip.onRemove}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${chip.label} filter`}
          >
            <X size={12} color="#a3a3a3" />
          </Pressable>
        </View>
      ))}
      {onClearAll && (
        <Pressable
          onPress={onClearAll}
          style={styles.clearAll}
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
        >
          <Text style={styles.clearAllText}>Clear All</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#262626",
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },
  chipText: {
    fontSize: 12,
    color: "#e5e5e5",
  },
  clearAll: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
  },
  clearAllText: {
    fontSize: 12,
    color: "#30a8dc",
    fontWeight: "500",
  },
});
