import React, { useMemo } from "react";
import { View } from "react-native";
import { useCostDashboard } from "@/features/analytics/hooks/useCostDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, LineChart, BreakdownChart, DonutChart, ProviderCostChart, ProviderTokenCostBarChart } from "@/components/charts";
import type { BreakdownChartDatum } from "@/components/charts/BreakdownChart";
import { CustomList } from "@/components/lists";
import { formatCurrency } from "@/features/analytics/utils/formatters";
import type { CostBreakdownRow, BudgetSummary } from "@/features/analytics/types";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const styles = sectionStyles;

const SKELETON_4 = Array.from({ length: 4 });

const COST_BREAKDOWN_SEARCH_KEYS: (keyof CostBreakdownRow)[] = ["key"];

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

/** Memoized budget forecast bar chart */
const BudgetForecastBarMemo = React.memo(function BudgetForecastBarMemo({
  budget,
}: {
  budget: BudgetSummary;
}) {
  const chartData = useMemo<BreakdownChartDatum[]>(() => {
    const remaining = budget.budgetUsd - budget.spentUsd;
    const utilization = budget.budgetUsd > 0 ? (budget.spentUsd / budget.budgetUsd) * 100 : 0;
    return [
      {
        key: "Budget", value: budget.budgetUsd,
        hoverRows: [
          { label: "Monthly Budget", value: formatCurrency(budget.budgetUsd) },
          { label: "Remaining", value: formatCurrency(remaining) },
          { label: "Utilization", value: `${utilization.toFixed(1)}%` },
        ],
      },
      {
        key: "Spent", value: budget.spentUsd,
        hoverRows: [
          { label: "Amount Spent", value: formatCurrency(budget.spentUsd) },
          { label: "Of Budget", value: `${utilization.toFixed(1)}%` },
          { label: "Remaining", value: formatCurrency(remaining) },
        ],
      },
      {
        key: "Forecast", value: budget.forecastMonthEndUsd,
        hoverRows: [
          { label: "Month-End Forecast", value: formatCurrency(budget.forecastMonthEndUsd) },
          { label: "Over/Under Budget", value: formatCurrency(budget.forecastMonthEndUsd - budget.budgetUsd) },
        ],
      },
    ];
  }, [budget]);
  return <BreakdownChart data={chartData} variant="horizontal-bar" formatValue={formatCurrency} />;
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
              <ChartCard title="Cost per Project" style={isLargeLayout ? styles.chartCardFill : undefined}>
                <CostDonutMemo costBreakdown={data.costBreakdown} totalCostUsd={data.totalCostUsd} />
              </ChartCard>
              <ChartCard title="Cost per Day" style={isLargeLayout ? styles.chartCardFill : undefined}>
                <LineChart data={data.costTrend} />
              </ChartCard>
            </CustomList>

            <CustomList scrollViewProps={responsiveScrollProps}>
              <ChartCard title="Cost per Token" style={isLargeLayout ? styles.chartCardFill : undefined}>
                <ProviderTokenCostBarChart data={data.providerBreakdown} />
              </ChartCard>
              <ChartCard title="Cost per Provider" style={isLargeLayout ? styles.chartCardFill : undefined}>
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
          <ChartCard title="Budget vs Spent vs Forecast">
            <BudgetForecastBarMemo budget={data.budget} />
          </ChartCard>
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

