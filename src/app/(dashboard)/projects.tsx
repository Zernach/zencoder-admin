import React from "react";
import { View, StyleSheet } from "react-native";
import { useProjectsDashboard } from "@/features/analytics/hooks/useProjectsDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart, BreakdownChart } from "@/components/charts";
import { formatCurrency } from "@/features/analytics/utils/formatters";
import { ScreenWrapper } from "@/components/screen";
import { FilterBar } from "@/components/filters";

export default function ProjectsScreen() {
  const { data, loading, error, refetch } = useProjectsDashboard();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const subtitle = data
    ? `${formatCurrency(data.totalCostUsd)} total, ${data.costBreakdown.length} active projects`
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  chartRow: { flexDirection: "row", gap: 16 },
});
