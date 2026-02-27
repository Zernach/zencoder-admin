import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { DataTable, type ColumnDef, type DataTableProps } from "./DataTable";
import { DataList } from "./DataList";

interface ResponsiveTableProps<T> extends DataTableProps<T> {
  renderListItem?: (row: T) => React.ReactNode;
  estimatedItemSize?: number;
}

function DefaultListItem<T>({ item }: { item: T }) {
  const entries = Object.entries(item as Record<string, unknown>).slice(0, 4);
  return (
    <View style={listStyles.card}>
      {entries.map(([key, val]) => (
        <View key={key} style={listStyles.row}>
          <Text style={listStyles.label}>{key}</Text>
          <Text style={listStyles.value}>{String(val ?? "")}</Text>
        </View>
      ))}
    </View>
  );
}

export type { ColumnDef };

export function ResponsiveTable<T>({
  renderListItem,
  estimatedItemSize,
  ...tableProps
}: ResponsiveTableProps<T>) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (isMobile) {
    return (
      <DataList
        data={tableProps.data}
        renderItem={
          renderListItem ??
          ((item: T) => <DefaultListItem item={item} />)
        }
        onItemPress={tableProps.onRowPress}
        loading={tableProps.loading}
        emptyMessage={tableProps.emptyMessage}
        keyExtractor={tableProps.keyExtractor}
        estimatedItemSize={estimatedItemSize}
      />
    );
  }

  return <DataTable {...tableProps} />;
}

const listStyles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#242424",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    color: "#8a8a8a",
  },
  value: {
    fontSize: 12,
    color: "#e5e5e5",
  },
});
