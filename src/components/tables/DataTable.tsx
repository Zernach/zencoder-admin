import { memo, useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DimensionValue } from "react-native";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { LoadingSkeleton, EmptyState } from "@/components/dashboard";
import { CustomList } from "@/components/lists";
import { SortableHeader } from "./SortableHeader";
import type { SortDirection } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

type SortableValue = string | number | boolean | Date | null | undefined;

interface ColumnDef<T> {
  key: string;
  header: string;
  width?: DimensionValue;
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
  initialSortBy?: string;
  initialSortDirection?: SortDirection;
  onSort?: (key: string) => void;
  onRowPress?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
}

export type { ColumnDef, DataTableProps };

const HORIZONTAL_SCROLL_PROPS = {
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  style: { width: "100%" },
  contentContainerStyle: { minWidth: "100%", flexGrow: 1 },
} as const;

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

interface DataTableRowProps<T> {
  row: T;
  rowIdx: number;
  columns: ColumnDef<T>[];
  rowKey: string;
  altRowBg: string;
  bodyTextColor: string;
  onRowPress?: (row: T) => void;
}

const DataTableRow = memo(function DataTableRow<T>({
  row,
  rowIdx,
  columns,
  rowKey,
  altRowBg,
  bodyTextColor,
  onRowPress,
}: DataTableRowProps<T>) {
  const rowContent = (
    <View
      style={[
        styles.bodyRow,
        rowIdx % 2 === 1 && { backgroundColor: altRowBg },
      ]}
    >
      {columns.map((col, colIdx) => {
        const isLast = colIdx === columns.length - 1;
        const effectiveAlign = col.align ?? (isLast ? "right" : undefined);
        return (
          <View
            key={col.key}
            style={[
              styles.cell,
              col.width != null
                ? { minWidth: col.width, flexGrow: 1, flexBasis: 0 }
                : styles.flexCell,
              effectiveAlign === "right" && styles.alignRight,
              effectiveAlign === "center" && styles.alignCenter,
            ]}
          >
            {col.render ? (
              col.render(row)
            ) : (
              <Text style={[styles.bodyText, { color: bodyTextColor }]}>
                {String((row as Record<string, unknown>)[col.key] ?? "")}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );

  const handlePress = useCallback(() => onRowPress?.(row), [onRowPress, row]);

  if (onRowPress) {
    return (
      <CustomButton
        key={rowKey}
        onPress={handlePress}
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
}) as <T>(props: DataTableRowProps<T>) => ReactNode;

function DataTableInner<T>({
  columns,
  data,
  sortBy,
  sortDirection = "asc",
  initialSortBy,
  initialSortDirection,
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
    sortBy: initialSortBy,
    sortDirection: initialSortDirection ?? "asc",
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

  const altRowBg = `${theme.bg.surface}80`;

  const headerRowStyle = useMemo(
    () => [styles.headerRow, { backgroundColor: theme.bg.surfaceElevated }],
    [theme.bg.surfaceElevated],
  );

  if (loading) return <LoadingSkeleton variant="table" rows={5} />;
  if (sortedData.length === 0)
    return <EmptyState message={emptyMessage ?? "No data available."} />;

  return (
    <CustomList scrollViewProps={HORIZONTAL_SCROLL_PROPS}>
      <View style={styles.tableContent}>
        {/* Header */}
        <View style={headerRowStyle}>
          {columns.map((col, colIdx) => {
            const isLast = colIdx === columns.length - 1;
            const effectiveAlign = col.align ?? (isLast ? "right" : undefined);
            return (
              <View
                key={col.key}
                style={[
                  styles.cell,
                  col.width != null
                    ? { minWidth: col.width, flexGrow: 1, flexBasis: 0 }
                    : styles.flexCell,
                  effectiveAlign === "right" && styles.alignRight,
                  effectiveAlign === "center" && styles.alignCenter,
                ]}
              >
                {col.sortable !== false ? (
                  <SortableHeader
                    label={col.header}
                    active={activeSortBy === col.key}
                    direction={activeSortBy === col.key ? activeSortDirection : "asc"}
                    columnKey={col.key}
                    onSort={handleSortPress}
                  />
                ) : (
                  <Text style={[styles.headerText, { color: theme.text.secondary }]}>{col.header}</Text>
                )}
              </View>
            );
          })}
        </View>
        {/* Body */}
        {sortedData.map((row, rowIdx) => (
          <DataTableRow
            key={keyExtractor(row)}
            row={row}
            rowIdx={rowIdx}
            columns={columns}
            rowKey={keyExtractor(row)}
            altRowBg={altRowBg}
            bodyTextColor={theme.text.primary}
            onRowPress={onRowPress}
          />
        ))}
      </View>
    </CustomList>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;

const styles = StyleSheet.create({
  tableContent: {
    minWidth: "100%",
    width: "100%",
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.sm,
    marginBottom: spacing[2],
  },
  bodyRow: {
    flexDirection: "row",
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[10],
    minHeight: 44,
    alignItems: "center",
  },
  cell: {
    paddingHorizontal: spacing[8],
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
    fontWeight: "500",
  },
});
