import React, { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useOverviewDashboard } from "@/features/analytics/hooks/useOverviewDashboard";
import { useLiveAgentSessions } from "@/features/analytics/hooks/useLiveAgentSessions";
import {
  SectionHeader,
  CardGrid,
  KpiCard,
  LoadingSkeleton,
  ErrorState,
  LiveAssistantsSection,
} from "@/components/dashboard";
import { ChartCard, LineChart } from "@/components/charts";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { CustomList } from "@/components/lists";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import type { LiveAgentSession } from "@/features/analytics/types";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { buildEntityRoute, TABS } from "@/constants/routes";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { useSectionRef } from "@/hooks/useRegisterSection";

const styles = sectionStyles;

const SESSION_SEARCH_KEYS: (keyof LiveAgentSession)[] = ["agentName", "projectName", "userName", "currentTask"];

const SKELETON_4 = Array.from({ length: 4 });
const SKELETON_3 = Array.from({ length: 3 });

export default function OverviewDashboardScreen() {
  const { t } = useTranslation();
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop" || bp === "tablet";
  const { width: viewportWidth } = useWindowDimensions();
  const { data, loading, error, refetch } = useOverviewDashboard();
  const {
    data: liveSessions,
    loading: liveLoading,
    error: liveError,
    refetch: refetchLiveSessions,
  } = useLiveAgentSessions();
  const filteredSessions = useSearchFilter(liveSessions, SESSION_SEARCH_KEYS);
  const router = useRouter();
  const { formatCurrency } = useCurrencyFormatter();
  const refFor = useSectionRef();

  const handleKpiPress = useCallback(
    (route: string) => {
      router.push(route as never);
    },
    [router],
  );

  const handleLiveCardPress = useCallback(
    (agentId: string) => {
      router.push(buildEntityRoute(TABS.DASHBOARD, "agent", agentId) as never);
    },
    [router],
  );

  // Cache per-route KPI press handlers to avoid inline closure recreation in .map()
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

  const headerProps = useMemo(
    () => ({ title: t("dashboard.title"), subtitle: t("dashboard.subtitle"), isLoading: loading }),
    [loading, t],
  );

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
  }, [bp, isLargeLayout, viewportWidth]);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <ScreenWrapper headerProps={headerProps}>
      <View ref={refFor("live-assistants")} nativeID="live-assistants">
        <LiveAssistantsSection
          sessions={filteredSessions}
          loading={liveLoading}
          error={liveError}
          onRetry={refetchLiveSessions}
          onCardPress={handleLiveCardPress}
        />
      </View>

      {/* Section 1 -- Trends */}
      <View ref={refFor("trends")} nativeID="trends" style={styles.section}>
        <SectionHeader title={t("dashboard.trends")} />
        <CustomList scrollViewProps={trendScrollProps}>
          <ChartCard title={t("dashboard.runsOverTime")} loading={loading} style={trendCardStyle}>
            {data && (
              <LineChart
                data={data.runsTrend}
                variant="line"
                height={200}
              />
            )}
          </ChartCard>
          <ChartCard title={t("dashboard.costPerDay")} loading={loading} style={trendCardStyle}>
            {data && (
              <LineChart
                data={data.costTrend}
                height={200}
              />
            )}
          </ChartCard>
        </CustomList>
      </View>

      {/* Section 3 -- Outcomes */}
      {data && data.outcomesKpis.length > 0 && (
        <View ref={refFor("outcomes")} nativeID="outcomes" style={styles.section}>
          <SectionHeader title={t("dashboard.outcomes")} subtitle={t("dashboard.outcomesSubtitle")} />
          <CardGrid columns={3}>
            {data.outcomesKpis.map((kpi) => (
              <KpiCard
                key={kpi.title}
                title={kpi.title}
                value={kpi.value}
                caption={kpi.caption}
              />
            ))}
          </CardGrid>
          {data.outcomesTrend && data.outcomesTrend.length > 0 && (
            <ChartCard title={t("dashboard.automatedMergeRequestsPerDay")}>
              <LineChart data={data.outcomesTrend} height={180} variant="line" />
            </ChartCard>
          )}
        </View>
      )}

      {/* Section 4 -- Anomalies */}
      {data && data.anomalies.length > 0 && (
        <View ref={refFor("key-metrics")} nativeID="key-metrics" style={styles.section}>
          <SectionHeader title={t("dashboard.keyMetrics")} subtitle={t("dashboard.keyMetricsSubtitle")} />
          {loading ? (
            <CardGrid columns={4}>
              {SKELETON_4.map((_, i) => (
                <LoadingSkeleton key={i} variant="kpi" />
              ))}
            </CardGrid>
          ) : data ? (
            <CardGrid columns={3}>
              {data.adoptionKpis.map((kpi) => (
                <KpiCard
                  key={kpi.title}
                  title={kpi.title}
                  value={kpi.value}
                  delta={kpi.delta}
                  deltaPolarity={kpi.deltaPolarity}
                  caption={kpi.caption}
                  onPress={
                    kpi.route
                      ? getKpiPressHandler(kpi.route)
                      : undefined
                  }
                />
              ))}
            </CardGrid>
          ) : null}
          <CardGrid columns={3}>
            {data.anomalies.map((a) => (
              <KpiCard
                key={a.runId}
                title={a.type.replace(/_/g, " ")}
                value={a.type === "highest_cost" ? formatCurrency(a.value) : a.label}
                caption={t("dashboard.run")}
                captionLink={{
                  text: a.runId,
                  onPress: () => router.push(`/dashboard/run/${a.runId}` as never),
                }}
              />
            ))}
          </CardGrid>
        </View>
      )}
    </ScreenWrapper>
  );
}
