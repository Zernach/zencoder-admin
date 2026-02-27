import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Inbox } from "lucide-react-native";

interface EmptyStateProps {
  message?: string;
  activeFilters?: string[];
  onClearFilters?: () => void;
}

export function EmptyState({
  message = "No data matches your current filters.",
  activeFilters,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Inbox size={32} color="#8a8a8a" />
      <Text style={styles.message}>{message}</Text>
      {activeFilters && activeFilters.length > 0 && (
        <View style={styles.filterList}>
          {activeFilters.map((f) => (
            <View key={f} style={styles.chip}>
              <Text style={styles.chipText}>{f}</Text>
            </View>
          ))}
        </View>
      )}
      {onClearFilters && (
        <Pressable
          onPress={onClearFilters}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Clear Filters"
        >
          <Text style={styles.buttonText}>Clear Filters</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
    minHeight: 200,
  },
  message: {
    fontSize: 14,
    color: "#a3a3a3",
    textAlign: "center",
  },
  filterList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  chip: {
    backgroundColor: "#262626",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },
  chipText: {
    fontSize: 11,
    color: "#a3a3a3",
  },
  button: {
    backgroundColor: "#30a8dc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#00131c",
    fontSize: 14,
    fontWeight: "600",
  },
});
