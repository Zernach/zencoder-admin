import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAgentsDashboard } from "@/features/analytics/hooks/useAgentsDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart, BreakdownChart } from "@/components/charts";
import { DataTable, type ColumnDef } from "@/components/tables";
import { formatPercent, formatDuration, formatCurrency, formatCompactNumber } from "@/features/analytics/utils/formatters";
import type { AgentBreakdownRow } from "@/features/analytics/types";
import { ScreenWrapper } from "@/components/screen";
import { spacing } from "@/theme/tokens";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function interpolateColorChannel(start: number, end: number, progress: number): number {
  return Math.round(start + (end - start) * progress);
}

function getSuccessRateColor(successRate: number): string {
  const progress = clamp(successRate, 0, 1);
  const start = { r: 43, g: 9, b: 9 };
  const end = { r: 34, g: 197, b: 94 };

  const r = interpolateColorChannel(start.r, end.r, progress);
  const g = interpolateColorChannel(start.g, end.g, progress);
  const b = interpolateColorChannel(start.b, end.b, progress);

  return `rgb(${r}, ${g}, ${b})`;
}

const agentCols: ColumnDef<AgentBreakdownRow>[] = [
  { key: "agentName", header: "Agent", width: 160 },
  { key: "projectName", header: "Project", width: 160, render: (row) => <Text style={{ color: "#a3a3a3", fontSize: 12 }} numberOfLines={1}>{row.projectName}</Text> },
  { key: "totalRuns", header: "Runs", width: 80, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCompactNumber(row.totalRuns)}</Text> },
  { key: "successRate", header: "Success", width: 80, align: "right", render: (row) => <Text style={{ color: getSuccessRateColor(row.successRate), fontSize: 12 }}>{formatPercent(row.successRate * 100)}</Text> },
  { key: "avgDurationMs", header: "Avg Duration", width: 100, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatDuration(row.avgDurationMs)}</Text> },
  { key: "totalCostUsd", header: "Cost", width: 90, align: "right", render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCurrency(row.totalCostUsd)}</Text> },
];

export default function AgentsScreen() {
  const { data, loading, error, refetch } = useAgentsDashboard();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const subtitle = data
    ? `${formatPercent(data.runSuccessRate * 100)} success rate, P50 ${formatDuration(data.p50RunDurationMs)}, ${data.agentBreakdown.length} agents active`
    : "Agent reliability and performance";

  return (
    <ScreenWrapper
      headerProps={{
        title: "Agents",
        subtitle,
        isLoading: loading,
      }}
    >
      <View style={styles.section}>
        <SectionHeader title="Reliability" />
        {loading ? (
          <CardGrid columns={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="kpi" />
            ))}
          </CardGrid>
        ) : data ? (
          <>
            <CardGrid columns={4}>
              <KpiCard title="Success Rate" value={formatPercent(data.runSuccessRate * 100)} />
              <KpiCard title="Error Rate" value={formatPercent(data.errorRate * 100)} deltaPolarity="negative-good" />
              <KpiCard title="P50 Duration" value={formatDuration(data.p50RunDurationMs)} />
              <KpiCard title="P95 Duration" value={formatDuration(data.p95RunDurationMs)} />
            </CardGrid>
            <CardGrid columns={2}>
              <KpiCard title="P95 Queue Wait" value={formatDuration(data.p95QueueWaitMs)} caption="Queue wait time" />
              <KpiCard title="Peak Concurrency" value={formatCompactNumber(data.peakConcurrency)} caption="Max concurrent runs/min" />
            </CardGrid>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartRow}
            >
              <ChartCard title="Reliability Trend">
                <TrendChart data={data.reliabilityTrend} variant="line" color="#22c55e" />
              </ChartCard>
              <ChartCard title="Failure Categories">
                <BreakdownChart data={data.failureCategoryBreakdown} variant="horizontal-bar" />
              </ChartCard>
            </ScrollView>
          </>
        ) : null}
      </View>

      {data && (
        <View style={styles.section}>
          <SectionHeader title="Agent Performance" subtitle={`${data.agentBreakdown.length} agents with activity`} />
          <DataTable
            columns={agentCols}
            data={data.agentBreakdown}
            keyExtractor={(row) => row.agentId}
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
