import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { CustomButton } from "@/components/buttons";
import { CustomList } from "@/components/lists";
import { useAgentsHub } from "@/features/analytics/hooks/useAgentsHub";
import { SectionHeader, CardGrid, LoadingSkeleton, ErrorState, StatusBadge } from "@/components/dashboard";
import { ChartCard, LineChart, BarChart, type BarChartBreakdownDatum } from "@/components/charts";
import { DataTable, type ColumnDef, cellText, getSuccessRateGreenShadeColor } from "@/components/tables";
import { formatPercent, formatDuration, formatCompactNumber } from "@/features/analytics/utils/formatters";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import type { AgentBreakdownRow, ProjectBreakdownRow, RunListRow } from "@/features/analytics/types";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { CreateProjectModal } from "@/features/analytics/components/CreateProjectModal";
import { CreateAgentModal } from "@/features/analytics/components/CreateAgentModal";
import { useThemeMode } from "@/providers/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { keyExtractors } from "@/constants";
import { buildEntityRoute, resolveTabFromPathname } from "@/constants/routes";
import { useAppDispatch, openModal, ModalName } from "@/store";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const styles = sectionStyles;

const SKELETON_4 = Array.from({ length: 4 });

const AGENT_SEARCH_KEYS: (keyof AgentBreakdownRow)[] = ["agentName", "projectName"];
const PROJECT_SEARCH_KEYS: (keyof ProjectBreakdownRow)[] = ["projectName", "teamName"];
const RUN_SEARCH_KEYS: (keyof RunListRow)[] = ["id", "status", "provider"];

export default function AgentsScreen() {
  const { t } = useTranslation();
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop" || bp === "tablet";
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const { data, loading, error, refetch } = useAgentsHub();
  const { formatCurrency } = useCurrencyFormatter();
  const refFor = useSectionRef();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const failureCategoryData = useMemo<BarChartBreakdownDatum[]>(() =>
    (data?.failureCategoryBreakdown ?? []).map((cat) => ({
      key: cat.key,
      value: cat.value,
      hoverRows: cat.agentBreakdown.map((a) => ({
        label: a.key,
        value: formatCompactNumber(a.value),
      })),
    })),
    [data?.failureCategoryBreakdown],
  );

  const filteredAgents = useSearchFilter(data?.agentBreakdown ?? [], AGENT_SEARCH_KEYS);
  const filteredProjects = useSearchFilter(data?.projectBreakdown ?? [], PROJECT_SEARCH_KEYS);
  const filteredRuns = useSearchFilter(data?.recentRuns ?? [], RUN_SEARCH_KEYS);

  const navigateTo = useCallback(
    (entityType: "agent" | "project" | "team" | "human" | "run", entityId: string) => {
      const tab = resolveTabFromPathname(pathname);
      const route = buildEntityRoute(tab, entityType, entityId);
      router.push(route as never);
    },
    [pathname, router],
  );

  const agentCols = useMemo<ColumnDef<AgentBreakdownRow>[]>(() => [
    {
      key: "agentName", header: t("agents.table.agent"), width: 160, render: (row) => (
        <CustomButton onPress={() => navigateTo("agent", row.agentId)} accessibilityRole="link" accessibilityLabel={`View agent ${row.agentName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.agentName}</Text>
        </CustomButton>
      )
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
      )
    },
  ], [ct, mode, navigateTo, t]);

  const projectCols = useMemo<ColumnDef<ProjectBreakdownRow>[]>(() => [
    {
      key: "projectName", header: t("agents.table.project"), width: 180, render: (row) => (
        <CustomButton onPress={() => navigateTo("project", row.projectId)} accessibilityRole="link" accessibilityLabel={`View project ${row.projectName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.projectName}</Text>
        </CustomButton>
      )
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
      )
    },
  ], [ct, mode, navigateTo, t]);

  const agentMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of data?.agentBreakdown ?? []) map[a.agentId] = a.agentName;
    return map;
  }, [data?.agentBreakdown]);

  const recentRunCols = useMemo<ColumnDef<RunListRow>[]>(() => [
    {
      key: "id", header: t("agents.table.runId"), width: 110, render: (row) => (
        <CustomButton onPress={() => navigateTo("run", row.id)} accessibilityRole="link" accessibilityLabel={`View run ${row.id}`}>
          <Text style={ct.link} numberOfLines={1}>{row.id}</Text>
        </CustomButton>
      )
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
      )
    },
  ], [agentMap, ct, navigateTo, t]);

  const handleOpenCreateAgent = useCallback(
    () => dispatch(openModal(ModalName.CreateAgent)),
    [dispatch],
  );

  const handleOpenCreateProject = useCallback(
    () => dispatch(openModal(ModalName.CreateProject)),
    [dispatch],
  );

  const subtitle = useMemo(() => data
    ? t("agents.subtitleWithData", { successRate: formatPercent(data.runSuccessRate * 100), p50Duration: formatDuration(data.p50RunDurationMs), agentCount: data.agentBreakdown.length })
    : t("agents.subtitle"),
    [data, t],
  );

  const headerProps = useMemo(
    () => ({ title: t("navigation.agents"), subtitle, isLoading: loading }),
    [subtitle, loading, t],
  );

  const chartScrollProps = useMemo(() => ({
    horizontal: !isLargeLayout,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: [styles.chartRow, isLargeLayout && styles.chartRowFill],
  }), [isLargeLayout]);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <ScreenWrapper headerProps={headerProps}
    >
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

      {data && (
        <View ref={refFor("agent-performance")} nativeID="agent-performance" style={styles.section}>
          <View style={localStyles.sectionRow}>
            <View style={localStyles.sectionHeaderWrap}>
              <SectionHeader title={t("agents.agentPerformance")} subtitle={t("agents.agentsWithActivity", { count: filteredAgents.length })} />
            </View>
            <CustomButton
              onPress={handleOpenCreateAgent}
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label={t("agents.createAgent")}
              textStyle={localStyles.createButtonText}
              accessibilityRole="button"
              accessibilityLabel={t("modals.createAgentTitle")}
            />
          </View>
          <DataTable
            columns={agentCols}
            data={filteredAgents}
            initialSortBy="successRate"
            initialSortDirection="desc"
            keyExtractor={keyExtractors.byAgentId}
          />
        </View>
      )}

      {data && (
        <View ref={refFor("project-breakdown")} nativeID="project-breakdown" style={styles.section}>
          <View style={localStyles.sectionRow}>
            <View style={localStyles.sectionHeaderWrap}>
              <SectionHeader title={t("agents.projectBreakdown")} subtitle={t("agents.projectsActive", { active: data.activeProjects, total: data.totalProjects })} />
            </View>
            <CustomButton
              onPress={handleOpenCreateProject}
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label="+ Create Project"
              textStyle={localStyles.createButtonText}
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
      )}

      {data && filteredRuns.length > 0 && (
        <View ref={refFor("recent-runs")} nativeID="recent-runs" style={styles.section}>
          <SectionHeader title={t("agents.recentRuns")} subtitle={t("agents.latestRuns", { count: formatCompactNumber(filteredRuns.length) })} />
          <DataTable
            columns={recentRunCols}
            data={filteredRuns}
            keyExtractor={keyExtractors.byId}
            paginate
          />
        </View>
      )}
      <CreateAgentModal />
      <CreateProjectModal />
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing[8],
  },
  sectionHeaderWrap: {
    flex: 1,
    minWidth: 0,
  },
  createButton: {
    marginLeft: "auto",
    flexShrink: 0,
    maxWidth: "100%",
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
