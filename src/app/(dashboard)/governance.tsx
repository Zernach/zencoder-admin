import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
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

function getComplianceCaption(status: ComplianceItem["status"]): string {
  if (status === "compliant") return "Passing";
  if (status === "warning") return "Attention needed";
  return "Immediate action required";
}

const violationCols: ColumnDef<PolicyViolationRow>[] = [
  { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={cellText.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
  { key: "agentName", header: "Agent", width: 140 },
  { key: "reason", header: "Reason", width: 180 },
  { key: "severity", header: "Severity", width: 90, render: (row) => <StatusBadge variant="severity" severity={row.severity} /> },
];

const securityCols: ColumnDef<SecurityEventRow>[] = [
  { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={cellText.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
  { key: "type", header: "Type", width: 160 },
  { key: "description", header: "Description" },
];

const seatUsageCols: ColumnDef<SeatUserUsageRow>[] = [
  { key: "fullName", header: "Full Name", width: 220 },
  { key: "teamName", header: "Team", width: 180 },
  { key: "runsCount", header: "Runs", width: 90, align: "right", render: (row) => <Text style={cellText.primary}>{formatCompactNumber(row.runsCount)}</Text> },
  { key: "totalTokens", header: "Tokens", width: 120, align: "right", render: (row) => <Text style={cellText.primary}>{formatCompactNumber(row.totalTokens)}</Text> },
  { key: "totalCostUsd", header: "Cost", width: 100, align: "right", render: (row) => <Text style={cellText.primary}>${row.totalCostUsd.toFixed(2)}</Text> },
];

const VIOLATION_SEARCH_KEYS: (keyof PolicyViolationRow)[] = ["agentName", "reason", "severity"];
const SECURITY_SEARCH_KEYS: (keyof SecurityEventRow)[] = ["type", "description"];
const SEAT_SEARCH_KEYS: (keyof SeatUserUsageRow)[] = ["fullName", "teamName"];
const POLICY_CHANGE_SEARCH_KEYS: (keyof PolicyChangeEvent)[] = ["action", "target"];

const policyChangeCols: ColumnDef<PolicyChangeEvent>[] = [
  { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={cellText.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
  { key: "actorName", header: "Actor", width: 140, render: (row) => <Text style={cellText.primary} numberOfLines={1}>{row.actorName}</Text> },
  { key: "action", header: "Action", width: 220 },
  { key: "target", header: "Target", width: 130 },
];

function getComplianceColor(status: ComplianceItem["status"], t: typeof semanticThemes["dark"]): string {
  if (status === "compliant") return t.state.success;
  if (status === "warning") return t.state.warning;
  return t.state.error;
}

export default function GovernanceScreen() {
  const { data, loading, error, refetch } = useGovernanceDashboard();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const filteredViolations = useSearchFilter(data?.recentViolations ?? [], VIOLATION_SEARCH_KEYS);
  const filteredSecurityEvents = useSearchFilter(data?.securityEvents ?? [], SECURITY_SEARCH_KEYS);
  const filteredSeatUsers = useSearchFilter(data?.seatUserUsage ?? [], SEAT_SEARCH_KEYS);
  const filteredPolicyChanges = useSearchFilter(data?.policyChanges ?? [], POLICY_CHANGE_SEARCH_KEYS);

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
      <View style={sectionStyles.section}>
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
        <View style={sectionStyles.section}>
          <SectionHeader title="Compliance Status" />
          <CardGrid columns={3}>
            {data.complianceItems.map((item: ComplianceItem) => (
              <KpiCard
                key={item.label}
                title={item.label}
                value={item.status}
                valueColor={getComplianceColor(item.status, theme)}
                caption={getComplianceCaption(item.status)}
              />
            ))}
          </CardGrid>
        </View>
      )}

      {data && (
        <View style={sectionStyles.section}>
          <SectionHeader
            title="Seat User Oversight"
            subtitle="Full names of active seat users and AI usage by account seat"
          />
          <View style={{ gap: spacing[1] }}>
            <Text style={{ color: theme.text.secondary, fontSize: 12 }}>
              Most AI usage: {mostActiveSeatUser ? `${mostActiveSeatUser.fullName} (${formatCompactNumber(mostActiveSeatUser.runsCount)} runs)` : "No active seat usage"}
            </Text>
            <Text style={{ color: theme.text.secondary, fontSize: 12 }}>
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
        <View style={sectionStyles.section}>
          <SectionHeader title="Recent Violations" />
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
        <View style={sectionStyles.section}>
          <SectionHeader title="Policy Changes" subtitle="Audit trail of policy modifications" />
          <DataTable
            columns={policyChangeCols}
            data={filteredPolicyChanges}
            keyExtractor={(row) => row.id}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}
