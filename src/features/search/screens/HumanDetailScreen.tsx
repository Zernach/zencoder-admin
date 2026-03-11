import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "expo-router";
import { CustomButton } from "@/components/buttons";
import { useHumanDetailScreen } from "@/features/search/hooks";
import { LoadingSkeleton, ErrorState, StatusBadge } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { DataTable } from "@/components/tables";
import type { ColumnDef } from "@/components/tables/DataTable";
import type { RunListRow } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { cellText } from "@/components/tables/cellStyles";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { spacing } from "@/theme/tokens";
import { buildEntityRoute, resolveTabFromPathname, ROUTES } from "@/constants/routes";

interface HumanDetailScreenProps {
  humanId: string;
}

export function HumanDetailScreen({ humanId }: HumanDetailScreenProps) {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useHumanDetailScreen(humanId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = useCallback(
    (entityType: "agent" | "project" | "team" | "human" | "run", entityId: string) => {
      const tab = resolveTabFromPathname(pathname);
      const route = buildEntityRoute(tab, entityType, entityId);
      router.push(route as never);
    },
    [pathname, router],
  );

  const runColumns = useMemo<ColumnDef<RunListRow>[]>(
    () => [
      { key: "id", header: t("entityDetail.table.runId"), width: 140, render: (r) => (
        <CustomButton onPress={() => navigateTo("run", r.id)} accessibilityRole="link" accessibilityLabel={`View run ${r.id}`}>
          <Text style={ct.link} numberOfLines={1}>{r.id.slice(0, 12)}</Text>
        </CustomButton>
      ) },
      {
        key: "status",
        header: t("entityDetail.table.status"),
        width: 100,
        render: (r) => <StatusBadge variant="run-status" status={r.status} />,
      },
      { key: "startedAtIso", header: t("entityDetail.table.created"), width: 160, render: (r) => <Text style={ct.secondary}>{new Date(r.startedAtIso).toLocaleString()}</Text> },
      { key: "provider", header: t("entityDetail.table.provider"), width: 100, render: (r) => <Text style={ct.secondary}>{r.provider}</Text> },
      {
        key: "totalTokens",
        header: t("entityDetail.table.tokens"),
        width: 90,
        align: "right",
        render: (r) => <Text style={ct.primary}>{r.totalTokens.toLocaleString()}</Text>,
        sortAccessor: (r) => r.totalTokens,
      },
      {
        key: "costUsd",
        header: t("entityDetail.table.cost"),
        width: 80,
        align: "right",
        render: (r) => <Text style={ct.primary}>{formatCurrency(r.costUsd)}</Text>,
        sortAccessor: (r) => r.costUsd,
      },
    ],
    [ct, navigateTo, t, formatCurrency],
  );

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={refetch}
        fullScreen
        showHomeButton
        onGoHome={() => router.replace(ROUTES.ROOT as never)}
      />
    );
  }
  if (!data) return null;

  return (
    <ScreenWrapper headerProps={{ title: data.user.name, subtitle: `${data.user.email} · ${data.teamName}` }} showFilterBar={false}>
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatItem label={t("entityDetail.runs")} value={String(data.totalRuns)} theme={theme} />
          <StatItem label={t("entityDetail.tokens")} value={data.totalTokens.toLocaleString()} theme={theme} />
          <StatItem label={t("entityDetail.cost")} value={formatCurrency(data.totalCostUsd)} theme={theme} />
        </View>
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

function StatItem({ label, value, theme }: { label: string; value: string; theme: ThemeColors }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: theme.text.primary }]}>{value}</Text>
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
