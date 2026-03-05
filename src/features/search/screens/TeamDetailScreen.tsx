import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTeamDetailScreen } from "@/features/search/hooks";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface TeamDetailScreenProps {
  teamId: string;
  originTab: string;
}

export function TeamDetailScreen({ teamId }: TeamDetailScreenProps) {
  const { data, loading, error, refetch } = useTeamDetailScreen(teamId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <ScreenWrapper headerProps={{ title: data.team.name }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: theme.text.primary }]}>{data.team.name}</Text>
        <View style={styles.statsRow}>
          <StatItem label="Members" value={String(data.memberCount)} theme={theme} />
          <StatItem label="Projects" value={String(data.projectCount)} theme={theme} />
          <StatItem label="Runs" value={String(data.totalRuns)} theme={theme} />
          <StatItem label="Success" value={`${(data.successRate * 100).toFixed(1)}%`} theme={theme} />
          <StatItem label="Cost" value={`$${data.totalCostUsd.toFixed(2)}`} theme={theme} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Members</Text>
        {data.members.map((member) => (
          <Text key={member.id} style={[styles.listItem, { color: theme.text.primary }]}>
            {member.name} · {member.email}
          </Text>
        ))}
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Projects</Text>
        {data.projects.map((project) => (
          <Text key={project.id} style={[styles.listItem, { color: theme.text.primary }]}>{project.name}</Text>
        ))}
      </ScrollView>
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
  statsRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  stat: { alignItems: "center", minWidth: 70 },
  statValue: { fontSize: 16, fontWeight: "600" },
  statLabel: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  listItem: { fontSize: 13, paddingVertical: 4 },
});
