import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAgentsDashboard } from "@/features/analytics/hooks/useAgentsDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart, BreakdownChart } from "@/components/charts";
import { formatPercent, formatDuration, formatCompactNumber } from "@/features/analytics/utils/formatters";

export default function AgentsScreen() {
  const { data, loading, error, refetch } = useAgentsDashboard();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agents</Text>
      <Text style={styles.subtitle}>Agent reliability and performance</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#e5e5e5", letterSpacing: -0.2 },
  subtitle: { fontSize: 14, color: "#a3a3a3", marginTop: -16 },
  chartRow: { flexDirection: "row", gap: 16 },
});
