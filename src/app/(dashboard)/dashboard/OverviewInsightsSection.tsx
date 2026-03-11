import React, { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useOverviewDashboard } from "@/features/analytics/hooks/useOverviewDashboard";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { ChartCard, LineChart } from "@/components/charts";
import { CustomList } from "@/components/lists";
import {
  CardGrid,
  ErrorState,
  KpiCard,
  LoadingSkeleton,
  SectionHeader,
} from "@/components/dashboard";
import { sectionStyles } from "@/components/screen";
import type { TimeSeriesPoint, RunAnomaly } from "@/features/analytics/types";
import type { KpiCardData } from "@/features/analytics/mappers/overviewMappers";

const styles = sectionStyles;
const SKELETON_4 = Array.from({ length: 4 });

/**
 * Isolated trends section — owns useWindowDimensions so pixel-level resize
 * events only re-render the two trend charts, not the KPI/anomaly cards below.
 */
const OverviewTrendsSection = React.memo(function OverviewTrendsSection({
  runsTrend,
  costTrend,
  loading,
}: {
  runsTrend: TimeSeriesPoint[] | undefined;
  costTrend: TimeSeriesPoint[] | undefined;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop" || bp === "tablet";
  const { width: viewportWidth } = useWindowDimensions();
  const refFor = useSectionRef();

  const trendScrollProps = useMemo(() => ({
    horizontal: !isLargeLayout,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: [styles.chartRow, isLargeLayout && styles.chartRowFill],
  }), [isLargeLayout]);

  const trendCardStyle = useMemo(() => {
    if (isLargeLayout) return styles.chartCardFill;
    return [
      styles.chartCardViewport,
      { width: Math.max(280, viewportWidth - 12 * 2) },
    ];
  }, [isLargeLayout, viewportWidth]);

  return (
    <View ref={refFor("trends")} nativeID="trends" style={styles.section}>
      <SectionHeader title={t("dashboard.trends")} />
      <CustomList scrollViewProps={trendScrollProps}>
        <ChartCard title={t("dashboard.runsOverTime")} loading={loading} style={trendCardStyle}>
          {runsTrend ? (
            <LineChart data={runsTrend} variant="line" height={200} />
          ) : null}
        </ChartCard>
        <ChartCard title={t("dashboard.costPerDay")} loading={loading} style={trendCardStyle}>
          {costTrend ? (
            <LineChart data={costTrend} height={200} />
          ) : null}
        </ChartCard>
      </CustomList>
    </View>
  );
});

/** Outcomes section — isolated so trend resizes don't re-render outcome KPI cards. */
const OverviewOutcomesSection = React.memo(function OverviewOutcomesSection({
  outcomesKpis,
  outcomesTrend,
}: {
  outcomesKpis: KpiCardData[];
  outcomesTrend: TimeSeriesPoint[] | undefined;
}) {
  const { t } = useTranslation();
  const refFor = useSectionRef();

  if (outcomesKpis.length === 0) return null;

  return (
    <View ref={refFor("outcomes")} nativeID="outcomes" style={styles.section}>
      <SectionHeader title={t("dashboard.outcomes")} subtitle={t("dashboard.outcomesSubtitle")} />
      <CardGrid columns={3}>
        {outcomesKpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            caption={kpi.caption}
          />
        ))}
      </CardGrid>
      {outcomesTrend && outcomesTrend.length > 0 ? (
        <ChartCard title={t("dashboard.automatedMergeRequestsPerDay")}>
          <LineChart data={outcomesTrend} height={180} variant="line" />
        </ChartCard>
      ) : null}
    </View>
  );
});

/** Key-metrics + anomalies section — isolated from trend resize churn. */
const OverviewKeyMetricsSection = React.memo(function OverviewKeyMetricsSection({
  adoptionKpis,
  anomalies,
  loading,
}: {
  adoptionKpis: KpiCardData[];
  anomalies: RunAnomaly[];
  loading: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatCurrency } = useCurrencyFormatter();
  const refFor = useSectionRef();

  const handleKpiPress = useCallback(
    (route: string) => { router.push(route as never); },
    [router],
  );
  const handleRunPress = useCallback(
    (runId: string) => { router.push(`/dashboard/run/${runId}` as never); },
    [router],
  );

  const kpiPressCache = useRef(new Map<string, () => void>()).current;
  const handleKpiPressRef = useRef(handleKpiPress);
  handleKpiPressRef.current = handleKpiPress;
  const getKpiPressHandler = useCallback((route: string) => {
    let handler = kpiPressCache.get(route);
    if (!handler) {
      handler = () => handleKpiPressRef.current(route);
      kpiPressCache.set(route, handler);
    }
    return handler;
  }, [kpiPressCache]);

  const runPressCache = useRef(new Map<string, () => void>()).current;
  const handleRunPressRef = useRef(handleRunPress);
  handleRunPressRef.current = handleRunPress;
  const getRunPressHandler = useCallback((runId: string) => {
    let handler = runPressCache.get(runId);
    if (!handler) {
      handler = () => handleRunPressRef.current(runId);
      runPressCache.set(runId, handler);
    }
    return handler;
  }, [runPressCache]);

  if (anomalies.length === 0) return null;

  return (
    <View ref={refFor("key-metrics")} nativeID="key-metrics" style={styles.section}>
      <SectionHeader title={t("dashboard.keyMetrics")} subtitle={t("dashboard.keyMetricsSubtitle")} />
      {loading ? (
        <CardGrid columns={4}>
          {SKELETON_4.map((_, i) => (
            <LoadingSkeleton key={i} variant="kpi" />
          ))}
        </CardGrid>
      ) : (
        <CardGrid columns={3}>
          {adoptionKpis.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              delta={kpi.delta}
              deltaPolarity={kpi.deltaPolarity}
              caption={kpi.caption}
              onPress={kpi.route ? getKpiPressHandler(kpi.route) : undefined}
            />
          ))}
        </CardGrid>
      )}
      <CardGrid columns={3}>
        {anomalies.map((a) => (
          <KpiCard
            key={a.runId}
            title={a.type.replace(/_/g, " ")}
            value={a.type === "highest_cost" ? formatCurrency(a.value) : a.label}
            caption={t("dashboard.run")}
            captionLink={{
              text: a.runId,
              onPress: getRunPressHandler(a.runId),
            }}
          />
        ))}
      </CardGrid>
    </View>
  );
});

export const OverviewInsightsSection = React.memo(function OverviewInsightsSection() {
  const { data, loading, error, refetch } = useOverviewDashboard();
  const refFor = useSectionRef();

  if (error) {
    return (
      <View ref={refFor("trends")} nativeID="trends">
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <>
      <OverviewTrendsSection
        runsTrend={data?.runsTrend}
        costTrend={data?.costTrend}
        loading={loading}
      />
      {data ? (
        <OverviewOutcomesSection
          outcomesKpis={data.outcomesKpis}
          outcomesTrend={data.outcomesTrend}
        />
      ) : null}
      {data ? (
        <OverviewKeyMetricsSection
          adoptionKpis={data.adoptionKpis}
          anomalies={data.anomalies}
          loading={loading}
        />
      ) : null}
    </>
  );
});
