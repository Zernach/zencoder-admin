import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useGoldenQuestionDetailScreen } from "@/features/search/hooks";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { ChartCard, LineChart } from "@/components/charts";
import { DataTable } from "@/components/tables";
import type { ColumnDef } from "@/components/tables/DataTable";
import type { EvaluationRunRow } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { cellText, getSuccessRateColor } from "@/components/tables/cellStyles";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { formatPercent, formatDuration } from "@/features/analytics/utils/formatters";
import { spacing, radius, borderWidth } from "@/theme/tokens";
import { ROUTES } from "@/constants/routes";

interface GoldenQuestionDetailScreenProps {
  questionId: string;
}

export function GoldenQuestionDetailScreen({ questionId }: GoldenQuestionDetailScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, loading, error, refetch } = useGoldenQuestionDetailScreen(questionId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();

  const runColumns = useMemo<ColumnDef<EvaluationRunRow>[]>(
    () => [
      {
        key: "scoredAtIso",
        header: t("goldenQuestionDetail.table.scoredAt"),
        width: 180,
        render: (r) => (
          <Text style={ct.secondary}>{new Date(r.scoredAtIso).toLocaleString()}</Text>
        ),
        sortAccessor: (r) => r.scoredAtIso,
      },
      {
        key: "score",
        header: t("goldenQuestionDetail.table.score"),
        width: 90,
        align: "right",
        render: (r) => (
          <Text style={[ct.primary, { color: getSuccessRateColor(r.score, mode) }]}>
            {formatPercent(r.score * 100)}
          </Text>
        ),
        sortAccessor: (r) => r.score,
      },
      {
        key: "passed",
        header: t("goldenQuestionDetail.table.outcome"),
        width: 100,
        render: (r) => (
          <View
            style={[
              localStyles.outcomeBadge,
              {
                borderColor: r.passed ? theme.state.success : theme.state.error,
                backgroundColor: `${r.passed ? theme.state.success : theme.state.error}1F`,
              },
            ]}
          >
            <Text
              style={[
                localStyles.outcomeText,
                { color: r.passed ? theme.state.success : theme.state.error },
              ]}
            >
              {r.passed
                ? t("goldenQuestionDetail.outcomePass")
                : t("goldenQuestionDetail.outcomeFail")}
            </Text>
          </View>
        ),
        sortAccessor: (r) => (r.passed ? 1 : 0),
      },
      {
        key: "modelId",
        header: t("goldenQuestionDetail.table.model"),
        width: 160,
        render: (r) => <Text style={ct.primary}>{r.modelId}</Text>,
      },
      {
        key: "provider",
        header: t("goldenQuestionDetail.table.provider"),
        width: 90,
        render: (r) => <Text style={ct.secondary}>{r.provider}</Text>,
      },
      {
        key: "criteriaScores",
        header: t("goldenQuestionDetail.table.criteria"),
        width: 260,
        render: (r) => (
          <Text style={ct.secondary} numberOfLines={2}>
            {r.criteriaScores
              .map((c) => `${c.label} ${formatPercent(c.score * 100)}`)
              .join(" · ")}
          </Text>
        ),
      },
      {
        key: "durationMs",
        header: t("goldenQuestionDetail.table.duration"),
        width: 90,
        align: "right",
        render: (r) => <Text style={ct.primary}>{formatDuration(r.durationMs)}</Text>,
        sortAccessor: (r) => r.durationMs,
      },
      {
        key: "costUsd",
        header: t("goldenQuestionDetail.table.cost"),
        width: 80,
        align: "right",
        render: (r) => <Text style={ct.primary}>{formatCurrency(r.costUsd)}</Text>,
        sortAccessor: (r) => r.costUsd,
      },
    ],
    [ct, formatCurrency, mode, t, theme.state.success, theme.state.error],
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

  const { question, projectName, teamName, evaluationRuns, scoreTrend, averageScore, totalEvaluations, passRate } = data;

  return (
    <ScreenWrapper
      headerProps={{
        title: question.question,
        subtitle: `${projectName} · ${teamName}`,
      }}
      showFilterBar={false}
    >
      <View style={localStyles.content}>
        <View style={localStyles.statsRow}>
          <StatItem
            label={t("goldenQuestionDetail.latestScore")}
            value={formatPercent(question.latestScore * 100)}
            theme={theme}
            valueColor={getSuccessRateColor(question.latestScore, mode)}
          />
          <StatItem
            label={t("goldenQuestionDetail.averageScore")}
            value={formatPercent(averageScore * 100)}
            theme={theme}
            valueColor={getSuccessRateColor(averageScore, mode)}
          />
          <StatItem
            label={t("goldenQuestionDetail.passRate")}
            value={formatPercent(passRate * 100)}
            theme={theme}
            valueColor={getSuccessRateColor(passRate, mode)}
          />
          <StatItem
            label={t("goldenQuestionDetail.totalEvaluations")}
            value={String(totalEvaluations)}
            theme={theme}
          />
        </View>

        <ChartCard title={t("goldenQuestionDetail.scoreTrend")}>
          <LineChart data={scoreTrend} variant="percentages" xTickCount={4} />
        </ChartCard>

        <Text style={[localStyles.sectionTitle, { color: theme.text.primary }]}>
          {t("goldenQuestionDetail.evaluationRuns")}
        </Text>
        <DataTable
          columns={runColumns}
          data={evaluationRuns}
          keyExtractor={(r) => r.id}
          initialSortBy="scoredAtIso"
          initialSortDirection="desc"
          emptyMessage={t("goldenQuestionDetail.noEvaluations")}
          paginate
        />
      </View>
    </ScreenWrapper>
  );
}

type ThemeColors = (typeof semanticThemes)["dark"];

const StatItem = React.memo(function StatItem({
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
    <View
      style={[
        localStyles.stat,
        { borderColor: theme.border.subtle, backgroundColor: theme.bg.surface },
      ]}
    >
      <Text style={[localStyles.statValue, { color: valueColor ?? theme.text.primary }]}>
        {value}
      </Text>
      <Text style={[localStyles.statLabel, { color: theme.text.secondary }]}>{label}</Text>
    </View>
  );
});

const localStyles = StyleSheet.create({
  content: { gap: spacing[16] },
  statsRow: { flexDirection: "row", gap: spacing[12], flexWrap: "wrap" },
  stat: {
    minWidth: 140,
    flexGrow: 1,
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[16],
    gap: spacing[2],
  },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11, fontWeight: "500" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: spacing[8] },
  outcomeBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[8],
    alignSelf: "flex-start",
  },
  outcomeText: { fontSize: 11, fontWeight: "700" },
});
