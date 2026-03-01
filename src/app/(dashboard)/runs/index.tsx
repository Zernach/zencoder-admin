import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useRunsExplorer } from "@/features/analytics/hooks/useRunsExplorer";
import { useAppDependencies } from "@/core/di/AppDependencies";
import { SectionHeader, ErrorState, StatusBadge } from "@/components/dashboard";
import { DataTable, PaginationControls, type ColumnDef } from "@/components/tables";
import { formatCurrency, formatDuration, formatCompactNumber } from "@/features/analytics/utils/formatters";
import type { RunListRow } from "@/features/analytics/types";
import { ScreenWrapper } from "@/components/screen";
import { FilterBar } from "@/components/filters";
import { spacing } from "@/theme/tokens";

export default function RunsExplorerScreen() {
  const { data, loading, error, refetch, page, pageSize, sortBy, sortDirection, setPage, handleSort } = useRunsExplorer();
  const router = useRouter();
  const { seedData } = useAppDependencies();

  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of seedData.projects) m.set(p.id, p.name);
    return m;
  }, [seedData.projects]);

  const teamMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of seedData.teams) m.set(t.id, t.name);
    return m;
  }, [seedData.teams]);

  const columns: ColumnDef<RunListRow>[] = useMemo(
    () => [
      { key: "id", header: "Run ID", width: 110, sortable: false, render: (row) => <Text style={{ color: "#67c4ea", fontSize: 12 }} numberOfLines={1}>{row.id}</Text> },
      {
        key: "status",
        header: "Status",
        width: 100,
        render: (row) => <StatusBadge variant="run-status" status={row.status} />,
      },
      { key: "projectId", header: "Project", width: 150, render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }} numberOfLines={1}>{projectMap.get(row.projectId) ?? row.projectId}</Text> },
      { key: "teamId", header: "Team", width: 130, render: (row) => <Text style={{ color: "#a3a3a3", fontSize: 12 }} numberOfLines={1}>{teamMap.get(row.teamId) ?? row.teamId}</Text> },
      { key: "startedAtIso", header: "Started", width: 160, sortable: true, render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{new Date(row.startedAtIso).toLocaleString()}</Text> },
      { key: "durationMs", header: "Duration", width: 90, sortable: true, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatDuration(row.durationMs)}</Text> },
      { key: "totalTokens", header: "Tokens", width: 90, sortable: true, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCompactNumber(row.totalTokens)}</Text> },
      { key: "costUsd", header: "Cost", width: 90, sortable: true, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCurrency(row.costUsd)}</Text> },
      { key: "provider", header: "Provider", width: 80 },
    ],
    [projectMap, teamMap]
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <ScreenWrapper
      headerProps={{
        title: "Runs Explorer",
        subtitle: data ? `${data.total.toLocaleString()} runs found` : "Browse and filter all agent runs",
        isLoading: loading,
      }}
    >
      <FilterBar />
      <View style={styles.section}>
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[3],
  },
});
