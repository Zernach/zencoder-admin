import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRunDetail } from "@/features/analytics/hooks/useRunDetail";
import { useAppDependencies } from "@/core/di/AppDependencies";
import {
  SectionHeader,
  KpiCard,
  CardGrid,
  StatusBadge,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/dashboard";
import {
  formatCurrency,
  formatDuration,
  formatCompactNumber,
} from "@/features/analytics/utils/formatters";
import { ScreenWrapper } from "@/components/screen";
import { spacing } from "@/theme/tokens";
import { DataTable, type ColumnDef } from "@/components/tables";
import {
  mapRunDetailToPromptChainViewModel,
  type PromptCostRow,
} from "@/features/analytics/mappers/runDetailMappers";

export default function RunDetailScreen() {
  const { runId } = useLocalSearchParams<{ runId: string }>();
  const { data, loading, error, refetch } = useRunDetail(runId ?? "");
  const { seedData } = useAppDependencies();

  const entityNames = useMemo(() => {
    if (!data) return null;
    const { run } = data;
    const team = seedData.teams.find((t) => t.id === run.teamId);
    const user = seedData.users.find((u) => u.id === run.userId);
    const project = seedData.projects.find((p) => p.id === run.projectId);
    const agent = seedData.agents.find((a) => a.id === run.agentId);
    return {
      teamName: team?.name ?? run.teamId,
      userName: user?.name ?? run.userId,
      projectName: project?.name ?? run.projectId,
      agentName: agent?.name ?? run.agentId,
    };
  }, [data, seedData]);

  const promptViewModel = useMemo(
    () => (data ? mapRunDetailToPromptChainViewModel(data) : null),
    [data]
  );

  const promptCostColumns: ColumnDef<PromptCostRow>[] = useMemo(
    () => [
      {
        key: "order",
        header: "#",
        width: 54,
        align: "center",
        render: (row) => <Text style={styles.tableText}>{row.order}</Text>,
      },
      {
        key: "role",
        header: "Role",
        width: 95,
        render: (row) => <Text style={styles.tableText}>{row.role}</Text>,
      },
      {
        key: "contextBefore",
        header: "Context Before",
        width: 120,
        align: "right",
        render: (row) => (
          <Text style={styles.tableText}>
            {formatCompactNumber(row.contextBefore)}
          </Text>
        ),
      },
      {
        key: "inputTokens",
        header: "Input Tokens",
        width: 105,
        align: "right",
        render: (row) => (
          <Text style={styles.tableText}>{formatCompactNumber(row.inputTokens)}</Text>
        ),
      },
      {
        key: "outputTokens",
        header: "Output Tokens",
        width: 110,
        align: "right",
        render: (row) => (
          <Text style={styles.tableText}>{formatCompactNumber(row.outputTokens)}</Text>
        ),
      },
      {
        key: "messageCostUsd",
        header: "Message Cost",
        width: 112,
        align: "right",
        render: (row) => (
          <Text style={styles.tableText}>{formatCurrency(row.messageCostUsd)}</Text>
        ),
      },
      {
        key: "cumulativeCostUsd",
        header: "Cumulative Cost",
        width: 124,
        align: "right",
        render: (row) => (
          <Text style={styles.tableText}>{formatCurrency(row.cumulativeCostUsd)}</Text>
        ),
      },
    ],
    []
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (loading) return <LoadingSkeleton variant="text" />;
  if (!data || !entityNames || !promptViewModel) return null;

  const { run, timeline, artifacts, policyContext, promptChainSummary } = data;
  const maxTrendContext = Math.max(
    1,
    ...promptViewModel.trend.map((point) => point.contextTokens)
  );
  const maxTrendCost = Math.max(
    0.01,
    ...promptViewModel.trend.map((point) => point.cumulativeCostUsd)
  );

  return (
    <ScreenWrapper
      headerProps={{
        title: `Run ${run.id}`,
        subtitle: `${entityNames.projectName} \u00B7 ${entityNames.agentName}`,
        rightComponent: <StatusBadge variant="run-status" status={run.status} />,
      }}
    >
      <View style={styles.section}>
        <SectionHeader title="Overview" />
        <CardGrid columns={4}>
          <KpiCard title="Duration" value={formatDuration(run.durationMs)} />
          <KpiCard title="Cost" value={formatCurrency(run.costUsd)} />
          <KpiCard
            title="Tokens"
            value={formatCompactNumber(run.totalTokens)}
            caption={`${formatCompactNumber(run.inputTokens)} in / ${formatCompactNumber(
              run.outputTokens
            )} out`}
          />
          <KpiCard title="Provider" value={`${run.provider} / ${run.modelId}`} />
        </CardGrid>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Context" />
        <CardGrid columns={4}>
          <KpiCard title="Project" value={entityNames.projectName} />
          <KpiCard title="Agent" value={entityNames.agentName} />
          <KpiCard title="Team" value={entityNames.teamName} />
          <KpiCard title="User" value={entityNames.userName} />
        </CardGrid>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Timeline" />
        <View style={styles.timeline}>
          {timeline.map((event, index) => (
            <View key={event.step} style={styles.timelineItem}>
              <View style={styles.dotColumn}>
                <View
                  style={[
                    styles.dot,
                    index === timeline.length - 1 &&
                      event.step === "completed" &&
                      (run.status === "succeeded"
                        ? styles.dotSuccess
                        : run.status === "failed"
                          ? styles.dotError
                          : undefined),
                  ]}
                />
                {index < timeline.length - 1 && <View style={styles.connector} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepLabel}>{event.step}</Text>
                <Text style={styles.stepDetail}>{event.detail}</Text>
                <Text style={styles.stepTime}>
                  {new Date(event.timestampIso).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Artifacts" />
        <CardGrid columns={3}>
          <KpiCard
            title="Lines Added"
            value={`+${artifacts.linesAdded.toLocaleString()}`}
          />
          <KpiCard
            title="Lines Removed"
            value={`-${artifacts.linesRemoved.toLocaleString()}`}
          />
          <KpiCard
            title="Tests"
            value={`${artifacts.testsPassed}/${artifacts.testsExecuted}`}
            caption={
              artifacts.prMerged
                ? "PR Merged"
                : artifacts.prCreated
                  ? "PR Created"
                  : "No PR"
            }
          />
        </CardGrid>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Prompt Chain Conversation"
          subtitle={`${promptChainSummary.totalMessages} messages in chronological order`}
        />
        {promptViewModel.conversation.length === 0 ? (
          <EmptyState message="Prompt chain unavailable for this run." />
        ) : (
          <View style={styles.promptConversation}>
            {promptViewModel.conversation.map((message) => (
              <View key={message.id} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <View style={styles.messageMeta}>
                    <Text style={styles.messageIndex}>#{message.order}</Text>
                    <View
                      style={[
                        styles.roleBadge,
                        message.role === "System"
                          ? styles.roleSystem
                          : message.role === "User"
                            ? styles.roleUser
                            : message.role === "Assistant"
                              ? styles.roleAssistant
                              : styles.roleTool,
                      ]}
                    >
                      <Text style={styles.roleText}>{message.role}</Text>
                    </View>
                  </View>
                  <Text style={styles.messageCost}>
                    {formatCurrency(message.messageCostUsd)}
                  </Text>
                </View>
                <Text style={styles.messageContent}>{message.contentPreview}</Text>
                <Text style={styles.messageStats}>
                  Context before {formatCompactNumber(message.contextBefore)} tokens,
                  input {formatCompactNumber(message.inputTokens)}, output{" "}
                  {formatCompactNumber(message.outputTokens)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Cost Growth by Context Window"
          subtitle={`Ballooning ratio ${promptViewModel.ballooningRatio.toFixed(1)}x from growing context`}
        />
        <Text style={styles.calloutText}>
          Later messages inherit larger context windows, so cost per message and
          cumulative spend rise as the chain progresses.
        </Text>
        <DataTable
          columns={promptCostColumns}
          data={promptViewModel.costRows}
          keyExtractor={(row) => row.id}
          emptyMessage="No prompt-chain cost rows available."
        />

        {promptViewModel.trend.length > 0 && (
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>
              Context and cumulative spend per message
            </Text>
            <View style={styles.trendRows}>
              {promptViewModel.trend.map((point) => (
                <View key={point.order} style={styles.trendRow}>
                  <Text style={styles.trendIndex}>#{point.order}</Text>
                  <View style={styles.trendBarTrack}>
                    <View
                      style={[
                        styles.trendBarContext,
                        {
                          width: `${Math.max(
                            4,
                            (point.contextTokens / maxTrendContext) * 100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.trendBarTrack}>
                    <View
                      style={[
                        styles.trendBarCost,
                        {
                          width: `${Math.max(
                            4,
                            (point.cumulativeCostUsd / maxTrendCost) * 100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.trendValue}>
                    {formatCurrency(point.cumulativeCostUsd)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.trendLegend}>
              <Text style={styles.trendLegendText}>
                Blue: context tokens after message
              </Text>
              <Text style={styles.trendLegendText}>Green: cumulative spend</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Policy Context" />
        <View style={styles.policyCard}>
          <View style={styles.policyRow}>
            <Text style={styles.policyKey}>Network Mode</Text>
            <View
              style={[
                styles.policyBadge,
                policyContext.networkMode === "full"
                  ? styles.badgeSuccess
                  : policyContext.networkMode === "limited"
                    ? styles.badgeWarning
                    : styles.badgeError,
              ]}
            >
              <Text style={styles.policyBadgeText}>{policyContext.networkMode}</Text>
            </View>
          </View>
          <View style={styles.policyRow}>
            <Text style={styles.policyKey}>Allowed Actions</Text>
            <Text style={styles.policyValue}>
              {policyContext.allowedActions.join(", ")}
            </Text>
          </View>
          <View style={styles.policyRow}>
            <Text style={styles.policyKey}>Blocked Actions</Text>
            <Text style={[styles.policyValue, styles.blockedText]}>
              {policyContext.blockedActions.join(", ")}
            </Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[3] },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", gap: 12 },
  dotColumn: { alignItems: "center", width: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#30a8dc", marginTop: 5 },
  dotSuccess: { backgroundColor: "#22c55e" },
  dotError: { backgroundColor: "#ef4444" },
  connector: { width: 2, flex: 1, backgroundColor: "#2d2d2d", marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  stepLabel: { fontSize: 13, fontWeight: "600", color: "#e5e5e5", textTransform: "capitalize" },
  stepDetail: { fontSize: 12, color: "#a3a3a3", marginTop: 2 },
  stepTime: { fontSize: 11, color: "#8a8a8a", marginTop: 2 },
  promptConversation: { gap: 10 },
  messageCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#242424",
    padding: 12,
    gap: 6,
  },
  messageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  messageMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  messageIndex: { color: "#8a8a8a", fontSize: 11, fontWeight: "600" },
  roleBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  roleSystem: { backgroundColor: "rgba(14, 116, 144, 0.22)" },
  roleUser: { backgroundColor: "rgba(30, 64, 175, 0.22)" },
  roleAssistant: { backgroundColor: "rgba(22, 101, 52, 0.24)" },
  roleTool: { backgroundColor: "rgba(146, 64, 14, 0.24)" },
  roleText: {
    color: "#d4d4d8",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  messageCost: { color: "#67c4ea", fontSize: 12, fontWeight: "600" },
  messageContent: { color: "#e5e5e5", fontSize: 12, lineHeight: 18 },
  messageStats: { color: "#a3a3a3", fontSize: 11 },
  tableText: { color: "#e5e5e5", fontSize: 12 },
  calloutText: { color: "#a3a3a3", fontSize: 12, lineHeight: 18 },
  trendCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#242424",
    padding: 12,
    gap: 10,
  },
  trendTitle: { color: "#e5e5e5", fontSize: 13, fontWeight: "600" },
  trendRows: { gap: 8 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  trendIndex: { width: 26, color: "#a3a3a3", fontSize: 11 },
  trendBarTrack: { flex: 1, height: 8, borderRadius: 6, backgroundColor: "#222" },
  trendBarContext: { height: "100%", borderRadius: 6, backgroundColor: "#30a8dc" },
  trendBarCost: { height: "100%", borderRadius: 6, backgroundColor: "#22c55e" },
  trendValue: {
    width: 72,
    textAlign: "right",
    color: "#d4d4d8",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  trendLegend: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  trendLegendText: { color: "#8a8a8a", fontSize: 10 },
  policyCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#242424",
  },
  policyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  policyKey: { fontSize: 12, color: "#8a8a8a", fontWeight: "500" },
  policyValue: { fontSize: 12, color: "#a3a3a3", flex: 1, textAlign: "right" },
  blockedText: { color: "#ef4444" },
  policyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeSuccess: { backgroundColor: "rgba(34, 197, 94, 0.15)" },
  badgeWarning: { backgroundColor: "rgba(245, 158, 11, 0.15)" },
  badgeError: { backgroundColor: "rgba(239, 68, 68, 0.15)" },
  policyBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#e5e5e5",
    textTransform: "uppercase",
  },
});
