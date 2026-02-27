import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { LoadingSkeleton, EmptyState } from "@/components/dashboard";
import { SortableHeader } from "./SortableHeader";

interface ColumnDef<T> {
  key: string;
  header: string;
  width?: number | string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowPress?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
}

export type { ColumnDef, DataTableProps };

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
  if (loading) return <LoadingSkeleton variant="table" rows={5} />;
  if (data.length === 0)
    return <EmptyState message={emptyMessage ?? "No data available."} />;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header */}
        <View style={styles.headerRow}>
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
              {col.sortable && onSort ? (
                <SortableHeader
                  label={col.header}
                  active={sortBy === col.key}
                  direction={sortBy === col.key ? sortDirection : "asc"}
                  onPress={() => onSort(col.key)}
                />
              ) : (
                <Text style={styles.headerText}>{col.header}</Text>
              )}
            </View>
          ))}
        </View>
        {/* Body */}
        {data.map((row, rowIdx) => {
          const rowContent = (
            <View
              style={[
                styles.bodyRow,
                rowIdx % 2 === 1 && styles.stripe,
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
                    <Text style={styles.bodyText}>
                      {String((row as Record<string, unknown>)[col.key] ?? "")}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          );

          if (onRowPress) {
            return (
              <Pressable
                key={keyExtractor(row)}
                onPress={() => onRowPress(row)}
                accessibilityRole="button"
              >
                {rowContent}
              </Pressable>
            );
          }
          return <View key={keyExtractor(row)}>{rowContent}</View>;
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#262626",
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
  stripe: {
    backgroundColor: "rgba(26, 26, 26, 0.5)",
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
    color: "#a3a3a3",
  },
  bodyText: {
    fontSize: 12,
    color: "#e5e5e5",
  },
});
