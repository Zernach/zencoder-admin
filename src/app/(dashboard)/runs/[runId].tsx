import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRunDetail } from "@/features/analytics/hooks/useRunDetail";
import { SectionHeader, KpiCard, CardGrid, StatusBadge, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { formatCurrency, formatDuration, formatCompactNumber } from "@/features/analytics/utils/formatters";

export default function RunDetailScreen() {
  const { runId } = useLocalSearchParams<{ runId: string }>();
  const { data, loading, error, refetch } = useRunDetail(runId ?? "");

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (loading) return <LoadingSkeleton variant="text" />;
  if (!data) return null;

  const { run, timeline, artifacts, policyContext } = data;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Run {run.id}</Text>
        <StatusBadge variant="run-status" status={run.status} />
      </View>

      <SectionHeader title="Overview" />
      <CardGrid columns={4}>
        <KpiCard title="Duration" value={formatDuration(run.durationMs)} />
        <KpiCard title="Cost" value={formatCurrency(run.costUsd)} />
        <KpiCard title="Tokens" value={formatCompactNumber(run.totalTokens)} />
        <KpiCard title="Provider" value={`${run.provider} / ${run.modelId}`} />
      </CardGrid>

      <SectionHeader title="Timeline" />
      <View style={styles.timeline}>
        {timeline.map((event) => (
          <View key={event.step} style={styles.timelineItem}>
            <View style={styles.dot} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepLabel}>{event.step}</Text>
              <Text style={styles.stepDetail}>{event.detail}</Text>
              <Text style={styles.stepTime}>
                {new Date(event.timestampIso).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <SectionHeader title="Artifacts" />
      <CardGrid columns={3}>
        <KpiCard title="Lines Added" value={`+${artifacts.linesAdded}`} />
        <KpiCard title="Lines Removed" value={`-${artifacts.linesRemoved}`} />
        <KpiCard title="Tests" value={`${artifacts.testsPassed}/${artifacts.testsExecuted}`} caption={artifacts.prMerged ? "PR Merged" : artifacts.prCreated ? "PR Created" : "No PR"} />
      </CardGrid>

      <SectionHeader title="Policy Context" />
      <View style={styles.policyCard}>
        <Text style={styles.policyLabel}>Network Mode: {policyContext.networkMode}</Text>
        <Text style={styles.policyLabel}>Allowed: {policyContext.allowedActions.join(", ")}</Text>
        <Text style={styles.policyLabel}>Blocked: {policyContext.blockedActions.join(", ")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 22, fontWeight: "700", color: "#e5e5e5" },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", gap: 12, paddingVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#30a8dc", marginTop: 6 },
  timelineContent: { flex: 1 },
  stepLabel: { fontSize: 13, fontWeight: "600", color: "#e5e5e5", textTransform: "capitalize" },
  stepDetail: { fontSize: 12, color: "#a3a3a3", marginTop: 2 },
  stepTime: { fontSize: 11, color: "#7a7a7a", marginTop: 2 },
  policyCard: { backgroundColor: "#1a1a1a", borderRadius: 10, padding: 16, gap: 8, borderWidth: 1, borderColor: "#242424" },
  policyLabel: { fontSize: 12, color: "#a3a3a3" },
});
