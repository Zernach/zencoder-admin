import React, { useCallback } from "react";
import { Text, View, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { ChevronUp, ChevronDown } from "lucide-react-native";
import type { SortDirection } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface SortableHeaderProps {
  label: string;
  active: boolean;
  direction: SortDirection;
  columnKey: string;
  onSort: (key: string) => void;
}

export const SortableHeader = React.memo(function SortableHeader({
  label,
  active,
  direction,
  columnKey,
  onSort,
}: SortableHeaderProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const Icon = direction === "asc" ? ChevronUp : ChevronDown;

  const handlePress = useCallback(() => {
    onSort(columnKey);
  }, [onSort, columnKey]);

  return (
    <CustomButton
      onPress={handlePress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`Sort by ${label}${active ? `, ${direction === "asc" ? "ascending" : "descending"}` : ""}`}
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>
      {active && (
        <View style={styles.icon}>
          <Icon size={12} color={theme.text.primary} />
        </View>
      )}
    </CustomButton>
  );
});

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
  },
  icon: {
    width: 12,
    height: 12,
  },
});
