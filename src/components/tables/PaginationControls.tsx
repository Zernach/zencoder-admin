import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { formatNumber } from "@/features/analytics/utils/formatters";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function PaginationControls({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationControlsProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const totalPages = Math.ceil(total / pageSize);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <View style={styles.container}>
      <Text style={[styles.info, { color: theme.text.secondary }]}>
        Showing {formatNumber(start)}–{formatNumber(end)} of{" "}
        {formatNumber(total)}
      </Text>
      <View style={styles.buttons}>
        <Pressable
          onPress={() => hasPrev && onPageChange(page - 1)}
          disabled={!hasPrev}
          style={[styles.button, { backgroundColor: theme.bg.surfaceElevated }, !hasPrev && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel="Previous page"
        >
          <ChevronLeft size={16} color={hasPrev ? theme.text.primary : theme.text.tertiary} />
        </Pressable>
        <Text style={[styles.pageNum, { color: theme.text.primary }]}>
          {page} / {totalPages}
        </Text>
        <Pressable
          onPress={() => hasNext && onPageChange(page + 1)}
          disabled={!hasNext}
          style={[styles.button, { backgroundColor: theme.bg.surfaceElevated }, !hasNext && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel="Next page"
        >
          <ChevronRight size={16} color={hasNext ? theme.text.primary : theme.text.tertiary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  info: {
    fontSize: 12,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  pageNum: {
    fontSize: 12,
    minWidth: 40,
    textAlign: "center",
  },
});
