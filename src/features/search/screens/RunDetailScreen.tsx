import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRunDetailScreen } from "@/features/search/hooks";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { DataTable } from "@/components/tables";
import type { ColumnDef } from "@/components/tables/DataTable";
import { useThemeMode } from "@/providers/ThemeProvider";
import { cellText } from "@/components/tables/cellStyles";
import { spacing } from "@/theme/tokens";

interface RunDetailScreenProps {
  runId: string;
}

interface DetailRow {
  label: string;
  value: string;
}

export function RunDetailScreen({ runId }: RunDetailScreenProps) {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useRunDetailScreen(runId);
  const { mode } = useThemeMode();
  const ct = cellText(mode);

  const detailColumns = useMemo<ColumnDef<DetailRow>[]>(
    () => [
      { key: "label", header: "Field", render: (r) => <Text style={ct.secondary}>{r.label}</Text> },
      { key: "value", header: "Value", align: "right", render: (r) => <Text style={ct.primary}>{r.value}</Text> },
    ],
    [ct],
  );

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const { run } = data;

  const detailRows: DetailRow[] = [
    { label: t("entityDetail.runFields.status"), value: run.status },
    { label: t("entityDetail.runFields.provider"), value: run.provider },
    { label: t("entityDetail.runFields.model"), value: run.modelId },
    { label: t("entityDetail.runFields.duration"), value: `${(run.durationMs / 1000).toFixed(1)}s` },
    { label: t("entityDetail.runFields.cost"), value: `$${run.costUsd.toFixed(2)}` },
    { label: t("entityDetail.runFields.tokens"), value: run.totalTokens.toLocaleString() },
    { label: t("entityDetail.runFields.inputTokens"), value: run.inputTokens.toLocaleString() },
    { label: t("entityDetail.runFields.outputTokens"), value: run.outputTokens.toLocaleString() },
    { label: t("entityDetail.runFields.agent"), value: data.agentName },
    { label: t("entityDetail.runFields.project"), value: data.projectName },
    { label: t("entityDetail.runFields.team"), value: data.teamName },
    { label: t("entityDetail.runFields.user"), value: data.userName },
    { label: t("entityDetail.runFields.started"), value: run.startedAtIso },
    ...(run.completedAtIso ? [{ label: t("entityDetail.runFields.completed"), value: run.completedAtIso }] : []),
  ];

  return (
    <ScreenWrapper headerProps={{ title: `Run ${run.id.slice(0, 12)}`, subtitle: `${data.agentName} · ${data.projectName} · ${data.teamName}` }} showFilterBar={false}>
      <View style={styles.content}>
        <DataTable
          columns={detailColumns}
          data={detailRows}
          keyExtractor={(r) => r.label}
          emptyMessage={t("entityDetail.noDetails")}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[16] },
});
