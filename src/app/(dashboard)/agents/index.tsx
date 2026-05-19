import React, { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { CustomButton } from "@/components/buttons";
import { CustomList } from "@/components/lists";
import { useAgentsHub } from "@/features/analytics/hooks/useAgentsHub";
import { useMachineLearning } from "@/features/analytics/hooks/useMachineLearning";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState, StatusBadge } from "@/components/dashboard";
import { ChartCard, LineChart, BarChart, SparkLine, type BarChartBreakdownDatum } from "@/components/charts";
import { DataTable, type ColumnDef, cellText, getSuccessRateGreenShadeColor } from "@/components/tables";
import { formatPercent, formatDuration, formatCompactNumber } from "@/features/analytics/utils/formatters";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import type {
  AgentBreakdownRow,
  AgentsHubResponse,
  GoldenQuestionEvaluation,
  MachineLearningResponse,
  MlDriftStatus,
  MlModelRow,
  MlModelStage,
  MlTrainingRunRow,
  ProjectBreakdownRow,
  ProjectEvaluationSection,
  RunListRow,
} from "@/features/analytics/types";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { CreateProjectModal } from "@/features/analytics/components/CreateProjectModal";
import { CreateAgentModal } from "@/features/analytics/components/CreateAgentModal";
import { CreateEvaluationModal } from "@/features/analytics/components/CreateEvaluationModal";
import { useThemeMode } from "@/providers/ThemeProvider";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { keyExtractors } from "@/constants";
import { buildEntityRoute, resolveTabFromPathname, ROUTES } from "@/constants/routes";
import { useAppDispatch, openModal, ModalName } from "@/store";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { semanticThemes } from "@/theme/themes";
import { radius, spacing } from "@/theme/tokens";

const styles = sectionStyles;
const localStyles = StyleSheet.create({
  evaluationProjectTableWrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[12],
    gap: spacing[12],
  },
  evaluationQuestionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
    flexWrap: "wrap",
  },
  evaluationMetricText: {
    fontSize: 12,
    fontWeight: "600",
  },
  evaluationDeltaBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[8],
  },
  evaluationDeltaText: {
    fontSize: 11,
    fontWeight: "700",
  },
  evaluationSparklineWrap: {
    justifyContent: "center",
    minHeight: 28,
  },
  evaluationProjectTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  evaluationProjectSubtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  sectionGroup: {
    gap: spacing[16],
  },
  sectionGroupHeader: {
    borderLeftWidth: 3,
    paddingLeft: spacing[12],
    gap: spacing[2],
  },
  sectionGroupTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  sectionGroupSubtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
});

const SKELETON_4 = Array.from({ length: 4 });

const AGENT_SEARCH_KEYS: (keyof AgentBreakdownRow)[] = ["agentName", "projectName"];
const PROJECT_SEARCH_KEYS: (keyof ProjectBreakdownRow)[] = ["projectName", "teamName"];
const RUN_SEARCH_KEYS: (keyof RunListRow)[] = ["id", "status", "provider"];

type AgentsEntityType = "agent" | "project" | "team" | "human" | "run" | "evaluation";
type AgentsNavigateTo = (entityType: AgentsEntityType, entityId: string) => void;

interface AgentsReliabilitySectionProps {
  data: AgentsHubResponse | undefined;
  loading: boolean;
}

