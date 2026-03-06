import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { LoadingSkeleton, EmptyState } from "@/components/dashboard";
import { CustomList } from "@/components/lists";
import { SortableHeader } from "./SortableHeader";
import type { SortDirection } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

type SortableValue = string | number | boolean | Date | null | undefined;

interface ColumnDef<T> {
  key: string;
  header: string;
  width?: number | string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: T) => ReactNode;
  sortAccessor?: (row: T) => SortableValue;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  sortBy?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  onRowPress?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
}

export type { ColumnDef, DataTableProps };

function normalizeSortValue(value: SortableValue): string | number | boolean | null {
  if (value == null) return null;
  if (value instanceof Date) return value.getTime();
  return value;
}

function compareSortValues(left: SortableValue, right: SortableValue): number {
  const a = normalizeSortValue(left);
  const b = normalizeSortValue(right);

  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function toSortableValue(value: unknown): SortableValue {
  if (value == null) return value;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return String(value);
}

export function DataTable<T>({
  columns,
  data,
  sortBy,
  sortDirection = "asc",
  onSort,
  onRowPress,
  loading,
  emptyMessage,
  keyExtractor,
}: DataTableProps<T>) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const [internalSort, setInternalSort] = useState<{
    sortBy?: string;
    sortDirection: SortDirection;
  }>({
    sortBy: undefined,
    sortDirection: "asc",
  });

  const activeSortBy = onSort ? sortBy : internalSort.sortBy;
  const activeSortDirection = onSort ? sortDirection : internalSort.sortDirection;

  const sortedData = useMemo(() => {
    if (!activeSortBy) return data;

    const activeColumn = columns.find((column) => column.key === activeSortBy);
    if (!activeColumn || activeColumn.sortable === false) return data;

    const directionMultiplier = activeSortDirection === "asc" ? 1 : -1;

    return data
      .map((row, index) => ({ row, index }))
      .sort((left, right) => {
        const leftValue: SortableValue = activeColumn.sortAccessor
          ? activeColumn.sortAccessor(left.row)
          : toSortableValue((left.row as Record<string, unknown>)[activeColumn.key]);
        const rightValue: SortableValue = activeColumn.sortAccessor
          ? activeColumn.sortAccessor(right.row)
          : toSortableValue((right.row as Record<string, unknown>)[activeColumn.key]);
        const comparison = compareSortValues(leftValue, rightValue);

        if (comparison !== 0) return comparison * directionMultiplier;
        return left.index - right.index;
      })
      .map((entry) => entry.row);
  }, [activeSortBy, activeSortDirection, columns, data]);

  const handleSortPress = useCallback(
    (key: string) => {
      if (onSort) {
        onSort(key);
        return;
      }

      setInternalSort((current) => {
        if (current.sortBy === key) {
          return {
            sortBy: key,
            sortDirection: current.sortDirection === "asc" ? "desc" : "asc",
          };
        }

        return { sortBy: key, sortDirection: "asc" };
      });
    },
    [onSort]
  );

  if (loading) return <LoadingSkeleton variant="table" rows={5} />;
  if (sortedData.length === 0)
    return <EmptyState message={emptyMessage ?? "No data available."} />;

  return (
    <CustomList
      scrollViewProps={{ horizontal: true, showsHorizontalScrollIndicator: false }}
    >
      <View>
        {/* Header */}
        <View style={[styles.headerRow, { backgroundColor: theme.bg.surfaceElevated }]}>
          {columns.map((col) => (
            <View
              key={col.key}
              style={[
                styles.cell,
                col.width != null
                  ? { width: col.width as number }
                  : styles.flexCell,
                col.align === "right" && styles.alignRight,
                col.align === "center" && styles.alignCenter,
              ]}
            >
              {col.sortable !== false ? (
                <SortableHeader
                  label={col.header}
                  active={activeSortBy === col.key}
                  direction={activeSortBy === col.key ? activeSortDirection : "asc"}
                  onPress={() => handleSortPress(col.key)}
                />
              ) : (
                <Text style={[styles.headerText, { color: theme.text.secondary }]}>{col.header}</Text>
              )}
            </View>
          ))}
        </View>
        {/* Body */}
        {sortedData.map((row, rowIdx) => {
          const rowKey = keyExtractor(row);
          const rowContent = (
            <View
              style={[
                styles.bodyRow,
                rowIdx % 2 === 1 && { backgroundColor: `${theme.bg.surface}80` },
              ]}
            >
              {columns.map((col) => (
                <View
                  key={col.key}
                  style={[
                    styles.cell,
                    col.width != null
                      ? { width: col.width as number }
                      : styles.flexCell,
                    col.align === "right" && styles.alignRight,
                    col.align === "center" && styles.alignCenter,
                  ]}
                >
                  {col.render ? (
                    col.render(row)
                  ) : (
                    <Text style={[styles.bodyText, { color: theme.text.primary }]}>
                      {String((row as Record<string, unknown>)[col.key] ?? "")}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          );

          if (onRowPress) {
            return (
              <CustomButton
                key={rowKey}
                onPress={() => onRowPress(row)}
                accessibilityRole="button"
                accessibilityLabel={`Table row ${rowKey}`}
                testID="table-row"
              >
                {rowContent}
              </CustomButton>
            );
          }
          return (
            <View key={rowKey} testID="table-row">
              {rowContent}
            </View>
          );
        })}
      </View>
    </CustomList>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  bodyRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    alignItems: "center",
  },
  cell: {
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  flexCell: {
    flex: 1,
    minWidth: 80,
  },
  alignRight: {
    alignItems: "flex-end",
  },
  alignCenter: {
    alignItems: "center",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bodyText: {
    fontSize: 12,
  },
});
