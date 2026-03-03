import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { useAppDependencies } from "@/core/di/AppDependencies";
import { SectionHeader, CardGrid, KpiCard, StatusBadge, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, BreakdownChart } from "@/components/charts";
import { DataTable, type ColumnDef } from "@/components/tables";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import type { PolicyViolationRow, SecurityEventRow, PolicyChangeEvent, ComplianceItem, SeatUserUsageRow, KeyValueMetric } from "@/features/analytics/types";
import { ScreenWrapper } from "@/components/screen";
import { spacing } from "@/theme/tokens";

const violationCols: ColumnDef<PolicyViolationRow>[] = [
  { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{new Date(row.timestampIso).toLocaleString()}</Text> },
  { key: "agentName", header: "Agent", width: 140 },
  { key: "reason", header: "Reason", width: 180 },
  { key: "severity", header: "Severity", width: 90, render: (row) => <StatusBadge variant="severity" severity={row.severity} /> },
];

const securityCols: ColumnDef<SecurityEventRow>[] = [
  { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{new Date(row.timestampIso).toLocaleString()}</Text> },
  { key: "type", header: "Type", width: 160 },
  { key: "description", header: "Description" },
];

const seatUsageCols: ColumnDef<SeatUserUsageRow>[] = [
  { key: "fullName", header: "Full Name", width: 220 },
  { key: "teamName", header: "Team", width: 180 },
  {
    key: "runsCount",
    header: "Runs",
    width: 90,
    align: "right",
    render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCompactNumber(row.runsCount)}</Text>,
  },
  {
    key: "totalTokens",
    header: "Tokens",
    width: 120,
    align: "right",
    render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{formatCompactNumber(row.totalTokens)}</Text>,
  },
  {
    key: "totalCostUsd",
    header: "Cost",
    width: 100,
    align: "right",
    render: (row) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>${row.totalCostUsd.toFixed(2)}</Text>,
  },
];

const COMPLIANCE_STATUS_COLORS: Record<ComplianceItem["status"], string> = {
  compliant: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

function getComplianceCaption(status: ComplianceItem["status"]): string {
  if (status === "compliant") return "Passing";
  if (status === "warning") return "Attention needed";
  return "Immediate action required";
}

export default function GovernanceScreen() {
  const { data, loading, error, refetch } = useGovernanceDashboard();
  const { seedData } = useAppDependencies();

  const userMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of seedData.users) m.set(u.id, u.name);
    return m;
  }, [seedData.users]);

  const policyChangeCols: ColumnDef<PolicyChangeEvent>[] = useMemo(
    () => [
      { key: "timestampIso", header: "Time", width: 160, render: (row: PolicyChangeEvent) => <Text style={{ color: "#e5e5e5", fontSize: 12 }}>{new Date(row.timestampIso).toLocaleString()}</Text> },
      { key: "actorUserId", header: "Actor", width: 140, render: (row: PolicyChangeEvent) => <Text style={{ color: "#e5e5e5", fontSize: 12 }} numberOfLines={1}>{userMap.get(row.actorUserId) ?? row.actorUserId}</Text> },
      { key: "action", header: "Action", width: 220 },
      { key: "target", header: "Target", width: 130 },
    ],
    [userMap]
  );

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
      <View style={styles.section}>
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
              <BreakdownChart data={data.violationsByTeam} variant="horizontal-bar" />
            </ChartCard>
          </>
        ) : null}
      </View>

      {data && (
        <View style={styles.section}>
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
        <View style={styles.section}>
          <SectionHeader
            title="Seat User Oversight"
            subtitle="Full names of active seat users and AI usage by account seat"
          />
          <View style={styles.seatUsageSummary}>
            <Text style={styles.summaryText}>
              Most AI usage: {mostActiveSeatUser ? `${mostActiveSeatUser.fullName} (${formatCompactNumber(mostActiveSeatUser.runsCount)} runs)` : "No active seat usage"}
            </Text>
            <Text style={styles.summaryText}>
              Least AI usage: {leastActiveSeatUser ? `${leastActiveSeatUser.fullName} (${formatCompactNumber(leastActiveSeatUser.runsCount)} runs)` : "No active seat usage"}
            </Text>
          </View>
          <ChartCard
            title="Seat Usage by Runs"
            subtitle="AI runs per seat user, sorted by usage"
          >
            <BreakdownChart data={seatUsageChartData} variant="horizontal-bar" />
          </ChartCard>
          <DataTable
            columns={seatUsageCols}
            data={data.seatUserUsage}
            emptyMessage="No seat usage data for the selected time range."
            keyExtractor={(row) => row.userId}
          />
        </View>
      )}

      {data && (
        <View style={styles.section}>
          <SectionHeader title="Recent Violations" />
          <DataTable
            columns={violationCols}
            data={data.recentViolations}
            keyExtractor={(row) => row.id}
          />
        </View>
      )}

      {data && (
        <View style={styles.section}>
          <SectionHeader title="Security Events" />
          <DataTable
            columns={securityCols}
            data={data.securityEvents}
            keyExtractor={(row) => row.id}
          />
        </View>
      )}

      {data && (
        <View style={styles.section}>
          <SectionHeader title="Policy Changes" subtitle="Audit trail of policy modifications" />
          <DataTable
            columns={policyChangeCols}
            data={data.policyChanges}
            keyExtractor={(row) => row.id}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[3],
  },
  seatUsageSummary: {
    gap: spacing[1],
  },
  summaryText: {
    color: "#cfcfcf",
    fontSize: 12,
  },
});
