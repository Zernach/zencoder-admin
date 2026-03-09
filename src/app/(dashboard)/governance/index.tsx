import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { SectionHeader, CardGrid, KpiCard, StatusBadge, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, BreakdownChart } from "@/components/charts";
import { DataTable, type ColumnDef, cellText } from "@/components/tables";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import type { PolicyViolationRow, SecurityEventRow, PolicyChangeEvent, ComplianceItem, SeatUserUsageRow, KeyValueMetric } from "@/features/analytics/types";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { CreateComplianceRuleModal } from "@/features/analytics/components/CreateComplianceRuleModal";
import { AddSeatModal } from "@/features/analytics/components/AddSeatModal";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing } from "@/theme/tokens";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { keyExtractors } from "@/constants";
import { useAppDispatch, openModal, ModalName } from "@/store";

const SKELETON_4 = Array.from({ length: 4 });

const VIOLATION_SEARCH_KEYS: (keyof PolicyViolationRow)[] = ["agentName", "reason", "severity"];
const SECURITY_SEARCH_KEYS: (keyof SecurityEventRow)[] = ["type", "description"];
const SEAT_SEARCH_KEYS: (keyof SeatUserUsageRow)[] = ["fullName", "teamName"];
const POLICY_CHANGE_SEARCH_KEYS: (keyof PolicyChangeEvent)[] = ["action", "target"];
const SEAT_USAGE_CHART_PALETTE = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
] as const;

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
  const refFor = useSectionRef();
  const dispatch = useAppDispatch();

  const filteredViolations = useSearchFilter(data?.recentViolations ?? [], VIOLATION_SEARCH_KEYS);
  const filteredSecurityEvents = useSearchFilter(data?.securityEvents ?? [], SECURITY_SEARCH_KEYS);
  const filteredSeatUsers = useSearchFilter(data?.seatUserUsage ?? [], SEAT_SEARCH_KEYS);
  const filteredPolicyChanges = useSearchFilter(data?.policyChanges ?? [], POLICY_CHANGE_SEARCH_KEYS);

  const COMPLIANCE_STATUS_COLORS = useMemo<Record<ComplianceItem["status"], string>>(() => ({
    compliant: theme.state.success,
    warning: theme.state.warning,
    critical: theme.state.error,
  }), [theme.state.success, theme.state.warning, theme.state.error]);

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

  const subtitle = useMemo(() => data
    ? `${data.policyViolationCount} violations, ${data.securityEvents.length} security events`
    : "Policy enforcement and security monitoring",
    [data],
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const seatUsageChartData: KeyValueMetric[] = useMemo(() => {
    if (!data?.seatUserUsage) return [];
    return data.seatUserUsage.map((row) => ({
      key: row.fullName,
      value: row.runsCount,
    }));
  }, [data?.seatUserUsage]);

  const handleOpenCreateSeat = useCallback(
    () => dispatch(openModal(ModalName.CreateSeat)),
    [dispatch],
  );
  const handleOpenCreateRule = useCallback(
    () => dispatch(openModal(ModalName.CreateComplianceRule)),
    [dispatch],
  );

  const headerProps = useMemo(
    () => ({ title: "Governance", subtitle, isLoading: loading }),
    [subtitle, loading],
  );

  return (
    <ScreenWrapper headerProps={headerProps}>
      <View ref={refFor("overview")} nativeID="overview" style={sectionStyles.section}>
        <SectionHeader title="Overview" />
        {loading ? (
          <CardGrid columns={4}>
            {SKELETON_4.map((_, i) => (
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
        <View ref={refFor("compliance-status")} nativeID="compliance-status" style={sectionStyles.section}>
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
        <View ref={refFor("seat-user-oversight")} nativeID="seat-user-oversight" style={sectionStyles.section}>
          <View style={localStyles.sectionRow}>
            <View style={localStyles.sectionHeaderWrap}>
              <SectionHeader
                title="Seat User Oversight"
                subtitle="Full names of active seat users and AI usage by account seat"
              />
            </View>
            <CustomButton
              onPress={handleOpenCreateSeat}
              style={[localStyles.createButton, { borderColor: theme.border.brand }]}
              accessibilityRole="button"
              accessibilityLabel="Add Seat"
            >
              <Text style={[localStyles.createButtonText, { color: theme.border.brand }]}>+ Add Seat</Text>
            </CustomButton>
          </View>
          <ChartCard
            title="Seat Usage by Runs"
            subtitle="AI runs per seat user, sorted by usage"
          >
            <BreakdownChart
              data={seatUsageChartData}
              variant="horizontal-bar"
              palette={SEAT_USAGE_CHART_PALETTE}
              truncateLabels={false}
            />
          </ChartCard>
          <DataTable
            columns={seatUsageCols}
            data={filteredSeatUsers}
            emptyMessage="No seat usage data for the selected time range."
            keyExtractor={keyExtractors.byUserId}
          />
        </View>
      )}

      {data && (
        <View ref={refFor("recent-violations")} nativeID="recent-violations" style={sectionStyles.section}>
          <View style={localStyles.sectionRow}>
            <View style={localStyles.sectionHeaderWrap}>
              <SectionHeader title="Recent Violations" />
            </View>
            <CustomButton
              onPress={handleOpenCreateRule}
              style={[localStyles.createButton, { borderColor: theme.border.brand }]}
              accessibilityRole="button"
              accessibilityLabel="Create Compliance Rule"
            >
              <Text style={[localStyles.createButtonText, { color: theme.border.brand }]}>+ Create Rule</Text>
            </CustomButton>
          </View>
          <DataTable
            columns={violationCols}
            data={filteredViolations}
            keyExtractor={keyExtractors.byId}
          />
        </View>
      )}

      {data && (
        <View ref={refFor("security-events")} nativeID="security-events" style={sectionStyles.section}>
          <SectionHeader title="Security Events" />
          <DataTable
            columns={securityCols}
            data={filteredSecurityEvents}
            keyExtractor={keyExtractors.byId}
          />
        </View>
      )}

      {data && (
        <View ref={refFor("policy-changes")} nativeID="policy-changes" style={sectionStyles.section}>
          <SectionHeader title="Policy Changes" subtitle="Audit trail of policy modifications" />
          <DataTable
            columns={policyChangeCols}
            data={filteredPolicyChanges}
            keyExtractor={keyExtractors.byId}
          />
        </View>
      )}
      <CreateComplianceRuleModal />
      <AddSeatModal />
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  sectionHeaderWrap: {
    flex: 1,
    minWidth: 0,
  },
  createButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: "auto",
    flexShrink: 0,
    maxWidth: "100%",
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