const AgentsReliabilitySection = React.memo(function AgentsReliabilitySection({
  data,
  loading,
}: AgentsReliabilitySectionProps) {
  const { t } = useTranslation();
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop" || bp === "tablet";
  const refFor = useSectionRef();

  const failureCategoryData = useMemo<BarChartBreakdownDatum[]>(() =>
    (data?.failureCategoryBreakdown ?? []).map((cat) => ({
      key: cat.key,
      value: cat.value,
      hoverRows: cat.agentBreakdown.map((agent) => ({
        label: agent.key,
        value: formatCompactNumber(agent.value),
      })),
    })),
  [data?.failureCategoryBreakdown],
  );

  const chartScrollProps = useMemo(() => ({
    horizontal: !isLargeLayout,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: [styles.chartRow, isLargeLayout && styles.chartRowFill],
  }), [isLargeLayout]);

  return (
    <View ref={refFor("reliability")} nativeID="reliability" style={styles.section}>
      <SectionHeader title={t("agents.reliability")} subtitle={t("agents.reliabilitySubtitle")} />
      {loading ? (
        <CardGrid columns={4}>
          {SKELETON_4.map((_, i) => (
            <LoadingSkeleton key={i} variant="kpi" />
          ))}
        </CardGrid>
      ) : data ? (
        <>
          <CustomList scrollViewProps={chartScrollProps}>
            <ChartCard title={t("agents.reliabilityTrend")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <LineChart
                data={data.reliabilityTrend}
                variant="percentages"
                xTickCount={4}
              />
            </ChartCard>
            <ChartCard title={t("agents.failureCategories")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <BarChart
                data={failureCategoryData}
                variant="horizontal-bar"
                truncateLabels={false}
              />
            </ChartCard>
          </CustomList>
          <CustomList scrollViewProps={chartScrollProps}>
            <ChartCard title={t("agents.p50DurationTrend")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <LineChart data={data.p50DurationTrend} variant="line" xTickCount={4} />
            </ChartCard>
            <ChartCard title={t("agents.p95DurationTrend")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <LineChart data={data.p95DurationTrend} variant="line" xTickCount={4} />
            </ChartCard>
          </CustomList>
          <CustomList scrollViewProps={chartScrollProps}>
            <ChartCard title={t("agents.p95QueueWaitTrend")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <LineChart data={data.p95QueueWaitTrend} variant="line" xTickCount={4} />
            </ChartCard>
            <ChartCard title={t("agents.peakConcurrencyTrend")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <LineChart data={data.peakConcurrencyTrend} variant="line" xTickCount={4} />
            </ChartCard>
          </CustomList>
        </>
      ) : null}
    </View>
  );
});

interface AgentsEvaluationsSectionProps {
  data: AgentsHubResponse;
  onCreateEvaluation: () => void;
  navigateTo: AgentsNavigateTo;
}

interface EvaluationQuestionTableRow extends GoldenQuestionEvaluation {
  trendValues: number[];
}

interface TimeSeriesColumnDef<T> extends Omit<ColumnDef<T>, "render"> {
  kind: "timeseries";
  valuesAccessor: (row: T) => number[];
  sparklineWidth?: number;
  sparklineHeight?: number;
}

type EvaluationColumnDef<T> = ColumnDef<T> | TimeSeriesColumnDef<T>;

const AgentsEvaluationsSection = React.memo(function AgentsEvaluationsSection({
  data,
  onCreateEvaluation,
  navigateTo,
}: AgentsEvaluationsSectionProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);
  const refFor = useSectionRef();

  const projects = data.projectEvaluations;

  if (projects.length === 0) {
    return null;
  }

  const getDeltaLabel = (delta: number): string => {
    const pct = Math.abs(delta * 100);
    const direction = delta > 0.002
      ? t("agents.evaluationDirectionImproving")
      : delta < -0.002
        ? t("agents.evaluationDirectionRegressing")
        : t("agents.evaluationDirectionFlat");
    const sign = delta >= 0 ? "+" : "\u2212";
    return `${direction} ${sign}${pct.toFixed(1)}%`;
  };

  const getDeltaBadgeStyle = (delta: number) => {
    if (delta > 0.002) {
      return {
        borderColor: theme.state.success,
        backgroundColor: `${theme.state.success}1F`,
        color: theme.state.success,
      };
    }
    if (delta < -0.002) {
      return {
        borderColor: theme.state.error,
        backgroundColor: `${theme.state.error}1F`,
        color: theme.state.error,
      };
    }
    return {
      borderColor: theme.border.default,
      backgroundColor: theme.bg.surfaceElevated,
      color: theme.text.secondary,
    };
  };

  const evaluationColumns = useMemo<EvaluationColumnDef<EvaluationQuestionTableRow>[]>(() => [
    {
      key: "question",
      header: t("agents.evaluationQuestion"),
      width: 420,
      render: (row) => (
        <CustomButton
          onPress={() => navigateTo("evaluation", row.id)}
          accessibilityRole="link"
          accessibilityLabel={t("agents.viewEvaluationDetail", { question: row.question })}
        >
          <Text style={[ct.link, { fontSize: 13, lineHeight: 18 }]}>{row.question}</Text>
        </CustomButton>
      ),
    },
    {
      key: "latestScore",
      header: t("agents.evaluationScore"),
      width: 100,
      align: "right",
      render: (row) => <Text style={{ color: theme.text.primary }}>{formatPercent(row.latestScore * 100)}</Text>,
      sortAccessor: (row) => row.latestScore,
    },
    {
      key: "scoreDelta",
      header: t("agents.evaluationChange"),
      width: 160,
      render: (row) => {
        const deltaStyle = getDeltaBadgeStyle(row.scoreDelta);
        return (
          <View
            style={[
              localStyles.evaluationDeltaBadge,
              {
                borderColor: deltaStyle.borderColor,
                backgroundColor: deltaStyle.backgroundColor,
              },
            ]}
          >
            <Text style={[localStyles.evaluationDeltaText, { color: deltaStyle.color }]}>
              {getDeltaLabel(row.scoreDelta)}
            </Text>
          </View>
        );
      },
      sortAccessor: (row) => row.scoreDelta,
    },
    {
      key: "evaluationCount",
      header: t("agents.evaluationSamples"),
      width: 100,
      align: "right",
      render: (row) => <Text style={{ color: theme.text.primary }}>{formatCompactNumber(row.evaluationCount)}</Text>,
      sortAccessor: (row) => row.evaluationCount,
    },
    {
      key: "trend",
      header: t("agents.evaluationTrend"),
      width: 140,
      align: "center",
      kind: "timeseries",
      valuesAccessor: (row) => row.trendValues,
      sparklineWidth: 110,
      sparklineHeight: 26,
      sortAccessor: (row) => row.latestScore,
    },
  ], [ct.link, navigateTo, t, theme.text.primary]);

  const tableColumns = useMemo<ColumnDef<EvaluationQuestionTableRow>[]>(() =>
    evaluationColumns.map((column) => {
      if ("kind" in column && column.kind === "timeseries") {
        return {
          ...column,
          render: (row: EvaluationQuestionTableRow) => (
            <View style={localStyles.evaluationSparklineWrap}>
              <SparkLine
                data={column.valuesAccessor(row)}
                width={column.sparklineWidth}
                height={column.sparklineHeight}
                variant="candlestick"
              />
            </View>
          ),
        } satisfies ColumnDef<EvaluationQuestionTableRow>;
      }
      return column satisfies ColumnDef<EvaluationQuestionTableRow>;
    }),
  [evaluationColumns]);

  const projectTables = projects.map((project: ProjectEvaluationSection) => {
    const rows: EvaluationQuestionTableRow[] = project.goldenQuestions.map((question) => ({
      ...question,
      trendValues: question.trend.map((point) => point.value),
    }));

    return (
      <View
        key={project.projectId}
        style={[
          localStyles.evaluationProjectTableWrap,
          { borderColor: theme.border.subtle, backgroundColor: theme.bg.surface },
        ]}
      >
        <View>
          <Text style={[localStyles.evaluationProjectTitle, { color: theme.text.primary }]}>
            {project.projectName}
          </Text>
          <Text style={[localStyles.evaluationProjectSubtitle, { color: theme.text.secondary }]}>
            {t("agents.goldenQuestionsCount", { count: rows.length })}
          </Text>
        </View>
        <DataTable
          columns={tableColumns}
          data={rows}
          keyExtractor={(row) => row.id}
          initialSortBy="latestScore"
          initialSortDirection="desc"
        />
      </View>
    );
  });

  return (
    <View ref={refFor("evaluations")} nativeID="evaluations" style={styles.section}>
      <View style={styles.sectionRow}>
        <View style={styles.sectionHeaderWrap}>
          <SectionHeader
            title={t("agents.evaluations")}
            subtitle={t("agents.evaluationsSubtitle", { count: projects.length })}
          />
        </View>
        <CustomButton
          onPress={onCreateEvaluation}
          style={styles.createButton}
          buttonMode="secondary"
          buttonSize="compact"
          label={t("agents.createEvaluation")}
          textStyle={styles.createButtonText}
          accessibilityRole="button"
          accessibilityLabel={t("modals.createEvaluationTitle")}
        />
      </View>
      <View style={styles.section}>{projectTables}</View>
    </View>
  );
});

interface AgentsAgentPerformanceSectionProps {
  data: AgentsHubResponse;
  navigateTo: AgentsNavigateTo;
}

const AgentsAgentPerformanceSection = React.memo(function AgentsAgentPerformanceSection({
  data,
  navigateTo,
}: AgentsAgentPerformanceSectionProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();
  const refFor = useSectionRef();
  const filteredAgents = useSearchFilter(data.agentBreakdown, AGENT_SEARCH_KEYS);

  const agentCols = useMemo<ColumnDef<AgentBreakdownRow>[]>(() => [
    {
      key: "agentName", header: t("agents.table.agent"), width: 160, render: (row) => (
        <CustomButton onPress={() => navigateTo("agent", row.agentId)} accessibilityRole="link" accessibilityLabel={`View agent ${row.agentName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.agentName}</Text>
        </CustomButton>
      ),
    },
    { key: "successRate", header: t("agents.table.success"), width: 80, align: "right", render: (row) => <Text style={[ct.primary, { color: getSuccessRateGreenShadeColor(row.successRate, mode) }]}>{formatPercent(row.successRate * 100)}</Text> },
    { key: "totalRuns", header: t("agents.table.runs"), width: 80, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.totalRuns)}</Text> },
    { key: "avgDurationMs", header: t("agents.table.avgDuration"), width: 100, align: "right", render: (row) => <Text style={ct.primary}>{formatDuration(row.avgDurationMs)}</Text> },
    { key: "totalCostUsd", header: t("agents.table.cost"), width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatCurrency(row.totalCostUsd)}</Text> },
    {
      key: "projectName", header: t("agents.table.project"), width: 160, render: (row) => (
        <CustomButton onPress={() => navigateTo("project", row.projectId)} accessibilityRole="link" accessibilityLabel={`View project ${row.projectName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.projectName}</Text>
        </CustomButton>
      ),
    },
  ], [ct, formatCurrency, mode, navigateTo, t]);

  return (
    <View ref={refFor("agent-performance")} nativeID="agent-performance" style={styles.section}>
      <SectionHeader title={t("agents.agentPerformance")} subtitle={t("agents.agentsWithActivity", { count: filteredAgents.length })} />
      <DataTable
        columns={agentCols}
        data={filteredAgents}
        initialSortBy="successRate"
        initialSortDirection="desc"
        keyExtractor={keyExtractors.byAgentId}
      />
    </View>
  );
});

interface AgentsProjectBreakdownSectionProps {
  data: AgentsHubResponse;
  navigateTo: AgentsNavigateTo;
  onCreateProject: () => void;
}

const AgentsProjectBreakdownSection = React.memo(function AgentsProjectBreakdownSection({
  data,
  navigateTo,
  onCreateProject,
}: AgentsProjectBreakdownSectionProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();
  const refFor = useSectionRef();
  const filteredProjects = useSearchFilter(data.projectBreakdown, PROJECT_SEARCH_KEYS);

  const projectCols = useMemo<ColumnDef<ProjectBreakdownRow>[]>(() => [
    {
      key: "projectName", header: t("agents.table.project"), width: 180, render: (row) => (
        <CustomButton onPress={() => navigateTo("project", row.projectId)} accessibilityRole="link" accessibilityLabel={`View project ${row.projectName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.projectName}</Text>
        </CustomButton>
      ),
    },
    { key: "successRate", header: t("agents.table.success"), width: 80, align: "right", render: (row) => <Text style={[ct.primary, { color: getSuccessRateGreenShadeColor(row.successRate, mode) }]}>{formatPercent(row.successRate * 100)}</Text> },
    { key: "totalRuns", header: t("agents.table.runs"), width: 80, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.totalRuns)}</Text> },
    { key: "totalCostUsd", header: t("agents.table.cost"), width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatCurrency(row.totalCostUsd)}</Text> },
    { key: "avgCostPerRunUsd", header: t("agents.table.avgPerRun"), width: 80, align: "right", render: (row) => <Text style={ct.primary}>{formatCurrency(row.avgCostPerRunUsd)}</Text> },
    { key: "agentCount", header: t("agents.table.agentCount"), width: 70, align: "right", render: (row) => <Text style={ct.primary}>{row.agentCount}</Text> },
    {
      key: "teamName", header: t("agents.table.team"), width: 130, render: (row) => (
        <CustomButton onPress={() => navigateTo("team", row.teamId)} accessibilityRole="link" accessibilityLabel={`View team ${row.teamName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.teamName}</Text>
        </CustomButton>
      ),
    },
  ], [ct, formatCurrency, mode, navigateTo, t]);

  return (
    <View ref={refFor("project-breakdown")} nativeID="project-breakdown" style={styles.section}>
      <View style={styles.sectionRow}>
        <View style={styles.sectionHeaderWrap}>
          <SectionHeader title={t("agents.projectBreakdown")} subtitle={t("agents.projectsActive", { active: data.activeProjects, total: data.totalProjects })} />
        </View>
        <CustomButton
          onPress={onCreateProject}
          style={styles.createButton}
          buttonMode="secondary"
          buttonSize="compact"
          label="+ Create Project"
          textStyle={styles.createButtonText}
          accessibilityRole="button"
          accessibilityLabel={t("modals.createProjectTitle")}
        />
      </View>
      <DataTable
        columns={projectCols}
        data={filteredProjects}
        initialSortBy="successRate"
        initialSortDirection="desc"
        keyExtractor={keyExtractors.byProjectId}
      />
    </View>
  );
});

interface AgentsRecentRunsSectionProps {
  data: AgentsHubResponse;
  navigateTo: AgentsNavigateTo;
}

const AgentsRecentRunsSection = React.memo(function AgentsRecentRunsSection({
  data,
  navigateTo,
}: AgentsRecentRunsSectionProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();
  const refFor = useSectionRef();
  const filteredRuns = useSearchFilter(data.recentRuns, RUN_SEARCH_KEYS);

  const agentMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const agent of data.agentBreakdown) {
      map[agent.agentId] = agent.agentName;
    }
    return map;
  }, [data.agentBreakdown]);

  const recentRunCols = useMemo<ColumnDef<RunListRow>[]>(() => [
    {
      key: "id", header: t("agents.table.runId"), width: 110, render: (row) => (
        <CustomButton onPress={() => navigateTo("run", row.id)} accessibilityRole="link" accessibilityLabel={`View run ${row.id}`}>
          <Text style={ct.link} numberOfLines={1}>{row.id}</Text>
        </CustomButton>
      ),
    },
    { key: "status", header: t("agents.table.status"), width: 100, render: (row) => <StatusBadge variant="run-status" status={row.status} /> },
    { key: "startedAtIso", header: t("agents.table.started"), width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.startedAtIso).toLocaleString()}</Text> },
    { key: "durationMs", header: t("agents.table.duration"), width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatDuration(row.durationMs)}</Text> },
    { key: "totalTokens", header: t("agents.table.tokens"), width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.totalTokens)}</Text> },
    { key: "costUsd", header: t("agents.table.cost"), width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatCurrency(row.costUsd)}</Text> },
    { key: "provider", header: t("agents.table.provider"), width: 80, align: "right" },
    {
      key: "agentId", header: t("agents.table.agent"), width: 160, render: (row) => (
        <CustomButton onPress={() => navigateTo("agent", row.agentId)} accessibilityRole="link" accessibilityLabel={`View agent ${agentMap[row.agentId] ?? row.agentId}`}>
          <Text style={ct.link} numberOfLines={1}>{agentMap[row.agentId] ?? row.agentId}</Text>
        </CustomButton>
      ),
    },
  ], [agentMap, ct, formatCurrency, navigateTo, t]);

  if (filteredRuns.length === 0) {
    return null;
  }

  return (
    <View ref={refFor("recent-runs")} nativeID="recent-runs" style={styles.section}>
      <SectionHeader title={t("agents.recentRuns")} subtitle={t("agents.latestRuns", { count: filteredRuns.length })} />
      <DataTable
        columns={recentRunCols}
        data={filteredRuns}
        keyExtractor={keyExtractors.byId}
        paginate
      />
    </View>
  );
});

