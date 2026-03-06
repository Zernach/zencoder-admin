import React from "react";
import { View, ScrollView } from "react-native";
import { useCostDashboard } from "@/features/analytics/hooks/useCostDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart, BreakdownChart, DonutChart, ProviderCostChart } from "@/components/charts";
import { chartColors } from "@/components/tables";
import { formatCurrency, formatPercent } from "@/features/analytics/utils/formatters";
import type { CostBreakdownRow } from "@/features/analytics/types";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { useThemeMode } from "@/providers/ThemeProvider";

const styles = sectionStyles;

const COST_BREAKDOWN_SEARCH_KEYS: (keyof CostBreakdownRow)[] = ["key"];

export default function CostAnalyticsScreen() {
  const { mode } = useThemeMode();
  const cc = chartColors(mode);
  const { data, loading, error, refetch } = useCostDashboard();
  const filteredCostBreakdown = useSearchFilter(data?.costBreakdown ?? [], COST_BREAKDOWN_SEARCH_KEYS);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const subtitle = data
    ? `${formatCurrency(data.totalCostUsd)} spent across ${data.costBreakdown.length} projects`
    : "Spending trends and budget tracking";

  return (
    <ScreenWrapper
      headerProps={{
        title: "Cost Analytics",
        subtitle,
        isLoading: loading,
      }}
    >
      <View nativeID="cost-summary" style={styles.section}>
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartRow}
            >
              <ChartCard title="Cost per Day">
                <TrendChart data={data.costTrend} variant="area" color={cc.success} />
              </ChartCard>
              <ChartCard title="Cost per Project">
                <DonutChart
                  data={data.costBreakdown.slice(0, 6).map(r => ({ key: r.key, value: r.totalCostUsd }))}
                  centerLabel="Total"
                  centerValue={formatCurrency(data.totalCostUsd)}
                />
              </ChartCard>
            </ScrollView>
          </>
        ) : null}
      </View>

      {data && (
        <View nativeID="cost-by-provider" style={styles.section}>
          <SectionHeader title="Cost by Provider" />
          <ChartCard
            title="Provider Cost Breakdown"
            subtitle="Cost share, run volume, and efficiency by provider"
          >
            <ProviderCostChart
              data={data.providerBreakdown}
              totalCostUsd={data.totalCostUsd}
            />
          </ChartCard>
        </View>
      )}

      {data && (
        <View nativeID="budget-forecast" style={styles.section}>
          <SectionHeader title="Budget Forecast" />
          <CardGrid columns={3}>
            <KpiCard title="Budget" value={formatCurrency(data.budget.budgetUsd)} />
            <KpiCard title="Spent" value={formatCurrency(data.budget.spentUsd)} caption={formatPercent((data.budget.spentUsd / data.budget.budgetUsd) * 100) + " used"} />
            <KpiCard title="Forecast" value={formatCurrency(data.budget.forecastMonthEndUsd)} caption="Month-end projection" />
          </CardGrid>
        </View>
      )}

      {data && (
        <View nativeID="project-breakdown" style={styles.section}>
          <SectionHeader title="Project Breakdown" />
          <BreakdownChart data={filteredCostBreakdown.slice(0, 10).map(r => ({ key: r.key, value: r.totalCostUsd }))} variant="horizontal-bar" height={300} truncateLabels={false} />
        </View>
      )}
    </ScreenWrapper>
  );
}
