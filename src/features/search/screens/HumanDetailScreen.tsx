import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
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
import { spacing } from "@/theme/tokens";
import { buildEntityRoute, resolveTabFromPathname } from "@/constants/routes";

interface HumanDetailScreenProps {
  humanId: string;
}

export function HumanDetailScreen({ humanId }: HumanDetailScreenProps) {
  const { data, loading, error, refetch } = useHumanDetailScreen(humanId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);
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
      { key: "id", header: "Run ID", width: 140, render: (r) => (
        <CustomButton onPress={() => navigateTo("run", r.id)} accessibilityRole="link" accessibilityLabel={`View run ${r.id}`}>
          <Text style={ct.link} numberOfLines={1}>{r.id.slice(0, 12)}</Text>
        </CustomButton>
      ) },
      {
        key: "status",
        header: "Status",
        width: 100,
        render: (r) => <StatusBadge variant="run-status" status={r.status} />,
      },
      { key: "provider", header: "Provider", width: 100, render: (r) => <Text style={ct.secondary}>{r.provider}</Text> },
      {
        key: "totalTokens",
        header: "Tokens",
        width: 90,
        align: "right",
        render: (r) => <Text style={ct.primary}>{r.totalTokens.toLocaleString()}</Text>,
        sortAccessor: (r) => r.totalTokens,
      },
      {
        key: "costUsd",
        header: "Cost",
        width: 80,
        align: "right",
        render: (r) => <Text style={ct.primary}>${r.costUsd.toFixed(2)}</Text>,
        sortAccessor: (r) => r.costUsd,
      },
    ],
    [ct, navigateTo],
  );

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <ScreenWrapper headerProps={{ title: data.user.name, subtitle: `${data.user.email} · ${data.teamName}` }} showFilterBar={false}>
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatItem label="Runs" value={String(data.totalRuns)} theme={theme} />
          <StatItem label="Tokens" value={data.totalTokens.toLocaleString()} theme={theme} />
          <StatItem label="Cost" value={`$${data.totalCostUsd.toFixed(2)}`} theme={theme} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Recent Runs</Text>
        <DataTable
          columns={runColumns}
          data={data.recentRuns}
          keyExtractor={(r) => r.id}
          initialSortBy="costUsd"
          initialSortDirection="desc"
          emptyMessage="No runs yet."
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
