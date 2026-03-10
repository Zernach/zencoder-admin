import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { CustomList } from "@/components/lists";
import { X } from "lucide-react-native";
import type { FilterChip } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

interface FilterChipsProps {
  chips: FilterChip[];
  onClearAll?: () => void;
}

export const FilterChips = React.memo(function FilterChips({ chips, onClearAll }: FilterChipsProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  if (chips.length === 0) return null;

  return (
    <CustomList
      scrollViewProps={{
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        style: styles.scroll,
        contentContainerStyle: styles.container,
      }}
    >
      {chips.map((chip) => (
        <View key={chip.key} style={[styles.chip, { backgroundColor: theme.bg.surfaceElevated, borderColor: theme.border.default }]}>
          <Text style={[styles.chipText, { color: theme.text.primary }]}>{chip.label}</Text>
          <CustomButton
            onPress={chip.onRemove}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${chip.label} filter`}
          >
            <X size={12} color={theme.text.secondary} />
          </CustomButton>
        </View>
      ))}
      {onClearAll && (
        <CustomButton
          onPress={onClearAll}
          style={styles.clearAll}
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
        >
          <Text style={[styles.clearAllText, { color: theme.border.brand }]}>Clear All</Text>
        </CustomButton>
      )}
    </CustomList>
  );
});

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: "row",
    gap: spacing[8],
    paddingVertical: spacing[8],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[6],
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[6],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  clearAll: {
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[6],
    justifyContent: "center",
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
