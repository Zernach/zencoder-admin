import React, { useCallback, useMemo, useRef } from "react";
import { View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useOverviewDashboard } from "@/features/analytics/hooks/useOverviewDashboard";
import { useLiveAgentSessions } from "@/features/analytics/hooks/useLiveAgentSessions";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
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

const styles = sectionStyles;

const SESSION_SEARCH_KEYS: (keyof LiveAgentSession)[] = ["agentName", "projectName", "userName", "currentTask"];

const SKELETON_4 = Array.from({ length: 4 });
const SKELETON_3 = Array.from({ length: 3 });

export default function OverviewDashboardScreen() {
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop";
  const { width: viewportWidth } = useWindowDimensions();
  const { data, loading, error, refetch } = useOverviewDashboard();
  const {
    data: liveSessions,
    loading: liveLoading,
    error: liveError,
    refetch: refetchLiveSessions,
  } = useLiveAgentSessions();
  const { preset } = useDashboardFilters();
  const filteredSessions = useSearchFilter(liveSessions, SESSION_SEARCH_KEYS);
  const router = useRouter();

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

  const subtitle = useMemo(() => {
    if (!data) return "Organization-level analytics for cloud agent operations";
    const totalRuns = data.runsTrend.reduce((s, p) => s + p.value, 0);
    const days = data.runsTrend.length;
    return `${totalRuns.toLocaleString()} runs across ${days} days (${preset})`;
  }, [data, preset]);

  const headerProps = useMemo(
    () => ({ title: "Home", subtitle, isLoading: loading }),
    [subtitle, loading],
  );

  const trendScrollProps = useMemo(() => ({
    horizontal: !isLargeLayout,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: [styles.chartRow, isLargeLayout && styles.chartRowFill],
  }), [isLargeLayout]);

  const trendCardStyle = useMemo(() => {
    if (isLargeLayout) return styles.chartCardFill;
    const horizontalPadding = bp === "tablet" ? 16 : 12;
    return [
      styles.chartCardViewport,
      { width: Math.max(280, viewportWidth - horizontalPadding * 2) },
    ];
  }, [bp, isLargeLayout, viewportWidth]);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <ScreenWrapper headerProps={headerProps}>
      <LiveAssistantsSection
        sessions={filteredSessions}
        loading={liveLoading}
        error={liveError}
        onRetry={refetchLiveSessions}
        onCardPress={handleLiveCardPress}
      />

      {/* Section 1 -- Key Metrics */}
      <View style={styles.section}>
        <SectionHeader title="Key Metrics" subtitle="At a glance" />
        {loading ? (
          <CardGrid columns={4}>
            {SKELETON_4.map((_, i) => (
              <LoadingSkeleton key={i} variant="kpi" />
            ))}
          </CardGrid>
        ) : data ? (
          <CardGrid columns={4}>
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
      </View>

      {/* Section 2 -- Trends */}
      <View style={styles.section}>
        <SectionHeader title="Trends" />
        <CustomList scrollViewProps={trendScrollProps}>
          <ChartCard title="Runs Over Time" loading={loading} style={trendCardStyle}>
            {data && (
              <LineChart
                data={data.runsTrend}
                variant="area"
                height={200}
              />
            )}
          </ChartCard>
          <ChartCard title="Cost per Day" loading={loading} style={trendCardStyle}>
            {data && (
              <LineChart
                data={data.costTrend}
                height={200}
              />
            )}
          </ChartCard>
        </CustomList>
      </View>

      {/* Section 3 -- Usage & Adoption */}
      {data && data.usageKpis.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Usage & Adoption" subtitle="Active user metrics" />
          <CardGrid columns={3}>
            {data.usageKpis.map((kpi) => (
              <KpiCard
                key={kpi.title}
                title={kpi.title}
                value={kpi.value}
                caption={kpi.caption}
              />
            ))}
          </CardGrid>
          {data.activeUsersTrend && data.activeUsersTrend.length > 0 && (
            <ChartCard title="Active Users Trend">
              <LineChart data={data.activeUsersTrend} variant="area" height={180} />
            </ChartCard>
          )}
        </View>
      )}

      {/* Section 4 -- Outcomes */}
      {data && data.outcomesKpis.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Outcomes" subtitle="Code quality & delivery" />
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
            <ChartCard title="Automated Merge Requests per Day">
              <LineChart data={data.outcomesTrend} height={180} variant="area" />
            </ChartCard>
          )}
        </View>
      )}

      {/* Section 5 -- Reliability & Provider Mix */}
      <View style={styles.section}>
        <SectionHeader title="Reliability & Provider Mix" />
        {loading ? (
          <CardGrid columns={3}>
            {SKELETON_3.map((_, i) => (
              <LoadingSkeleton key={i} variant="kpi" />
            ))}
          </CardGrid>
        ) : data ? (
          <CardGrid columns={3}>
            {data.reliabilityKpis.map((kpi) => (
              <KpiCard
                key={kpi.title + kpi.caption}
                title={kpi.title}
                value={kpi.value}
                delta={kpi.delta}
                deltaPolarity={kpi.deltaPolarity}
                caption={kpi.caption}
              />
            ))}
          </CardGrid>
        ) : null}
      </View>

      {/* Section 6 -- Anomalies */}
      {data && data.anomalies.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Anomalies" subtitle="Notable outliers" />
          <CardGrid columns={3}>
            {data.anomalies.map((a) => (
              <KpiCard
                key={a.runId}
                title={a.type.replace(/_/g, " ")}
                value={a.label}
                caption="Run "
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