// ─── Systems Section Group ──────────────────────────────
// A Systems-screen "section": a labeled group (Agents, Machine Learning) that
// bundles the detail sections for one class of intelligent system.

interface SystemSectionGroupProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const SystemSectionGroup = React.memo(function SystemSectionGroup({
  title,
  subtitle,
  children,
}: SystemSectionGroupProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <View style={localStyles.sectionGroup}>
      <View style={[localStyles.sectionGroupHeader, { borderLeftColor: theme.border.brand }]}>
        <Text style={[localStyles.sectionGroupTitle, { color: theme.text.primary }]}>{title}</Text>
        <Text style={[localStyles.sectionGroupSubtitle, { color: theme.text.secondary }]}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
});

// ─── Machine Learning Sections ──────────────────────────

interface MachineLearningSectionProps {
  data: MachineLearningResponse | undefined;
  loading: boolean;
}

const MlPerformanceSection = React.memo(function MlPerformanceSection({
  data,
  loading,
}: MachineLearningSectionProps) {
  const { t } = useTranslation();
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop" || bp === "tablet";
  const refFor = useSectionRef();

  const chartScrollProps = useMemo(() => ({
    horizontal: !isLargeLayout,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: [styles.chartRow, isLargeLayout && styles.chartRowFill],
  }), [isLargeLayout]);

  return (
    <View ref={refFor("ml-performance")} nativeID="ml-performance" style={styles.section}>
      <SectionHeader
        title={t("machineLearning.performance")}
        subtitle={t("machineLearning.performanceSubtitle")}
      />
      {loading ? (
        <CardGrid columns={4}>
          {SKELETON_4.map((_, i) => (
            <LoadingSkeleton key={i} variant="kpi" />
          ))}
        </CardGrid>
      ) : data ? (
        <>
          <CardGrid columns={4}>
            <KpiCard
              title={t("machineLearning.modelsInProduction")}
              value={`${data.modelsInProduction} / ${data.totalModels}`}
            />
            <KpiCard
              title={t("machineLearning.predictionsServed")}
              value={formatCompactNumber(data.predictionsServed24h)}
            />
            <KpiCard
              title={t("machineLearning.avgAccuracy")}
              value={formatPercent(data.avgModelAccuracy * 100)}
            />
            <KpiCard
              title={t("machineLearning.driftAlerts")}
              value={String(data.driftAlerts)}
            />
          </CardGrid>
          <CustomList scrollViewProps={chartScrollProps}>
            <ChartCard title={t("machineLearning.accuracyTrend")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <LineChart data={data.accuracyTrend} variant="percentages" xTickCount={4} />
            </ChartCard>
            <ChartCard title={t("machineLearning.predictionVolumeTrend")} style={isLargeLayout ? styles.chartCardFill : undefined}>
              <LineChart data={data.predictionVolumeTrend} variant="line" xTickCount={4} />
            </ChartCard>
          </CustomList>
        </>
      ) : null}
    </View>
  );
});

interface MachineLearningDataSectionProps {
  data: MachineLearningResponse;
}

const MlModelsSection = React.memo(function MlModelsSection({
  data,
}: MachineLearningDataSectionProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);
  const refFor = useSectionRef();

  const stageColor = (stage: MlModelStage): string => {
    switch (stage) {
      case "production": return theme.state.success;
      case "staging": return theme.state.warning;
      case "training": return theme.text.brand;
      case "retired": return theme.text.tertiary;
    }
  };

  const driftColor = (status: MlDriftStatus): string => {
    if (status === "critical") return theme.state.error;
    if (status === "drifting") return theme.state.warning;
    return theme.state.success;
  };

  const typeBreakdownData = useMemo<BarChartBreakdownDatum[]>(
    () => data.modelTypeBreakdown.map((entry) => ({
      key: entry.key,
      value: entry.value,
      hoverRows: [],
    })),
    [data.modelTypeBreakdown],
  );

  const modelCols = useMemo<ColumnDef<MlModelRow>[]>(() => [
    { key: "name", header: t("machineLearning.table.model"), width: 200, render: (row) => <Text style={ct.primary} numberOfLines={1}>{row.name}</Text> },
    { key: "modelType", header: t("machineLearning.table.type"), width: 150, render: (row) => <Text style={ct.secondary}>{t(`machineLearning.modelType.${row.modelType}`)}</Text> },
    { key: "stage", header: t("machineLearning.table.stage"), width: 110, render: (row) => <Text style={[ct.primary, { color: stageColor(row.stage) }]}>{t(`machineLearning.stage.${row.stage}`)}</Text> },
    { key: "version", header: t("machineLearning.table.version"), width: 90, render: (row) => <Text style={ct.secondary}>{row.version}</Text> },
    { key: "metricLabel", header: t("machineLearning.table.metric"), width: 130, render: (row) => <Text style={ct.secondary}>{row.metricLabel}</Text> },
    { key: "metricValue", header: t("machineLearning.table.score"), width: 90, align: "right", render: (row) => <Text style={[ct.primary, { color: getSuccessRateGreenShadeColor(row.metricValue, mode) }]}>{formatPercent(row.metricValue * 100)}</Text>, sortAccessor: (row) => row.metricValue },
    { key: "driftStatus", header: t("machineLearning.table.drift"), width: 100, render: (row) => <Text style={[ct.primary, { color: driftColor(row.driftStatus) }]}>{t(`machineLearning.drift.${row.driftStatus}`)}</Text> },
    { key: "predictionsServed", header: t("machineLearning.table.predictions"), width: 110, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.predictionsServed)}</Text> },
    { key: "p95LatencyMs", header: t("machineLearning.table.latency"), width: 100, align: "right", render: (row) => <Text style={ct.primary}>{row.p95LatencyMs > 0 ? formatDuration(row.p95LatencyMs) : "—"}</Text> },
    { key: "lastTrainedIso", header: t("machineLearning.table.lastTrained"), width: 130, render: (row) => <Text style={ct.secondary}>{new Date(row.lastTrainedIso).toLocaleDateString()}</Text> },
  ], [ct, mode, t, theme]);

  return (
    <View ref={refFor("ml-models")} nativeID="ml-models" style={styles.section}>
      <SectionHeader
        title={t("machineLearning.modelRegistry")}
        subtitle={t("machineLearning.modelRegistrySubtitle", { count: data.models.length })}
      />
      <ChartCard title={t("machineLearning.modelTypeBreakdown")}>
        <BarChart data={typeBreakdownData} variant="horizontal-bar" truncateLabels={false} />
      </ChartCard>
      <DataTable
        columns={modelCols}
        data={data.models}
        keyExtractor={keyExtractors.byId}
        initialSortBy="metricValue"
        initialSortDirection="desc"
      />
    </View>
  );
});

