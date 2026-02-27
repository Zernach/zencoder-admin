import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useCostDashboard } from "@/features/analytics/hooks/useCostDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart, BreakdownChart, DonutChart } from "@/components/charts";
import { formatCurrency, formatPercent } from "@/features/analytics/utils/formatters";

export default function CostAnalyticsScreen() {
  const { data, loading, error, refetch } = useCostDashboard();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cost Analytics</Text>
      <Text style={styles.subtitle}>Spending trends and budget tracking</Text>

      <SectionHeader title="Cost Summary" />
      {loading ? (
        <CardGrid columns={4}>
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="kpi" />
          ))}
        </CardGrid>
      ) : data ? (
        <>
          <CardGrid columns={4}>
            <KpiCard title="Total Cost" value={formatCurrency(data.totalCostUsd)} />
            <KpiCard title="Avg / Run" value={formatCurrency(data.averageCostPerRunUsd)} />
            <KpiCard title="Cost / Success" value={formatCurrency(data.costPerSuccessfulRunUsd)} />
            <KpiCard title="Budget Remaining" value={formatCurrency(data.budget.remainingUsd)} caption={`of ${formatCurrency(data.budget.budgetUsd)}`} />
          </CardGrid>

          <View style={styles.chartRow}>
            <ChartCard title="Daily Cost Trend">
              <TrendChart data={data.costTrend} variant="area" color="#22c55e" />
            </ChartCard>
            <ChartCard title="Cost by Project">
              <DonutChart
                data={data.costBreakdown.slice(0, 6).map(r => ({ key: r.key, value: r.totalCostUsd }))}
                centerLabel="Total"
                centerValue={formatCurrency(data.totalCostUsd)}
              />
            </ChartCard>
          </View>

          <SectionHeader title="Budget Forecast" />
          <CardGrid columns={3}>
            <KpiCard title="Budget" value={formatCurrency(data.budget.budgetUsd)} />
            <KpiCard title="Spent" value={formatCurrency(data.budget.spentUsd)} caption={formatPercent((data.budget.spentUsd / data.budget.budgetUsd) * 100) + " used"} />
            <KpiCard title="Forecast" value={formatCurrency(data.budget.forecastMonthEndUsd)} caption="Month-end projection" />
          </CardGrid>

          <SectionHeader title="Project Breakdown" />
          <BreakdownChart data={data.costBreakdown.slice(0, 10).map(r => ({ key: r.key, value: r.totalCostUsd }))} variant="horizontal-bar" height={300} />
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
