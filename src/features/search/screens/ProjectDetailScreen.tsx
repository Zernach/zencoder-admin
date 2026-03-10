import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useProjectDetailScreen } from "@/features/search/hooks";
import { LoadingSkeleton, ErrorState, StatusBadge } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { DataTable } from "@/components/tables";
import type { ColumnDef } from "@/components/tables/DataTable";
import type { Agent, RunListRow } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { cellText, getSuccessRateColor } from "@/components/tables/cellStyles";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { spacing } from "@/theme/tokens";

interface ProjectDetailScreenProps {
  projectId: string;
}

export function ProjectDetailScreen({ projectId }: ProjectDetailScreenProps) {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useProjectDetailScreen(projectId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();

  const agentColumns = useMemo<ColumnDef<Agent>[]>(
    () => [
      { key: "name", header: t("entityDetail.table.agentName"), render: (a) => <Text style={ct.primary}>{a.name}</Text> },
      { key: "id", header: t("entityDetail.table.id"), width: 140, render: (a) => <Text style={ct.secondary}>{a.id.slice(0, 12)}</Text> },
    ],
    [ct, t],
  );

  const runColumns = useMemo<ColumnDef<RunListRow>[]>(
    () => [
      { key: "id", header: t("entityDetail.table.runId"), width: 140, render: (r) => <Text style={ct.primary}>{r.id.slice(0, 12)}</Text> },
      {
        key: "status",
        header: t("entityDetail.table.status"),
        width: 100,
        render: (r) => <StatusBadge variant="run-status" status={r.status} />,
      },
      { key: "startedAtIso", header: t("entityDetail.table.created"), width: 160, render: (r) => <Text style={ct.secondary}>{new Date(r.startedAtIso).toLocaleString()}</Text> },
      { key: "provider", header: t("entityDetail.table.provider"), width: 100, render: (r) => <Text style={ct.secondary}>{r.provider}</Text> },
      {
        key: "costUsd",
        header: t("entityDetail.table.cost"),
        width: 80,
        align: "right",
        render: (r) => <Text style={ct.primary}>{formatCurrency(r.costUsd)}</Text>,
        sortAccessor: (r) => r.costUsd,
      },
    ],
    [ct, t, formatCurrency],
  );

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <ScreenWrapper headerProps={{ title: data.project.name, subtitle: data.teamName }} showFilterBar={false}>
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatItem label={t("entityDetail.agents")} value={String(data.agentCount)} theme={theme} />
          <StatItem label={t("entityDetail.runs")} value={String(data.totalRuns)} theme={theme} />
          <StatItem
            label={t("entityDetail.success")}
            value={`${(data.successRate * 100).toFixed(1)}%`}
            theme={theme}
            valueColor={getSuccessRateColor(data.successRate, mode)}
          />
          <StatItem label={t("entityDetail.cost")} value={formatCurrency(data.totalCostUsd)} theme={theme} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t("entityDetail.agents")}</Text>
        <DataTable
          columns={agentColumns}
          data={data.agents}
          keyExtractor={(a) => a.id}
          emptyMessage={t("entityDetail.noAgents")}
        />

        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t("entityDetail.recentRuns")}</Text>
        <DataTable
          columns={runColumns}
          data={data.recentRuns}
          keyExtractor={(r) => r.id}
          initialSortBy="costUsd"
          initialSortDirection="desc"
          emptyMessage={t("entityDetail.noRunsYet")}
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
