import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRunDetailScreen } from "@/features/search/hooks";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { CustomList } from "@/components/lists";
import { ScreenWrapper } from "@/components/screen";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface RunDetailScreenProps {
  runId: string;
}

export function RunDetailScreen({ runId }: RunDetailScreenProps) {
  const { data, loading, error, refetch } = useRunDetailScreen(runId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const { run } = data;

  return (
    <ScreenWrapper headerProps={{ title: `Run ${run.id}` }}>
      <CustomList scrollViewProps={{ style: styles.scroll, contentContainerStyle: styles.content }}>
        <Text style={[styles.heading, { color: theme.text.primary }]}>Run {run.id}</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {data.agentName} · {data.projectName} · {data.teamName}
        </Text>
        <View style={styles.statsRow}>
          <StatItem label="Status" value={run.status} theme={theme} />
          <StatItem label="Provider" value={run.provider} theme={theme} />
          <StatItem label="Duration" value={`${(run.durationMs / 1000).toFixed(1)}s`} theme={theme} />
          <StatItem label="Cost" value={`$${run.costUsd.toFixed(2)}`} theme={theme} />
          <StatItem label="Tokens" value={run.totalTokens.toLocaleString()} theme={theme} />
        </View>
        <View style={[styles.detailRow, { borderColor: theme.border.default }]}>
          <Text style={[styles.detailLabel, { color: theme.text.secondary }]}>User</Text>
          <Text style={[styles.detailValue, { color: theme.text.primary }]}>{data.userName}</Text>
        </View>
        <View style={[styles.detailRow, { borderColor: theme.border.default }]}>
          <Text style={[styles.detailLabel, { color: theme.text.secondary }]}>Started</Text>
          <Text style={[styles.detailValue, { color: theme.text.primary }]}>{run.startedAtIso}</Text>
        </View>
        {run.completedAtIso && (
          <View style={[styles.detailRow, { borderColor: theme.border.default }]}>
            <Text style={[styles.detailLabel, { color: theme.text.secondary }]}>Completed</Text>
            <Text style={[styles.detailValue, { color: theme.text.primary }]}>{run.completedAtIso}</Text>
          </View>
        )}
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
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "500" },
});
