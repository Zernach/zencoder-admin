import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { Inbox } from "lucide-react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

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
          style={styles.button}
          buttonMode="primary"
          buttonSize="md"
          label="Clear Filters"
          accessibilityRole="button"
          accessibilityLabel="Clear Filters"
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[32],
    gap: spacing[12],
    minHeight: 200,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
  },
  filterList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[6],
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  button: {
    marginTop: spacing[8],
  },
});
