import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAgentDetailScreen } from "@/features/search/hooks";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { CustomList } from "@/components/lists";
import { ScreenWrapper } from "@/components/screen";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface AgentDetailScreenProps {
  agentId: string;
  originTab: string;
}

export function AgentDetailScreen({ agentId }: AgentDetailScreenProps) {
  const { data, loading, error, refetch } = useAgentDetailScreen(agentId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <ScreenWrapper headerProps={{ title: data.agent.name }}>
      <CustomList scrollViewProps={{ style: styles.scroll, contentContainerStyle: styles.content }}>
        <Text style={[styles.heading, { color: theme.text.primary }]}>{data.agent.name}</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {data.projectName} · {data.teamName}
        </Text>
        <View style={styles.statsRow}>
          <StatItem label="Runs" value={String(data.totalRuns)} theme={theme} />
          <StatItem label="Success" value={`${(data.successRate * 100).toFixed(1)}%`} theme={theme} />
          <StatItem label="Avg Duration" value={`${(data.avgDurationMs / 1000).toFixed(1)}s`} theme={theme} />
          <StatItem label="Cost" value={`$${data.totalCostUsd.toFixed(2)}`} theme={theme} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Recent Runs</Text>
        {data.recentRuns.map((run) => (
          <View key={run.id} style={[styles.runRow, { borderColor: theme.border.default }]}>
            <Text style={[styles.runId, { color: theme.text.primary }]}>{run.id}</Text>
            <Text style={[styles.runStatus, { color: theme.text.secondary }]}>{run.status}</Text>
          </View>
        ))}
      </CustomList>
    </ScreenWrapper>
  );
}

type ThemeColors = (typeof semanticThemes)["dark"];

function StatItem({ label, value, theme }: { label: string; value: string; theme: ThemeColors }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: theme.text.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.text.secondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  heading: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  stat: { alignItems: "center", minWidth: 70 },
  statValue: { fontSize: 16, fontWeight: "600" },
  statLabel: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  runRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1 },
  runId: { fontSize: 12 },
  runStatus: { fontSize: 12 },
});
