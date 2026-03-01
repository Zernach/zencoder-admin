import React from "react";
import { View, StyleSheet } from "react-native";
import { useAgentsDashboard } from "@/features/analytics/hooks/useAgentsDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart, BreakdownChart } from "@/components/charts";
import { formatPercent, formatDuration } from "@/features/analytics/utils/formatters";
import { ScreenWrapper } from "@/components/screen";
import { FilterBar } from "@/components/filters";

export default function AgentsScreen() {
  const { data, loading, error, refetch } = useAgentsDashboard();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const subtitle = data
    ? `${formatPercent(data.runSuccessRate * 100)} success rate, P50 ${formatDuration(data.p50RunDurationMs)}`
    : "Agent reliability and performance";

  return (
    <ScreenWrapper
      headerProps={{
        title: "Agents",
        subtitle,
        isLoading: loading,
      }}
    >
      <FilterBar />

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
            <KpiCard title="Success Rate" value={formatPercent(data.runSuccessRate * 100)} delta={2.1} />
            <KpiCard title="Error Rate" value={formatPercent(data.errorRate * 100)} delta={-1.5} deltaPolarity="negative-good" />
            <KpiCard title="P50 Duration" value={formatDuration(data.p50RunDurationMs)} deltaPolarity="negative-good" />
            <KpiCard title="P95 Duration" value={formatDuration(data.p95RunDurationMs)} deltaPolarity="negative-good" />
          </CardGrid>
          <View style={styles.chartRow}>
            <ChartCard title="Reliability Trend">
              <TrendChart data={data.reliabilityTrend} variant="line" color="#22c55e" />
            </ChartCard>
            <ChartCard title="Failure Categories">
              <BreakdownChart data={data.failureCategoryBreakdown} variant="horizontal-bar" />
            </ChartCard>
          </View>
        </>
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  chartRow: { flexDirection: "row", gap: 16 },
});