const MlTrainingSection = React.memo(function MlTrainingSection({
  data,
}: MachineLearningDataSectionProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const refFor = useSectionRef();

  const trainingCols = useMemo<ColumnDef<MlTrainingRunRow>[]>(() => [
    { key: "id", header: t("machineLearning.table.runId"), width: 110, render: (row) => <Text style={ct.primary} numberOfLines={1}>{row.id}</Text> },
    { key: "modelName", header: t("machineLearning.table.model"), width: 200, render: (row) => <Text style={ct.primary} numberOfLines={1}>{row.modelName}</Text> },
    { key: "status", header: t("machineLearning.table.status"), width: 110, render: (row) => <StatusBadge variant="run-status" status={row.status} /> },
    { key: "startedAtIso", header: t("machineLearning.table.started"), width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.startedAtIso).toLocaleString()}</Text> },
    { key: "durationMs", header: t("machineLearning.table.duration"), width: 100, align: "right", render: (row) => <Text style={ct.primary}>{row.durationMs > 0 ? formatDuration(row.durationMs) : "—"}</Text> },
    { key: "datasetSize", header: t("machineLearning.table.dataset"), width: 110, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.datasetSize)}</Text> },
    { key: "epochs", header: t("machineLearning.table.epochs"), width: 80, align: "right", render: (row) => <Text style={ct.primary}>{row.epochs}</Text> },
    { key: "metricValue", header: t("machineLearning.table.score"), width: 90, align: "right", render: (row) => <Text style={ct.primary}>{row.metricValue > 0 ? formatPercent(row.metricValue * 100) : "—"}</Text>, sortAccessor: (row) => row.metricValue },
  ], [ct, t]);

  return (
    <View ref={refFor("ml-training")} nativeID="ml-training" style={styles.section}>
      <SectionHeader
        title={t("machineLearning.trainingRuns")}
        subtitle={t("machineLearning.trainingRunsSubtitle", { count: data.trainingRuns.length })}
      />
      <DataTable
        columns={trainingCols}
        data={data.trainingRuns}
        keyExtractor={keyExtractors.byId}
      />
    </View>
  );
});

