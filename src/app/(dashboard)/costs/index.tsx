import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useCostDashboard } from "@/features/analytics/hooks/useCostDashboard";
import { CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, LineChart, BarChart, DonutChart, ProviderCostChart, ProviderTokenCostBarChart, type BarChartBreakdownDatum } from "@/components/charts";
import { CustomList } from "@/components/lists";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import type { CostBreakdownRow, BudgetSummary, CostPerTeamRow } from "@/features/analytics/types";
import { formatPercent } from "@/features/analytics/utils/formatters";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const styles = sectionStyles;

const SKELETON_2 = Array.from({ length: 2 });

const COST_BREAKDOWN_SEARCH_KEYS: (keyof CostBreakdownRow)[] = ["key"];

/** Memoized donut chart data derivation — avoids .slice().map() on every render */
const CostPerTeamDonutMemo = React.memo(function CostPerTeamDonutMemo({
  costPerTeam,
  totalCostUsd,
  height,
}: {
  costPerTeam: CostPerTeamRow[];
  totalCostUsd: number;
  height?: number;
}) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const donutData = useMemo(
    () => costPerTeam.slice(0, 6).map((row) => ({ key: row.teamName, value: row.totalCostUsd })),
    [costPerTeam],
  );
  const centerValue = useMemo(() => formatCurrency(totalCostUsd), [totalCostUsd, formatCurrency]);
  return <DonutChart data={donutData} centerLabel={t("common.total")} centerValue={centerValue} height={height} formatValue={formatCurrency} />;
});

/** Memoized budget forecast bar chart */
const BudgetForecastBarMemo = React.memo(function BudgetForecastBarMemo({
  budget,
}: {
  budget: BudgetSummary;
}) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const chartData = useMemo<BarChartBreakdownDatum[]>(() => {
    const remaining = budget.budgetUsd - budget.spentUsd;
    const utilization = budget.budgetUsd > 0 ? (budget.spentUsd / budget.budgetUsd) * 100 : 0;
    return [
      {
        key: "Budget", value: budget.budgetUsd,
        hoverRows: [
          { label: t("costs.budget.monthlyBudget"), value: formatCurrency(budget.budgetUsd) },
          { label: t("costs.budget.remaining"), value: formatCurrency(remaining) },
          { label: t("costs.budget.utilization"), value: `${utilization.toFixed(1)}%` },
        ],
      },
      {
        key: "Spent", value: budget.spentUsd,
        hoverRows: [
          { label: t("costs.budget.amountSpent"), value: formatCurrency(budget.spentUsd) },
          { label: t("costs.budget.ofBudget"), value: `${utilization.toFixed(1)}%` },
          { label: t("costs.budget.remaining"), value: formatCurrency(remaining) },
        ],
      },
      {
        key: "Forecast", value: budget.forecastMonthEndUsd,
        hoverRows: [
          { label: t("costs.budget.monthEndForecast"), value: formatCurrency(budget.forecastMonthEndUsd) },
          { label: t("costs.budget.overUnderBudget"), value: formatCurrency(budget.forecastMonthEndUsd - budget.budgetUsd) },
        ],
      },
    ];
  }, [budget, t, formatCurrency]);
  return <BarChart data={chartData} variant="horizontal-bar" formatValue={formatCurrency} />;
});

/** Memoized breakdown chart — avoids .slice().map() on every render */
const CostPerProjectBarMemo = React.memo(function CostPerProjectBarMemo({
  filteredCostBreakdown,
}: {
  filteredCostBreakdown: CostBreakdownRow[];
}) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const chartData = useMemo<BarChartBreakdownDatum[]>(
    () =>
      filteredCostBreakdown.slice(0, 10).map((row) => ({
        key: row.key,
        value: row.totalCostUsd,
        hoverRows: [
          { label: t("common.projects"), value: row.key },
          { label: t("common.cost"), value: formatCurrency(row.totalCostUsd) },
          { label: t("common.runs"), value: row.runsStarted.toLocaleString("en-US") },
          { label: t("costs.avgPerRun"), value: formatCurrency(row.averageCostPerRunUsd) },
          { label: "Share", value: formatPercent(row.percentOfTotal * 100) },
        ],
      })),
    [filteredCostBreakdown, formatCurrency, t],
  );
  return <BarChart data={chartData} variant="horizontal-bar" truncateLabels={false} formatValue={formatCurrency} />;
});

