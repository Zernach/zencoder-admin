import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { Inbox } from "lucide-react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface EmptyStateProps {
  message?: string;
  activeFilters?: string[];
  onClearFilters?: () => void;
}

export const EmptyState = React.memo(function EmptyState({
  message = "No data matches your current filters.",
  activeFilters,
  onClearFilters,
}: EmptyStateProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <View style={styles.container}>
      <Inbox size={32} color={theme.text.tertiary} />
      <Text style={[styles.message, { color: theme.text.secondary }]}>{message}</Text>
      {activeFilters && activeFilters.length > 0 && (
        <View style={styles.filterList}>
          {activeFilters.map((f) => (
            <View key={f} style={[styles.chip, { backgroundColor: theme.bg.surfaceElevated, borderColor: theme.border.default }]}>
              <Text style={[styles.chipText, { color: theme.text.secondary }]}>{f}</Text>
            </View>
          ))}
        </View>
      )}
      {onClearFilters && (
        <CustomButton
          onPress={onClearFilters}
          style={[styles.button, { backgroundColor: theme.border.brand }]}
          accessibilityRole="button"
          accessibilityLabel="Clear Filters"
        >
          <Text style={[styles.buttonText, { color: theme.text.onBrand }]}>Clear Filters</Text>
        </CustomButton>
      )}
    </View>
  );
});

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
    textAlign: "center",
  },
  filterList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  button: {
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
    fontSize: 14,
    fontWeight: "600",
  },
});