export default function SystemsScreen() {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useAgentsHub();
  const { data: mlData, loading: mlLoading } = useMachineLearning();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const navigateTo = useCallback(
    (entityType: AgentsEntityType, entityId: string) => {
      const tab = resolveTabFromPathname(pathnameRef.current);
      const route = buildEntityRoute(tab, entityType, entityId);
      router.push(route as never);
    },
    [router],
  );

  const handleOpenCreateAgent = useCallback(
    () => dispatch(openModal(ModalName.CreateAgent)),
    [dispatch],
  );

  const handleOpenCreateProject = useCallback(
    () => dispatch(openModal(ModalName.CreateProject)),
    [dispatch],
  );

  const handleOpenCreateEvaluation = useCallback(
    () => dispatch(openModal(ModalName.CreateEvaluation)),
    [dispatch],
  );

  const subtitle = useMemo(() => (data && mlData)
    ? t("systems.subtitleWithData", {
      agentCount: data.agentBreakdown.length,
      modelCount: mlData.totalModels,
    })
    : t("systems.subtitle"),
  [data, mlData, t],
  );

  const headerProps = useMemo(
    () => ({
      title: t("systems.title"),
      subtitle,
      isLoading: loading,
      rightComponent: (
        <CustomButton
          onPress={handleOpenCreateAgent}
          style={styles.createButton}
          buttonMode="secondary"
          buttonSize="compact"
          label={t("agents.createAgent")}
          textStyle={styles.createButtonText}
          accessibilityRole="button"
          accessibilityLabel={t("modals.createAgentTitle")}
        />
      ),
    }),
    [handleOpenCreateAgent, loading, subtitle, t],
  );

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

  return (
    <ScreenWrapper headerProps={headerProps}>
      <SystemSectionGroup
        title={t("systems.agentsGroupTitle")}
        subtitle={t("systems.agentsGroupSubtitle")}
      >
        <AgentsReliabilitySection data={data} loading={loading} />
        {data ? (
          <AgentsEvaluationsSection
            data={data}
            onCreateEvaluation={handleOpenCreateEvaluation}
            navigateTo={navigateTo}
          />
        ) : null}
        {data ? (
          <AgentsAgentPerformanceSection
            data={data}
            navigateTo={navigateTo}
          />
        ) : null}
        {data ? (
          <AgentsProjectBreakdownSection
            data={data}
            navigateTo={navigateTo}
            onCreateProject={handleOpenCreateProject}
          />
        ) : null}
        {data ? <AgentsRecentRunsSection data={data} navigateTo={navigateTo} /> : null}
      </SystemSectionGroup>
      <SystemSectionGroup
        title={t("systems.machineLearningGroupTitle")}
        subtitle={t("systems.machineLearningGroupSubtitle")}
      >
        <MlPerformanceSection data={mlData} loading={mlLoading} />
        {mlData ? <MlModelsSection data={mlData} /> : null}
        {mlData ? <MlTrainingSection data={mlData} /> : null}
      </SystemSectionGroup>
      <CreateAgentModal />
      <CreateProjectModal />
      <CreateEvaluationModal />
    </ScreenWrapper>
  );
}
