import React, { useMemo } from "react";
import { View } from "react-native";
import { useCostDashboard } from "@/features/analytics/hooks/useCostDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart, BreakdownChart, DonutChart, ProviderCostChart, ProviderTokenCostBarChart } from "@/components/charts";
import { chartColors } from "@/components/tables";
import { CustomList } from "@/components/lists";
import { formatCurrency, formatPercent } from "@/features/analytics/utils/formatters";
import type { CostBreakdownRow } from "@/features/analytics/types";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { useThemeMode } from "@/providers/ThemeProvider";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const styles = sectionStyles;

const SKELETON_4 = Array.from({ length: 4 });

const COST_BREAKDOWN_SEARCH_KEYS: (keyof CostBreakdownRow)[] = ["key"];

const HORIZONTAL_SCROLL_PROPS = {
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: sectionStyles.chartRow,
} as const;

/** Memoized donut chart data derivation — avoids .slice().map() on every render */
const CostDonutMemo = React.memo(function CostDonutMemo({
  costBreakdown,
  totalCostUsd,
}: {
  costBreakdown: CostBreakdownRow[];
  totalCostUsd: number;
}) {
  const donutData = useMemo(
    () => costBreakdown.slice(0, 6).map(r => ({ key: r.key, value: r.totalCostUsd })),
    [costBreakdown],
  );
  const centerValue = useMemo(() => formatCurrency(totalCostUsd), [totalCostUsd]);
  return <DonutChart data={donutData} centerLabel="Total" centerValue={centerValue} />;
});

/** Memoized breakdown chart — avoids .slice().map() on every render */
const ProjectBreakdownMemo = React.memo(function ProjectBreakdownMemo({
  filteredCostBreakdown,
}: {
  filteredCostBreakdown: CostBreakdownRow[];
}) {
  const chartData = useMemo(
    () => filteredCostBreakdown.slice(0, 10).map(r => ({ key: r.key, value: r.totalCostUsd })),
    [filteredCostBreakdown],
  );
  return <BreakdownChart data={chartData} variant="horizontal-bar" height={300} truncateLabels={false} />;
});

export default function CostAnalyticsScreen() {
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop";
  const { mode } = useThemeMode();
  const cc = chartColors(mode);
  const { data, loading, error, refetch } = useCostDashboard();
  const refFor = useSectionRef();
  const filteredCostBreakdown = useSearchFilter(data?.costBreakdown ?? [], COST_BREAKDOWN_SEARCH_KEYS);

  const subtitle = useMemo(() => data
    ? `${formatCurrency(data.totalCostUsd)} spent across ${data.costBreakdown.length} projects`
    : "Spending trends and budget tracking",
    [data],
  );

  const headerProps = useMemo(
    () => ({ title: "Costs", subtitle, isLoading: loading }),
    [subtitle, loading],
  );

  const responsiveScrollProps = useMemo(() => ({
    horizontal: !isLargeLayout,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: [styles.chartRow, isLargeLayout && styles.chartRowFill],
  }), [isLargeLayout]);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <ScreenWrapper headerProps={headerProps}>
      <View ref={refFor("cost-summary")} nativeID="cost-summary" style={styles.section}>
        <SectionHeader title="Cost Summary" />
        {loading ? (
          <CardGrid columns={4}>
            {SKELETON_4.map((_, i) => (
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

            <CustomList scrollViewProps={responsiveScrollProps}>
              <ChartCard title="Cost per Day" style={isLargeLayout ? styles.chartCardFill : undefined}>
                <TrendChart data={data.costTrend} variant="area" color={cc.success} />
              </ChartCard>
              <ChartCard title="Cost per Project" style={isLargeLayout ? styles.chartCardFill : undefined}>
                <CostDonutMemo costBreakdown={data.costBreakdown} totalCostUsd={data.totalCostUsd} />
              </ChartCard>
            </CustomList>

            <CustomList scrollViewProps={HORIZONTAL_SCROLL_PROPS}>
              <ChartCard title="Cost per Token">
                <ProviderTokenCostBarChart data={data.providerBreakdown} />
              </ChartCard>
              <ChartCard title="Cost per Provider">
                <ProviderCostChart
                  data={data.providerBreakdown}
                  totalCostUsd={data.totalCostUsd}
                />
              </ChartCard>
            </CustomList>
          </>
        ) : null}
      </View>

      {data && (
        <View ref={refFor("budget-forecast")} nativeID="budget-forecast" style={styles.section}>
          <SectionHeader title="Budget Forecast" />
          <CardGrid columns={3}>
            <KpiCard title="Budget" value={formatCurrency(data.budget.budgetUsd)} />
            <KpiCard title="Spent" value={formatCurrency(data.budget.spentUsd)} caption={formatPercent((data.budget.spentUsd / data.budget.budgetUsd) * 100) + " used"} />
            <KpiCard title="Forecast" value={formatCurrency(data.budget.forecastMonthEndUsd)} caption="Month-end projection" />
          </CardGrid>
        </View>
      )}

      {data && (
        <View ref={refFor("costs-project-breakdown")} nativeID="costs-project-breakdown" style={styles.section}>
          <SectionHeader title="Project Breakdown" />
          <ProjectBreakdownMemo filteredCostBreakdown={filteredCostBreakdown} />
        </View>
      )}
    </ScreenWrapper>
  );
}
