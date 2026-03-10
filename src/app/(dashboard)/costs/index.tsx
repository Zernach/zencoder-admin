import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
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

const SKELETON_2 = Array.from({ length: 2 });

const COST_BREAKDOWN_SEARCH_KEYS: (keyof CostBreakdownRow)[] = ["key"];

/** Memoized donut chart data derivation — avoids .slice().map() on every render */
const CostDonutMemo = React.memo(function CostDonutMemo({
  costBreakdown,
  totalCostUsd,
  height,
}: {
  costBreakdown: CostBreakdownRow[];
  totalCostUsd: number;
  height?: number;
}) {
  const { t } = useTranslation();
  const donutData = useMemo(
    () => costBreakdown.slice(0, 6).map(r => ({ key: r.key, value: r.totalCostUsd })),
    [costBreakdown],
  );
  const centerValue = useMemo(() => formatCurrency(totalCostUsd), [totalCostUsd]);
  return <DonutChart data={donutData} centerLabel={t("common.total")} centerValue={centerValue} height={height} />;
});

/** Memoized budget forecast bar chart */
const BudgetForecastBarMemo = React.memo(function BudgetForecastBarMemo({
  budget,
}: {
  budget: BudgetSummary;
}) {
  const { t } = useTranslation();
  const chartData = useMemo<BreakdownChartDatum[]>(() => {
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
  }, [budget, t]);
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
  const { t } = useTranslation();
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop" || bp === "tablet";
  const { data, loading, error, refetch } = useCostDashboard();
  const refFor = useSectionRef();
  const filteredCostBreakdown = useSearchFilter(data?.costBreakdown ?? [], COST_BREAKDOWN_SEARCH_KEYS);

  const subtitle = useMemo(() => data
    ? t("costs.subtitleWithData", { totalCost: formatCurrency(data.totalCostUsd), projectCount: data.costBreakdown.length })
    : t("costs.subtitle"),
    [data, t],
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
      <View ref={refFor("cost-summary")} nativeID="cost-summary" style={styles.section}>
        <SectionHeader title={t("costs.costSummary")} />
        {loading ? (
          <CardGrid columns={2}>
            {SKELETON_2.map((_, i) => (
              <LoadingSkeleton key={i} variant="kpi" />
            ))}
          </CardGrid>
        ) : data ? (
          <>
            <ChartCard title={t("costs.budgetForecast")}>
              <BudgetForecastBarMemo budget={data.budget} />
            </ChartCard>

            <CustomList scrollViewProps={responsiveScrollProps}>
              <ChartCard title={t("costs.costPerProject")} style={isLargeLayout ? styles.chartCardFill : styles.chartCardScroll}>
                <CostDonutMemo costBreakdown={data.costBreakdown} totalCostUsd={data.totalCostUsd} height={isLargeLayout ? 220 : 160} />
              </ChartCard>
              <ChartCard title={t("costs.costPerDay")} style={isLargeLayout ? styles.chartCardFill : undefined}>
                <LineChart data={data.costTrend} />
              </ChartCard>
            </CustomList>

            <CardGrid columns={2}>
              <KpiCard title={t("costs.avgPerRun")} value={formatCurrency(data.averageCostPerRunUsd)} />
              <KpiCard title={t("costs.costPerSuccess")} value={formatCurrency(data.costPerSuccessfulRunUsd)} />
            </CardGrid>

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
          </>
        ) : null}
      </View>

      {data && (
        <View ref={refFor("costs-project-breakdown")} nativeID="costs-project-breakdown" style={styles.section}>
          <SectionHeader title={t("costs.projectBreakdown")} />
          <ProjectBreakdownMemo filteredCostBreakdown={filteredCostBreakdown} />
        </View>
      )}
    </ScreenWrapper>
  );
}

