import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useProjectsDashboard } from "@/features/analytics/hooks/useProjectsDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart, BreakdownChart } from "@/components/charts";
import { formatCurrency, formatCompactNumber } from "@/features/analytics/utils/formatters";

export default function ProjectsScreen() {
  const { data, loading, error, refetch } = useProjectsDashboard();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects</Text>
      <Text style={styles.subtitle}>Performance metrics across all projects</Text>

      <SectionHeader title="Cost Overview" />
      {loading ? (
        <CardGrid columns={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="kpi" />
          ))}
        </CardGrid>
      ) : data ? (
        <>
          <CardGrid columns={3}>
            <KpiCard title="Total Cost" value={formatCurrency(data.totalCostUsd)} />
            <KpiCard title="Avg Cost / Run" value={formatCurrency(data.averageCostPerRunUsd)} />
            <KpiCard title="Cost / Success" value={formatCurrency(data.costPerSuccessfulRunUsd)} />
          </CardGrid>
          <View style={styles.chartRow}>
            <ChartCard title="Cost Trend">
              <TrendChart data={data.costTrend} variant="area" color="#22c55e" />
            </ChartCard>
            <ChartCard title="Cost by Project">
              <BreakdownChart data={data.costBreakdown.slice(0, 8).map(r => ({ key: r.key, value: r.totalCostUsd }))} variant="horizontal-bar" />
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
