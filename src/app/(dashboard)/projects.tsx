import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useProjectsDashboard } from "@/features/analytics/hooks/useProjectsDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart } from "@/components/charts";
import { DataTable, type ColumnDef } from "@/components/tables";
import { formatCurrency, formatPercent, formatCompactNumber } from "@/features/analytics/utils/formatters";
import type { ProjectBreakdownRow } from "@/features/analytics/types";
import { ScreenWrapper } from "@/components/screen";
import { FilterBar } from "@/components/filters";
import { spacing } from "@/theme/tokens";

const projectCols: ColumnDef<ProjectBreakdownRow>[] = [
  { key: "projectName", header: "Project", width: 180 },
  { key: "teamName", header: "Team", width: 130, render: (row) => <Text style={{ color: "#a3a3a3", fontSize: 12 }} numberOfLines={1}>{row.teamName}</Text> },
  { key: "totalRuns", header: "Runs", width: 80, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCompactNumber(row.totalRuns)}</Text> },
  { key: "successRate", header: "Success", width: 80, align: "right", render: (row) => <Text style={{ color: row.successRate >= 0.8 ? "#22c55e" : row.successRate >= 0.6 ? "#f59e0b" : "#ef4444", fontSize: 12 }}>{formatPercent(row.successRate * 100)}</Text> },
  { key: "totalCostUsd", header: "Cost", width: 90, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCurrency(row.totalCostUsd)}</Text> },
  { key: "avgCostPerRunUsd", header: "Avg/Run", width: 80, align: "right", render: (row) => <Text style={{ color: "#a3a3a3", fontSize: 12 }}>{formatCurrency(row.avgCostPerRunUsd)}</Text> },
  { key: "agentCount", header: "Agents", width: 70, align: "right", render: (row) => <Text style={{ color: "#a3a3a3", fontSize: 12 }}>{row.agentCount}</Text> },
];

export default function ProjectsScreen() {
  const { data, loading, error, refetch } = useProjectsDashboard();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const subtitle = data
    ? `${formatCurrency(data.totalCostUsd)} total, ${data.activeProjects} active of ${data.totalProjects} projects`
    : "Performance metrics across all projects";

  return (
    <ScreenWrapper
      headerProps={{
        title: "Projects",
        subtitle,
        isLoading: loading,
      }}
    >
      <FilterBar />

      <View style={styles.section}>
        <SectionHeader title="Summary" />
        {loading ? (
          <CardGrid columns={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="kpi" />
            ))}
          </CardGrid>
        ) : data ? (
          <>
            <CardGrid columns={4}>
              <KpiCard title="Active Projects" value={formatCompactNumber(data.activeProjects)} caption={`of ${data.totalProjects} total`} />
              <KpiCard title="Total Runs" value={formatCompactNumber(data.totalRuns)} />
              <KpiCard title="Success Rate" value={formatPercent(data.overallSuccessRate * 100)} />
              <KpiCard title="Total Cost" value={formatCurrency(data.totalCostUsd)} />
            </CardGrid>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartRow}
            >
              <ChartCard title="Runs Over Time">
                <TrendChart data={data.runsTrend} variant="area" height={180} />
              </ChartCard>
              <ChartCard title="Success Rate Trend">
                <TrendChart data={data.successRateTrend} variant="line" color="#22c55e" height={180} />
              </ChartCard>
            </ScrollView>
          </>
        ) : null}
      </View>

      {data && (
        <View style={styles.section}>
          <SectionHeader title="Project Breakdown" subtitle={`${data.activeProjects} projects with activity`} />
          <DataTable
            columns={projectCols}
            data={data.projectBreakdown}
            keyExtractor={(row) => row.projectId}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[3] },
  chartRow: { flexDirection: "row", gap: spacing[4] },
});
