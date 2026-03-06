import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useProjectDetailScreen } from "@/features/search/hooks";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { CustomList } from "@/components/lists";
import { ScreenWrapper } from "@/components/screen";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface ProjectDetailScreenProps {
  projectId: string;
  originTab: string;
}

export function ProjectDetailScreen({ projectId }: ProjectDetailScreenProps) {
  const { data, loading, error, refetch } = useProjectDetailScreen(projectId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <ScreenWrapper headerProps={{ title: data.project.name }}>
      <CustomList scrollViewProps={{ style: styles.scroll, contentContainerStyle: styles.content }}>
        <Text style={[styles.heading, { color: theme.text.primary }]}>{data.project.name}</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{data.teamName}</Text>
        <View style={styles.statsRow}>
          <StatItem label="Agents" value={String(data.agentCount)} theme={theme} />
          <StatItem label="Runs" value={String(data.totalRuns)} theme={theme} />
          <StatItem label="Success" value={`${(data.successRate * 100).toFixed(1)}%`} theme={theme} />
          <StatItem label="Cost" value={`$${data.totalCostUsd.toFixed(2)}`} theme={theme} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Agents</Text>
        {data.agents.map((agent) => (
          <Text key={agent.id} style={[styles.listItem, { color: theme.text.primary }]}>{agent.name}</Text>
        ))}
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
  listItem: { fontSize: 13, paddingVertical: 4 },
  runRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1 },
  runId: { fontSize: 12 },
  runStatus: { fontSize: 12 },
});
