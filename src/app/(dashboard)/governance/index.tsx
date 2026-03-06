import React, { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { useCreateComplianceViolationRule } from "@/features/analytics/hooks/useCreateComplianceViolationRule";
import { useCreateHuman } from "@/features/analytics/hooks/useCreateHuman";
import { CreateComplianceRuleForm } from "@/features/analytics/components/CreateComplianceRuleForm";
import { CreateHumanForm } from "@/features/analytics/components/CreateHumanForm";
import { SectionHeader, CardGrid, KpiCard, StatusBadge, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, BreakdownChart } from "@/components/charts";
import { DataTable, type ColumnDef, cellText } from "@/components/tables";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import type { PolicyViolationRow, SecurityEventRow, PolicyChangeEvent, ComplianceItem, SeatUserUsageRow, KeyValueMetric } from "@/features/analytics/types";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing } from "@/theme/tokens";

const VIOLATION_SEARCH_KEYS: (keyof PolicyViolationRow)[] = ["agentName", "reason", "severity"];
const SECURITY_SEARCH_KEYS: (keyof SecurityEventRow)[] = ["type", "description"];
const SEAT_SEARCH_KEYS: (keyof SeatUserUsageRow)[] = ["fullName", "teamName"];
const POLICY_CHANGE_SEARCH_KEYS: (keyof PolicyChangeEvent)[] = ["action", "target"];

function getComplianceCaption(status: ComplianceItem["status"]): string {
  if (status === "compliant") return "Passing";
  if (status === "warning") return "Attention needed";
  return "Immediate action required";
}

