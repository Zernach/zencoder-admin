import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DataTable, type ColumnDef, type DataTableProps } from "./DataTable";
import { DataList } from "./DataList";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { useWindowDimensions } from "react-native";
import { spacing, radius } from "@/theme/tokens";

interface ResponsiveTableProps<T> extends DataTableProps<T> {
  renderListItem?: (row: T) => React.ReactNode;
  estimatedItemSize?: number;
}

function DefaultListItem<T>({ item }: { item: T }) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const entries = Object.entries(item as Record<string, unknown>).slice(0, 4);
  return (
    <View style={[listStyles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
      {entries.map(([key, val]) => (
        <View key={key} style={listStyles.row}>
          <Text style={[listStyles.label, { color: theme.text.tertiary }]}>{key}</Text>
          <Text style={[listStyles.value, { color: theme.text.primary }]}>{String(val ?? "")}</Text>
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
  const renderDefaultListItem = useCallback(
    (item: T) => <DefaultListItem item={item} />,
    [],
  );
  const renderResolvedListItem = renderListItem ?? renderDefaultListItem;

  if (isMobile) {
    return (
      <DataList
        data={tableProps.data}
        renderItem={renderResolvedListItem}
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
    borderRadius: radius.md,
    padding: spacing[12],
    marginBottom: spacing[8],
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing[4],
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
  value: {
    fontSize: 12,
    fontWeight: "500",
  },
});
