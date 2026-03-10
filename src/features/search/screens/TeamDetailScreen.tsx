import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTeamDetailScreen } from "@/features/search/hooks";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { DataTable } from "@/components/tables";
import type { ColumnDef } from "@/components/tables/DataTable";
import type { User, Project } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { cellText, getSuccessRateColor } from "@/components/tables/cellStyles";
import { spacing } from "@/theme/tokens";

interface TeamDetailScreenProps {
  teamId: string;
}

export function TeamDetailScreen({ teamId }: TeamDetailScreenProps) {
  const { data, loading, error, refetch } = useTeamDetailScreen(teamId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);

  const memberColumns = useMemo<ColumnDef<User>[]>(
    () => [
      { key: "name", header: "Name", render: (u) => <Text style={ct.primary}>{u.name}</Text> },
      { key: "email", header: "Email", render: (u) => <Text style={ct.secondary}>{u.email}</Text> },
    ],
    [ct],
  );

  const projectColumns = useMemo<ColumnDef<Project>[]>(
    () => [
      { key: "name", header: "Project Name", render: (p) => <Text style={ct.primary}>{p.name}</Text> },
      { key: "id", header: "ID", width: 140, render: (p) => <Text style={ct.secondary}>{p.id.slice(0, 12)}</Text> },
    ],
    [ct],
  );

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <ScreenWrapper headerProps={{ title: data.team.name }} showFilterBar={false}>
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatItem label="Members" value={String(data.memberCount)} theme={theme} />
          <StatItem label="Projects" value={String(data.projectCount)} theme={theme} />
          <StatItem label="Runs" value={String(data.totalRuns)} theme={theme} />
          <StatItem
            label="Success"
            value={`${(data.successRate * 100).toFixed(1)}%`}
            theme={theme}
            valueColor={getSuccessRateColor(data.successRate, mode)}
          />
          <StatItem label="Cost" value={`$${data.totalCostUsd.toFixed(2)}`} theme={theme} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Members</Text>
        <DataTable
          columns={memberColumns}
          data={data.members}
          keyExtractor={(u) => u.id}
          emptyMessage="No members."
        />

        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Projects</Text>
        <DataTable
          columns={projectColumns}
          data={data.projects}
          keyExtractor={(p) => p.id}
          emptyMessage="No projects."
        />
      </View>
    </ScreenWrapper>
  );
}

type ThemeColors = (typeof semanticThemes)["dark"];

function StatItem({
  label,
  value,
  theme,
  valueColor,
}: {
  label: string;
  value: string;
  theme: ThemeColors;
  valueColor?: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: valueColor ?? theme.text.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.text.secondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[16] },
  statsRow: { flexDirection: "row", gap: spacing[16], flexWrap: "wrap" },
  stat: { alignItems: "center", minWidth: 70 },
  statValue: { fontSize: 16, fontWeight: "600" },
  statLabel: { fontSize: 11, marginTop: spacing[2] },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: spacing[8] },
});