export default function GovernanceScreen() {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);
  const { data, loading, error, refetch } = useGovernanceDashboard();
  const { create: createRule, loading: createLoading } = useCreateComplianceViolationRule();
  const { create: createHuman, loading: createHumanLoading, error: createHumanError } = useCreateHuman();
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showCreateSeat, setShowCreateSeat] = useState(false);

  const handleCreateRule = useCallback(
    async (values: { name: string; description: string; severity: "HIGH" | "MEDIUM" | "LOW" }) => {
      await createRule(values);
      setShowCreateRule(false);
      refetch();
    },
    [createRule, refetch],
  );

  const handleCreateSeat = useCallback(
    async (values: { name: string; email: string; teamId: string }) => {
      await createHuman(values);
      setShowCreateSeat(false);
      refetch();
    },
    [createHuman, refetch],
  );

  const filteredViolations = useSearchFilter(data?.recentViolations ?? [], VIOLATION_SEARCH_KEYS);
  const filteredSecurityEvents = useSearchFilter(data?.securityEvents ?? [], SECURITY_SEARCH_KEYS);
  const filteredSeatUsers = useSearchFilter(data?.seatUserUsage ?? [], SEAT_SEARCH_KEYS);
  const filteredPolicyChanges = useSearchFilter(data?.policyChanges ?? [], POLICY_CHANGE_SEARCH_KEYS);

  const COMPLIANCE_STATUS_COLORS: Record<ComplianceItem["status"], string> = {
    compliant: theme.state.success,
    warning: theme.state.warning,
    critical: theme.state.error,
  };

  const violationCols = useMemo<ColumnDef<PolicyViolationRow>[]>(() => [
    { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    { key: "agentName", header: "Agent", width: 140 },
    { key: "reason", header: "Reason", width: 180 },
    { key: "severity", header: "Severity", width: 90, render: (row) => <StatusBadge variant="severity" severity={row.severity} /> },
  ], [ct]);

  const securityCols = useMemo<ColumnDef<SecurityEventRow>[]>(() => [
    { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    { key: "type", header: "Type", width: 160 },
    { key: "description", header: "Description" },
  ], [ct]);

  const seatUsageCols = useMemo<ColumnDef<SeatUserUsageRow>[]>(() => [
    { key: "fullName", header: "Full Name", width: 220 },
    { key: "teamName", header: "Team", width: 180 },
    { key: "runsCount", header: "Runs", width: 90, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.runsCount)}</Text> },
    { key: "totalTokens", header: "Tokens", width: 120, align: "right", render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.totalTokens)}</Text> },
    { key: "totalCostUsd", header: "Cost", width: 100, align: "right", render: (row) => <Text style={ct.primary}>${row.totalCostUsd.toFixed(2)}</Text> },
  ], [ct]);

  const policyChangeCols = useMemo<ColumnDef<PolicyChangeEvent>[]>(() => [
    { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    { key: "actorName", header: "Actor", width: 140, render: (row) => <Text style={ct.primary} numberOfLines={1}>{row.actorName}</Text> },
    { key: "action", header: "Action", width: 220 },
    { key: "target", header: "Target", width: 130 },
  ], [ct]);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const subtitle = data
    ? `${data.policyViolationCount} violations, ${data.securityEvents.length} security events`
    : "Policy enforcement and security monitoring";

  const mostActiveSeatUser = data?.seatUserUsage[0];
  const leastActiveSeatUser = data?.seatUserUsage.length
    ? data.seatUserUsage[data.seatUserUsage.length - 1]
    : undefined;

  const seatUsageChartData: KeyValueMetric[] = useMemo(() => {
    if (!data?.seatUserUsage) return [];
    return data.seatUserUsage.map((row) => ({
      key: row.fullName,
      value: row.runsCount,
    }));
  }, [data?.seatUserUsage]);

  return (
    <ScreenWrapper
      headerProps={{
        title: "Governance & Compliance",
        subtitle,
        isLoading: loading,
      }}
    >
      <View nativeID="overview" style={sectionStyles.section}>
        <SectionHeader title="Overview" />
        {loading ? (
          <CardGrid columns={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="kpi" />
            ))}
          </CardGrid>
        ) : data ? (
          <>
            <CardGrid columns={4}>
              <KpiCard title="Violations" value={formatCompactNumber(data.policyViolationCount)} />
              <KpiCard title="Blocked Network" value={formatCompactNumber(data.blockedNetworkAttempts)} />
              <KpiCard title="Audit Events" value={formatCompactNumber(data.auditEventsCount)} />
              <KpiCard title="Violation Rate" value={`${(data.policyViolationRate * 100).toFixed(1)}%`} />
            </CardGrid>

            <ChartCard title="Violations by Team">
              <BreakdownChart
                data={data.violationsByTeam}
                variant="horizontal-bar"
                truncateLabels={false}
              />
            </ChartCard>
          </>
        ) : null}
      </View>

      {data && (
        <View nativeID="compliance-status" style={sectionStyles.section}>
          <SectionHeader title="Compliance Status" />
          <CardGrid columns={3}>
            {data.complianceItems.map((item: ComplianceItem) => (
              <KpiCard
                key={item.label}
                title={item.label}
                value={item.status}
                valueColor={COMPLIANCE_STATUS_COLORS[item.status]}
                caption={getComplianceCaption(item.status)}
              />
            ))}
          </CardGrid>
        </View>
      )}

      {data && (
        <View nativeID="seat-user-oversight" style={sectionStyles.section}>
          <View style={localStyles.sectionRow}>
            <SectionHeader
              title="Seat User Oversight"
              subtitle="Full names of active seat users and AI usage by account seat"
            />
            <Pressable
              onPress={() => setShowCreateSeat(true)}
              style={[localStyles.createButton, { backgroundColor: theme.border.brand }]}
              accessibilityRole="button"
              accessibilityLabel="Add Seat"
            >
              <Text style={[localStyles.createButtonText, { color: theme.text.onBrand }]}>+ Add Seat</Text>
            </Pressable>
          </View>
          <View style={localStyles.seatUsageSummary}>
            <Text style={[localStyles.summaryText, { color: theme.text.secondary }]}>
              Most AI usage: {mostActiveSeatUser ? `${mostActiveSeatUser.fullName} (${formatCompactNumber(mostActiveSeatUser.runsCount)} runs)` : "No active seat usage"}
            </Text>
            <Text style={[localStyles.summaryText, { color: theme.text.secondary }]}>
              Least AI usage: {leastActiveSeatUser ? `${leastActiveSeatUser.fullName} (${formatCompactNumber(leastActiveSeatUser.runsCount)} runs)` : "No active seat usage"}
            </Text>
          </View>
          <ChartCard
            title="Seat Usage by Runs"
            subtitle="AI runs per seat user, sorted by usage"
          >
            <BreakdownChart
              data={seatUsageChartData}
              variant="horizontal-bar"
              truncateLabels={false}
            />
          </ChartCard>
          <DataTable
            columns={seatUsageCols}
            data={filteredSeatUsers}
            emptyMessage="No seat usage data for the selected time range."
            keyExtractor={(row) => row.userId}
          />
        </View>
      )}

      {data && (
        <View nativeID="recent-violations" style={sectionStyles.section}>
          <View style={localStyles.sectionRow}>
            <SectionHeader title="Recent Violations" />
            <Pressable
              onPress={() => setShowCreateRule(true)}
              style={[localStyles.createButton, { backgroundColor: theme.border.brand }]}
              accessibilityRole="button"
              accessibilityLabel="Create Compliance Rule"
            >
              <Text style={[localStyles.createButtonText, { color: theme.text.onBrand }]}>+ Create Rule</Text>
            </Pressable>
          </View>
          <DataTable
            columns={violationCols}
            data={filteredViolations}
            keyExtractor={(row) => row.id}
          />
        </View>
      )}

      {data && (
        <View style={sectionStyles.section}>
          <SectionHeader title="Security Events" />
          <DataTable
            columns={securityCols}
            data={filteredSecurityEvents}
            keyExtractor={(row) => row.id}
          />
        </View>
      )}

      {data && (
        <View nativeID="policy-changes" style={sectionStyles.section}>
          <SectionHeader title="Policy Changes" subtitle="Audit trail of policy modifications" />
          <DataTable
            columns={policyChangeCols}
            data={filteredPolicyChanges}
            keyExtractor={(row) => row.id}
          />
        </View>
      )}
      <Modal
        transparent
        visible={showCreateRule}
        animationType="fade"
        onRequestClose={() => setShowCreateRule(false)}
      >
        <View style={[localStyles.modalOverlay, { backgroundColor: theme.bg.overlay }]}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowCreateRule(false)}
            accessibilityRole="button"
            accessibilityLabel="Close create rule form"
          />
          <View style={[localStyles.modalPanel, { backgroundColor: theme.bg.subtle, borderColor: theme.border.default }]}>
            <View style={localStyles.modalHeader}>
              <Pressable
                onPress={() => setShowCreateRule(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={16} color={theme.text.secondary} />
              </Pressable>
            </View>
            <CreateComplianceRuleForm onSubmit={handleCreateRule} loading={createLoading} />
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        visible={showCreateSeat}
        animationType="fade"
        onRequestClose={() => setShowCreateSeat(false)}
      >
        <View style={[localStyles.modalOverlay, { backgroundColor: theme.bg.overlay }]}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowCreateSeat(false)}
            accessibilityRole="button"
            accessibilityLabel="Close add seat form"
          />
          <View style={[localStyles.modalPanel, { backgroundColor: theme.bg.subtle, borderColor: theme.border.default }]}>
            <View style={localStyles.modalHeader}>
              <Pressable
                onPress={() => setShowCreateSeat(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={16} color={theme.text.secondary} />
              </Pressable>
            </View>
            <CreateHumanForm onSubmit={handleCreateSeat} loading={createHumanLoading} error={createHumanError} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  seatUsageSummary: {
    gap: spacing[1],
  },
  summaryText: {
    fontSize: 12,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  createButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalPanel: {
    width: 400,
    maxWidth: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