export default function CostAnalyticsScreen() {
  const { t } = useTranslation();
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop" || bp === "tablet";
  const { data, loading, error, refetch } = useCostDashboard();
  const { formatCurrency } = useCurrencyFormatter();
  const refFor = useSectionRef();
  const filteredCostBreakdown = useSearchFilter(data?.costBreakdown ?? [], COST_BREAKDOWN_SEARCH_KEYS);

  const subtitle = useMemo(() => data
    ? t("costs.subtitleWithData", { totalCost: formatCurrency(data.totalCostUsd), projectCount: data.costBreakdown.length })
    : t("costs.subtitle"),
    [data, t, formatCurrency],
  );

  const headerProps = useMemo(
    () => ({ title: t("navigation.costs"), subtitle, isLoading: loading }),
    [subtitle, loading, t],
  );

  const responsiveScrollProps = useMemo(() => ({
    horizontal: !isLargeLayout,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: [styles.chartRow, isLargeLayout && styles.chartRowFill],
  }), [isLargeLayout]);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <ScreenWrapper headerProps={headerProps}>
      <View ref={refFor("budget-forecast")} nativeID="budget-forecast" style={styles.section}>
        {loading ? (
          <CardGrid columns={2}>
            {SKELETON_2.map((_, i) => (
              <LoadingSkeleton key={i} variant="kpi" />
            ))}
          </CardGrid>
        ) : data ? (
          <CustomList scrollViewProps={responsiveScrollProps}>
            <ChartCard title={t("costs.budgetForecast")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <BudgetForecastBarMemo budget={data.budget} />
            </ChartCard>
            <ChartCard title={t("costs.costPerDay")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <LineChart data={data.costTrend} />
            </ChartCard>
          </CustomList>
        ) : null}
      </View>

      {data && (
        <View ref={refFor("cost-summary")} nativeID="cost-summary" style={styles.section}>
          <CustomList scrollViewProps={responsiveScrollProps}>
            <ChartCard title={t("costs.costPerTeam")} style={isLargeLayout ? styles.chartCardFill : styles.chartCardScroll}>
              <CostPerTeamDonutMemo costPerTeam={data.costPerTeam} totalCostUsd={data.totalCostUsd} height={isLargeLayout ? 220 : 160} />
            </ChartCard>
            <ChartCard title={t("costs.costPerProject")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <CostPerProjectBarMemo filteredCostBreakdown={filteredCostBreakdown} />
            </ChartCard>
          </CustomList>

          <CardGrid columns={2}>
            <KpiCard title={t("costs.avgPerRun")} value={formatCurrency(data.averageCostPerRunUsd)} />
            <KpiCard title={t("costs.costPerSuccess")} value={formatCurrency(data.costPerSuccessfulRunUsd)} />
          </CardGrid>
        </View>
      )}

      {data && (
        <View ref={refFor("cost-by-provider")} nativeID="cost-by-provider" style={styles.section}>
          <CustomList scrollViewProps={responsiveScrollProps}>
            <ChartCard title={t("costs.costPerToken")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <ProviderTokenCostBarChart data={data.providerBreakdown} />
            </ChartCard>
            <ChartCard title={t("costs.costPerProvider")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <ProviderCostChart
                data={data.providerBreakdown}
                totalCostUsd={data.totalCostUsd}
              />
            </ChartCard>
          </CustomList>
        </View>
      )}

    </ScreenWrapper>
  );
}
