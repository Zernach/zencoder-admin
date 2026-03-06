import React, { useMemo } from "react";
import { View } from "react-native";
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
import { ChartCard, TrendChart } from "@/components/charts";
import { chartColors } from "@/components/tables";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { CustomList } from "@/components/lists";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import type { LiveAgentSession } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

const styles = sectionStyles;

const SESSION_SEARCH_KEYS: (keyof LiveAgentSession)[] = ["agentName", "projectName", "userName", "currentTask"];

export default function OverviewDashboardScreen() {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const cc = chartColors(mode);
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

  const subtitle = useMemo(() => {
    if (!data) return "Organization-level analytics for cloud agent operations";
    const totalRuns = data.runsTrend.reduce((s, p) => s + p.value, 0);
    const days = data.runsTrend.length;
    return `${totalRuns.toLocaleString()} runs across ${days} days (${preset})`;
  }, [data, preset]);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <ScreenWrapper
      headerProps={{
        title: "Home",
        subtitle,
        isLoading: loading,
      }}
    >
      <LiveAssistantsSection
        sessions={filteredSessions}
        loading={liveLoading}
        error={liveError}
        onRetry={() => {
          void refetchLiveSessions();
        }}
      />

      {/* Section 1 -- Key Metrics */}
      <View style={styles.section}>
        <SectionHeader title="Key Metrics" subtitle="At a glance" />
        {loading ? (
          <CardGrid columns={4}>
            {Array.from({ length: 4 }).map((_, i) => (
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
                    ? () => router.push(kpi.route as never)
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
        <CustomList
          scrollViewProps={{
            horizontal: true,
            showsHorizontalScrollIndicator: false,
            contentContainerStyle: styles.chartRow,
          }}
        >
          <ChartCard title="Runs Over Time" loading={loading}>
            {data && (
              <TrendChart
                data={data.runsTrend}
                variant="area"
                height={200}
              />
            )}
          </ChartCard>
          <ChartCard title="Cost Trend" loading={loading}>
            {data && (
              <TrendChart
                data={data.costTrend}
                variant="line"
                color={cc.success}
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
              <TrendChart data={data.activeUsersTrend} variant="area" color={theme.data.seriesTertiary} height={180} />
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
            <ChartCard title="PRs Merged Over Time">
              <TrendChart data={data.outcomesTrend} variant="line" color={cc.warning} height={180} />
            </ChartCard>
          )}
        </View>
      )}

      {/* Section 5 -- Reliability & Provider Mix */}
      <View style={styles.section}>
        <SectionHeader title="Reliability & Provider Mix" />
        {loading ? (
          <CardGrid columns={3}>
            {Array.from({ length: 3 }).map((_, i) => (
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
                caption={`Run ${a.runId}`}
              />
            ))}
          </CardGrid>
        </View>
      )}
    </ScreenWrapper>
  );
}
