import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useOverviewDashboard } from "@/features/analytics/hooks/useOverviewDashboard";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, TrendChart } from "@/components/charts";

export default function OverviewDashboardScreen() {
  const { data, loading, error, refetch } = useOverviewDashboard();
  const router = useRouter();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview Dashboard</Text>
      <Text style={styles.subtitle}>
        Organization-level analytics for cloud agent operations
      </Text>

      {/* Section 1 — Key Metrics */}
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

      {/* Section 2 — Trends */}
      <View style={styles.section}>
        <SectionHeader title="Trends" />
        <View style={styles.chartRow}>
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
                color="#22c55e"
                height={200}
              />
            )}
          </ChartCard>
        </View>
      </View>

      {/* Section 3 — Reliability */}
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

      {/* Section 4 — Anomalies */}
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
                onPress={() =>
                  router.push(`/(dashboard)/runs/${a.runId}` as never)
                }
              />
            ))}
          </CardGrid>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e5e5e5",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    color: "#a3a3a3",
    marginTop: -16,
  },
  section: {
    gap: 12,
  },
  chartRow: {
    flexDirection: "row",
    gap: 16,
  },
});
