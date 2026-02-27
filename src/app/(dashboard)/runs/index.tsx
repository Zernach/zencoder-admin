import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useRunsExplorer } from "@/features/analytics/hooks/useRunsExplorer";
import { SectionHeader, ErrorState, StatusBadge } from "@/components/dashboard";
import { DataTable, PaginationControls, type ColumnDef } from "@/components/tables";
import { formatCurrency, formatDuration, formatCompactNumber } from "@/features/analytics/utils/formatters";
import type { RunListRow } from "@/features/analytics/types";

const columns: ColumnDef<RunListRow>[] = [
  { key: "id", header: "Run ID", width: 120, sortable: false },
  {
    key: "status",
    header: "Status",
    width: 100,
    render: (row) => <StatusBadge variant="run-status" status={row.status} />,
  },
  { key: "startedAtIso", header: "Started", width: 160, sortable: true, render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{new Date(row.startedAtIso).toLocaleString()}</Text> },
  { key: "durationMs", header: "Duration", width: 90, sortable: true, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatDuration(row.durationMs)}</Text> },
  { key: "totalTokens", header: "Tokens", width: 90, sortable: true, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCompactNumber(row.totalTokens)}</Text> },
  { key: "costUsd", header: "Cost", width: 90, sortable: true, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCurrency(row.costUsd)}</Text> },
  { key: "provider", header: "Provider", width: 80 },
];

export default function RunsExplorerScreen() {
  const { data, loading, error, refetch, page, pageSize, sortBy, sortDirection, setPage, handleSort } = useRunsExplorer();
  const router = useRouter();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Runs Explorer</Text>
      <Text style={styles.subtitle}>Browse and filter all agent runs</Text>

      <SectionHeader title="All Runs" />
      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowPress={(row) => router.push(`/(dashboard)/runs/${row.id}` as never)}
        loading={loading}
        keyExtractor={(row) => row.id}
      />
      {data && (
        <PaginationControls
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#e5e5e5", letterSpacing: -0.2 },
  subtitle: { fontSize: 14, color: "#a3a3a3", marginTop: -8 },
});
