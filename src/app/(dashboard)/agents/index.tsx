import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { CustomButton } from "@/components/buttons";
import { CustomList } from "@/components/lists";
import { useAgentsHub } from "@/features/analytics/hooks/useAgentsHub";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState, StatusBadge } from "@/components/dashboard";
import { ChartCard, LineChart, BreakdownChart } from "@/components/charts";
import { DataTable, type ColumnDef, cellText, getSuccessRateGreenShadeColor } from "@/components/tables";
import { formatPercent, formatDuration, formatCurrency, formatCompactNumber } from "@/features/analytics/utils/formatters";
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
  const bp = useBreakpoint();
  const isLargeLayout = bp === "desktop";
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const { data, loading, error, refetch } = useAgentsHub();
  const refFor = useSectionRef();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

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
    { key: "agentName", header: "Agent", width: 160, render: (row) => (
      <CustomButton onPress={() => navigateTo("agent", row.agentId)} accessibilityRole="link" accessibilityLabel={`View agent ${row.agentName}`}>
        <Text style={ct.link} numberOfLines={1}>{row.agentName}</Text>
      </CustomButton>
    ) },
    { key: "projectName", header: "Project", width: 160, render: (row) => (
      <CustomButton onPress={() => navigateTo("project", row.projectId)} accessibilityRole="link" accessibilityLabel={`View project ${row.projectName}`}>
        <Text style={ct.link} numberOfLines={1}>{row.projectName}</Text>
      </CustomButton>
    ) },
    { key: "successRate", header: "Success", width: 80, align: "right", render: (row) => <Text style={[ct.primary, { color: getSuccessRateGreenShadeColor(row.successRate, mode) }]}>{formatPercent(row.successRate * 100)}</Text> },
    { key: "totalRuns", header: "Runs", width: 80, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.totalRuns)}</Text> },
    { key: "avgDurationMs", header: "Avg Duration", width: 100, align: "right", render: (row) => <Text style={ct.primary}>{formatDuration(row.avgDurationMs)}</Text> },
    { key: "totalCostUsd", header: "Cost", width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatCurrency(row.totalCostUsd)}</Text> },
  ], [ct, mode, navigateTo]);

  const projectCols = useMemo<ColumnDef<ProjectBreakdownRow>[]>(() => [
    { key: "projectName", header: "Project", width: 180, render: (row) => (
      <CustomButton onPress={() => navigateTo("project", row.projectId)} accessibilityRole="link" accessibilityLabel={`View project ${row.projectName}`}>
        <Text style={ct.link} numberOfLines={1}>{row.projectName}</Text>
      </CustomButton>
    ) },
    { key: "teamName", header: "Team", width: 130, render: (row) => (
      <CustomButton onPress={() => navigateTo("team", row.teamId)} accessibilityRole="link" accessibilityLabel={`View team ${row.teamName}`}>
        <Text style={ct.link} numberOfLines={1}>{row.teamName}</Text>
      </CustomButton>
    ) },
    { key: "successRate", header: "Success", width: 80, align: "right", render: (row) => <Text style={[ct.primary, { color: getSuccessRateGreenShadeColor(row.successRate, mode) }]}>{formatPercent(row.successRate * 100)}</Text> },
    { key: "totalRuns", header: "Runs", width: 80, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.totalRuns)}</Text> },
    { key: "totalCostUsd", header: "Cost", width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatCurrency(row.totalCostUsd)}</Text> },
    { key: "avgCostPerRunUsd", header: "Avg/Run", width: 80, align: "right", render: (row) => <Text style={ct.primary}>{formatCurrency(row.avgCostPerRunUsd)}</Text> },
    { key: "agentCount", header: "Agents", width: 70, align: "right", render: (row) => <Text style={ct.primary}>{row.agentCount}</Text> },
  ], [ct, mode, navigateTo]);

  const recentRunCols = useMemo<ColumnDef<RunListRow>[]>(() => [
    { key: "id", header: "Run ID", width: 110, render: (row) => (
      <CustomButton onPress={() => navigateTo("run", row.id)} accessibilityRole="link" accessibilityLabel={`View run ${row.id}`}>
        <Text style={ct.link} numberOfLines={1}>{row.id}</Text>
      </CustomButton>
    ) },
    { key: "status", header: "Status", width: 100, render: (row) => <StatusBadge variant="run-status" status={row.status} /> },
    { key: "startedAtIso", header: "Started", width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.startedAtIso).toLocaleString()}</Text> },
    { key: "durationMs", header: "Duration", width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatDuration(row.durationMs)}</Text> },
    { key: "totalTokens", header: "Tokens", width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.totalTokens)}</Text> },
    { key: "costUsd", header: "Cost", width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatCurrency(row.costUsd)}</Text> },
    { key: "provider", header: "Provider", width: 80, align: "right" },
  ], [ct, navigateTo]);

  const handleOpenCreateAgent = useCallback(
    () => dispatch(openModal(ModalName.CreateAgent)),
    [dispatch],
  );

  const handleOpenCreateProject = useCallback(
    () => dispatch(openModal(ModalName.CreateProject)),
    [dispatch],
  );

  const subtitle = useMemo(() => data
    ? `${formatPercent(data.runSuccessRate * 100)} success rate, P50 ${formatDuration(data.p50RunDurationMs)}, ${data.agentBreakdown.length} agents active`
    : "Agent reliability and performance",
    [data],
  );

  const headerProps = useMemo(
    () => ({ title: "Agents", subtitle, isLoading: loading }),
    [subtitle, loading],
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
        <SectionHeader title="Reliability" />
        {loading ? (
          <CardGrid columns={4}>
            {SKELETON_4.map((_, i) => (
              <LoadingSkeleton key={i} variant="kpi" />
            ))}
          </CardGrid>
        ) : data ? (
          <>
            <CardGrid columns={4}>
              <KpiCard title="Success Rate" value={formatPercent(data.runSuccessRate * 100)} />
              <KpiCard title="Error Rate" value={formatPercent(data.errorRate * 100)} deltaPolarity="negative-good" />
              <KpiCard title="P50 Duration" value={formatDuration(data.p50RunDurationMs)} />
              <KpiCard title="P95 Duration" value={formatDuration(data.p95RunDurationMs)} />
            </CardGrid>
            <CardGrid columns={2}>
              <KpiCard title="P95 Queue Wait" value={formatDuration(data.p95QueueWaitMs)} caption="Queue wait time" />
              <KpiCard title="Peak Concurrency" value={formatCompactNumber(data.peakConcurrency)} caption="Max concurrent runs/min" />
            </CardGrid>
            <CustomList scrollViewProps={chartScrollProps}>
              <ChartCard title="Reliability Trend" style={isLargeLayout ? styles.chartCardFill : undefined}>
                <LineChart
                  data={data.reliabilityTrend}
                  variant="percentages"
                  xTickCount={4}
                />
              </ChartCard>
              <ChartCard title="Failure Categories" style={isLargeLayout ? styles.chartCardFill : undefined}>
                <BreakdownChart
                  data={data.failureCategoryBreakdown}
                  variant="horizontal-bar"
                  truncateLabels={false}
                />
              </ChartCard>
            </CustomList>
          </>
        ) : null}
      </View>

      {data && (
        <View ref={refFor("agent-performance")} nativeID="agent-performance" style={styles.section}>
          <View style={localStyles.sectionRow}>
            <View style={localStyles.sectionHeaderWrap}>
              <SectionHeader title="Agent Performance" subtitle={`${filteredAgents.length} agents with activity`} />
            </View>
            <CustomButton
              onPress={handleOpenCreateAgent}
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label="+ Create Agent"
              textStyle={localStyles.createButtonText}
              accessibilityRole="button"
              accessibilityLabel="Create Agent"
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
              <SectionHeader title="Project Breakdown" subtitle={`${data.activeProjects} of ${data.totalProjects} projects active`} />
            </View>
            <CustomButton
              onPress={handleOpenCreateProject}
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label="+ Create Project"
              textStyle={localStyles.createButtonText}
              accessibilityRole="button"
              accessibilityLabel="Create Project"
            />
          </View>
          <CardGrid columns={3}>
            <KpiCard title="Active Projects" value={formatCompactNumber(data.activeProjects)} caption={`of ${data.totalProjects} total`} />
            <KpiCard title="Success Rate" value={formatPercent(data.overallSuccessRate * 100)} />
            <KpiCard title="Total Cost" value={formatCurrency(data.totalCostUsd)} />
          </CardGrid>
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
          <SectionHeader title="Recent Runs" subtitle={`Latest ${filteredRuns.length} runs`} />
          <DataTable
            columns={recentRunCols}
            data={filteredRuns}
            keyExtractor={keyExtractors.byId}
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
