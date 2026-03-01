import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRunDetail } from "@/features/analytics/hooks/useRunDetail";
import { useAppDependencies } from "@/core/di/AppDependencies";
import { SectionHeader, KpiCard, CardGrid, StatusBadge, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { formatCurrency, formatDuration, formatCompactNumber } from "@/features/analytics/utils/formatters";
import { ScreenWrapper } from "@/components/screen";
import { spacing } from "@/theme/tokens";

export default function RunDetailScreen() {
  const { runId } = useLocalSearchParams<{ runId: string }>();
  const { data, loading, error, refetch } = useRunDetail(runId ?? "");
  const { seedData } = useAppDependencies();

  // Resolve entity names from seed data
  const entityNames = useMemo(() => {
    if (!data) return null;
    const { run } = data;
    const team = seedData.teams.find((t) => t.id === run.teamId);
    const user = seedData.users.find((u) => u.id === run.userId);
    const project = seedData.projects.find((p) => p.id === run.projectId);
    const agent = seedData.agents.find((a) => a.id === run.agentId);
    return {
      teamName: team?.name ?? run.teamId,
      userName: user?.name ?? run.userId,
      projectName: project?.name ?? run.projectId,
      agentName: agent?.name ?? run.agentId,
    };
  }, [data, seedData]);

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (loading) return <LoadingSkeleton variant="text" />;
  if (!data || !entityNames) return null;

  const { run, timeline, artifacts, policyContext } = data;

  return (
    <ScreenWrapper
      headerProps={{
        title: `Run ${run.id}`,
        subtitle: `${entityNames.projectName} \u00B7 ${entityNames.agentName}`,
        rightComponent: <StatusBadge variant="run-status" status={run.status} />,
      }}
    >
      <View style={styles.section}>
        <SectionHeader title="Overview" />
        <CardGrid columns={4}>
          <KpiCard title="Duration" value={formatDuration(run.durationMs)} />
          <KpiCard title="Cost" value={formatCurrency(run.costUsd)} />
          <KpiCard title="Tokens" value={formatCompactNumber(run.totalTokens)} caption={`${formatCompactNumber(run.inputTokens)} in / ${formatCompactNumber(run.outputTokens)} out`} />
          <KpiCard title="Provider" value={`${run.provider} / ${run.modelId}`} />
        </CardGrid>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Context" />
        <CardGrid columns={4}>
          <KpiCard title="Project" value={entityNames.projectName} />
          <KpiCard title="Agent" value={entityNames.agentName} />
          <KpiCard title="Team" value={entityNames.teamName} />
          <KpiCard title="User" value={entityNames.userName} />
        </CardGrid>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Timeline" />
        <View style={styles.timeline}>
          {timeline.map((event, index) => (
            <View key={event.step} style={styles.timelineItem}>
              <View style={styles.dotColumn}>
                <View style={[styles.dot, index === timeline.length - 1 && event.step === "completed" && (run.status === "succeeded" ? styles.dotSuccess : run.status === "failed" ? styles.dotError : undefined)]} />
                {index < timeline.length - 1 && <View style={styles.connector} />}
              </View>
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
      </View>

      <View style={styles.section}>
        <SectionHeader title="Artifacts" />
        <CardGrid columns={3}>
          <KpiCard title="Lines Added" value={`+${artifacts.linesAdded.toLocaleString()}`} />
          <KpiCard title="Lines Removed" value={`-${artifacts.linesRemoved.toLocaleString()}`} />
          <KpiCard title="Tests" value={`${artifacts.testsPassed}/${artifacts.testsExecuted}`} caption={artifacts.prMerged ? "PR Merged" : artifacts.prCreated ? "PR Created" : "No PR"} />
        </CardGrid>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Policy Context" />
        <View style={styles.policyCard}>
          <View style={styles.policyRow}>
            <Text style={styles.policyKey}>Network Mode</Text>
            <View style={[styles.policyBadge, policyContext.networkMode === "full" ? styles.badgeSuccess : policyContext.networkMode === "limited" ? styles.badgeWarning : styles.badgeError]}>
              <Text style={styles.policyBadgeText}>{policyContext.networkMode}</Text>
            </View>
          </View>
          <View style={styles.policyRow}>
            <Text style={styles.policyKey}>Allowed Actions</Text>
            <Text style={styles.policyValue}>{policyContext.allowedActions.join(", ")}</Text>
          </View>
          <View style={styles.policyRow}>
            <Text style={styles.policyKey}>Blocked Actions</Text>
            <Text style={[styles.policyValue, styles.blockedText]}>{policyContext.blockedActions.join(", ")}</Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[3] },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", gap: 12 },
  dotColumn: { alignItems: "center", width: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#30a8dc", marginTop: 5 },
  dotSuccess: { backgroundColor: "#22c55e" },
  dotError: { backgroundColor: "#ef4444" },
  connector: { width: 2, flex: 1, backgroundColor: "#2d2d2d", marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  stepLabel: { fontSize: 13, fontWeight: "600", color: "#e5e5e5", textTransform: "capitalize" },
  stepDetail: { fontSize: 12, color: "#a3a3a3", marginTop: 2 },
  stepTime: { fontSize: 11, color: "#8a8a8a", marginTop: 2 },
  policyCard: { backgroundColor: "#1a1a1a", borderRadius: 10, padding: 16, gap: 12, borderWidth: 1, borderColor: "#242424" },
  policyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  policyKey: { fontSize: 12, color: "#8a8a8a", fontWeight: "500" },
  policyValue: { fontSize: 12, color: "#a3a3a3", flex: 1, textAlign: "right" },
  blockedText: { color: "#ef4444" },
  policyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeSuccess: { backgroundColor: "rgba(34, 197, 94, 0.15)" },
  badgeWarning: { backgroundColor: "rgba(245, 158, 11, 0.15)" },
  badgeError: { backgroundColor: "rgba(239, 68, 68, 0.15)" },
  policyBadgeText: { fontSize: 11, fontWeight: "600", color: "#e5e5e5", textTransform: "uppercase" },
});
