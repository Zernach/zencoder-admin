import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useAgentsHub } from "@/features/analytics/hooks/useAgentsHub";
import { SectionHeader, CardGrid, KpiCard, LoadingSkeleton, ErrorState, StatusBadge } from "@/components/dashboard";
import { ChartCard, TrendChart, BreakdownChart } from "@/components/charts";
import { DataTable, type ColumnDef, cellText, getSuccessRateColor, chartColors } from "@/components/tables";
import { formatPercent, formatDuration, formatCurrency, formatCompactNumber } from "@/features/analytics/utils/formatters";
import type { AgentBreakdownRow, ProjectBreakdownRow, RunListRow } from "@/features/analytics/types";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";

const styles = sectionStyles;

const agentCols: ColumnDef<AgentBreakdownRow>[] = [
  { key: "agentName", header: "Agent", width: 160 },
  { key: "projectName", header: "Project", width: 160, render: (row) => <Text style={cellText.secondary} numberOfLines={1}>{row.projectName}</Text> },
  { key: "totalRuns", header: "Runs", width: 80, align: "right", render: (row) => <Text style={cellText.primary}>{formatCompactNumber(row.totalRuns)}</Text> },
  { key: "successRate", header: "Success", width: 80, align: "right", render: (row) => <Text style={[cellText.primary, { color: getSuccessRateColor(row.successRate) }]}>{formatPercent(row.successRate * 100)}</Text> },
  { key: "avgDurationMs", header: "Avg Duration", width: 100, align: "right", render: (row) => <Text style={cellText.primary}>{formatDuration(row.avgDurationMs)}</Text> },
  { key: "totalCostUsd", header: "Cost", width: 90, align: "right", render: (row) => <Text style={cellText.primary}>{formatCurrency(row.totalCostUsd)}</Text> },
];

const projectCols: ColumnDef<ProjectBreakdownRow>[] = [
  { key: "projectName", header: "Project", width: 180 },
  { key: "teamName", header: "Team", width: 130, render: (row) => <Text style={cellText.secondary} numberOfLines={1}>{row.teamName}</Text> },
  { key: "totalRuns", header: "Runs", width: 80, align: "right", render: (row) => <Text style={cellText.primary}>{formatCompactNumber(row.totalRuns)}</Text> },
  { key: "successRate", header: "Success", width: 80, align: "right", render: (row) => <Text style={[cellText.primary, { color: getSuccessRateColor(row.successRate) }]}>{formatPercent(row.successRate * 100)}</Text> },
  { key: "totalCostUsd", header: "Cost", width: 90, align: "right", render: (row) => <Text style={cellText.primary}>{formatCurrency(row.totalCostUsd)}</Text> },
  { key: "avgCostPerRunUsd", header: "Avg/Run", width: 80, align: "right", render: (row) => <Text style={cellText.secondary}>{formatCurrency(row.avgCostPerRunUsd)}</Text> },
  { key: "agentCount", header: "Agents", width: 70, align: "right", render: (row) => <Text style={cellText.secondary}>{row.agentCount}</Text> },
];

const recentRunCols: ColumnDef<RunListRow>[] = [
  { key: "id", header: "Run ID", width: 110, render: (row) => <Text style={cellText.brand} numberOfLines={1}>{row.id}</Text> },
  { key: "status", header: "Status", width: 100, render: (row) => <StatusBadge variant="run-status" status={row.status} /> },
  { key: "startedAtIso", header: "Started", width: 160, render: (row) => <Text style={cellText.primary}>{new Date(row.startedAtIso).toLocaleString()}</Text> },
  { key: "durationMs", header: "Duration", width: 90, align: "right", render: (row) => <Text style={cellText.primary}>{formatDuration(row.durationMs)}</Text> },
  { key: "totalTokens", header: "Tokens", width: 90, align: "right", render: (row) => <Text style={cellText.primary}>{formatCompactNumber(row.totalTokens)}</Text> },
  { key: "costUsd", header: "Cost", width: 90, align: "right", render: (row) => <Text style={cellText.primary}>{formatCurrency(row.costUsd)}</Text> },
  { key: "provider", header: "Provider", width: 80 },
];

const AGENT_SEARCH_KEYS: (keyof AgentBreakdownRow)[] = ["agentName", "projectName"];
const PROJECT_SEARCH_KEYS: (keyof ProjectBreakdownRow)[] = ["projectName", "teamName"];
const RUN_SEARCH_KEYS: (keyof RunListRow)[] = ["id", "status", "provider"];

export default function AgentsScreen() {
  const { data, loading, error, refetch } = useAgentsHub();
  const filteredAgents = useSearchFilter(data?.agentBreakdown ?? [], AGENT_SEARCH_KEYS);
  const filteredProjects = useSearchFilter(data?.projectBreakdown ?? [], PROJECT_SEARCH_KEYS);
  const filteredRuns = useSearchFilter(data?.recentRuns ?? [], RUN_SEARCH_KEYS);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const subtitle = data
    ? `${formatPercent(data.runSuccessRate * 100)} success rate, P50 ${formatDuration(data.p50RunDurationMs)}, ${data.agentBreakdown.length} agents active`
    : "Agent reliability and performance";

  return (
    <ScreenWrapper
      headerProps={{
        title: "Agents",
        subtitle,
        isLoading: loading,
      }}
    >
      <View style={styles.section}>
        <SectionHeader title="Reliability" />
        {loading ? (
          <CardGrid columns={4}>
            {Array.from({ length: 4 }).map((_, i) => (
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartRow}
            >
              <ChartCard title="Reliability Trend">
                <TrendChart data={data.reliabilityTrend} variant="line" color={chartColors.success} />
              </ChartCard>
              <ChartCard title="Failure Categories">
                <BreakdownChart
                  data={data.failureCategoryBreakdown}
                  variant="horizontal-bar"
                  truncateLabels={false}
                />
              </ChartCard>
            </ScrollView>
          </>
        ) : null}
      </View>

      {data && (
        <View style={styles.section}>
          <SectionHeader title="Agent Performance" subtitle={`${filteredAgents.length} agents with activity`} />
          <DataTable
            columns={agentCols}
            data={filteredAgents}
            keyExtractor={(row) => row.agentId}
          />
        </View>
      )}

      {data && (
        <View style={styles.section}>
          <SectionHeader title="Project Breakdown" subtitle={`${data.activeProjects} of ${data.totalProjects} projects active`} />
          <CardGrid columns={3}>
            <KpiCard title="Active Projects" value={formatCompactNumber(data.activeProjects)} caption={`of ${data.totalProjects} total`} />
            <KpiCard title="Success Rate" value={formatPercent(data.overallSuccessRate * 100)} />
            <KpiCard title="Total Cost" value={formatCurrency(data.totalCostUsd)} />
          </CardGrid>
          <DataTable
            columns={projectCols}
            data={filteredProjects}
            keyExtractor={(row) => row.projectId}
          />
        </View>
      )}

      {data && filteredRuns.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Recent Runs" subtitle={`Latest ${filteredRuns.length} runs`} />
          <DataTable
            columns={recentRunCols}
            data={filteredRuns}
            keyExtractor={(row) => row.id}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}
