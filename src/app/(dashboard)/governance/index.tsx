import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { CustomButton } from "@/components/buttons";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { SectionHeader, CardGrid, KpiCard, StatusBadge, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, BreakdownChart } from "@/components/charts";
import { DataTable, type ColumnDef, cellText, getSuccessRateGreenShadeColor } from "@/components/tables";
import { formatCompactNumber, formatCurrency, formatPercent } from "@/features/analytics/utils/formatters";
import type {
  PolicyViolationRow,
  SecurityEventRow,
  PolicyChangeEvent,
  SeatUserUsageRow,
  TeamPerformanceComparisonRow,
} from "@/features/analytics/types";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { CreateComplianceRuleModal } from "@/features/analytics/components/CreateComplianceRuleModal";
import { AddSeatModal } from "@/features/analytics/components/AddSeatModal";
import { CreateTeamModal } from "@/features/analytics/components/CreateTeamModal";
import { useThemeMode } from "@/providers/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { keyExtractors } from "@/constants";
import { buildEntityRoute, resolveTabFromPathname } from "@/constants/routes";
import { useAppDispatch, openModal, ModalName } from "@/store";

const SKELETON_4 = Array.from({ length: 4 });

const VIOLATION_SEARCH_KEYS: (keyof PolicyViolationRow)[] = ["agentName", "reason", "severity"];
const SECURITY_SEARCH_KEYS: (keyof SecurityEventRow)[] = ["type", "description"];
const SEAT_SEARCH_KEYS: (keyof SeatUserUsageRow)[] = ["fullName", "teamName"];
const TEAM_PERFORMANCE_SEARCH_KEYS: (keyof TeamPerformanceComparisonRow)[] = ["teamName"];
const POLICY_CHANGE_SEARCH_KEYS: (keyof PolicyChangeEvent)[] = ["action", "target"];

export default function GovernanceScreen() {
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const { data, loading, error, refetch } = useGovernanceDashboard();
  const refFor = useSectionRef();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = useCallback(
    (entityType: "agent" | "project" | "team" | "human" | "run", entityId: string) => {
      const tab = resolveTabFromPathname(pathname);
      const route = buildEntityRoute(tab, entityType, entityId);
      router.push(route as never);
    },
    [pathname, router],
  );

  const filteredViolations = useSearchFilter(data?.recentViolations ?? [], VIOLATION_SEARCH_KEYS);
  const filteredSecurityEvents = useSearchFilter(data?.securityEvents ?? [], SECURITY_SEARCH_KEYS);
  const filteredSeatUsers = useSearchFilter(data?.seatUserUsage ?? [], SEAT_SEARCH_KEYS);
  const filteredTeamPerformance = useSearchFilter(
    data?.teamPerformanceComparison ?? [],
    TEAM_PERFORMANCE_SEARCH_KEYS,
  );
  const filteredPolicyChanges = useSearchFilter(data?.policyChanges ?? [], POLICY_CHANGE_SEARCH_KEYS);

  const violationCols = useMemo<ColumnDef<PolicyViolationRow>[]>(() => [
    { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    {
      key: "agentName", header: "Agent", width: 140, render: (row) => (
        <CustomButton onPress={() => navigateTo("agent", row.agentId)} accessibilityRole="link" accessibilityLabel={`View agent ${row.agentName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.agentName}</Text>
        </CustomButton>
      )
    },
    { key: "reason", header: "Reason", width: 180 },
    { key: "severity", header: "Severity", width: 90, render: (row) => <StatusBadge variant="severity" severity={row.severity} /> },
  ], [ct, navigateTo]);

  const securityCols = useMemo<ColumnDef<SecurityEventRow>[]>(() => [
    { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    { key: "type", header: "Type", width: 160 },
    { key: "description", header: "Description" },
  ], [ct]);

  const teamPerformanceCols = useMemo<ColumnDef<TeamPerformanceComparisonRow>[]>(() => [
    {
      key: "teamName", header: "Team", width: 210, render: (row) => (
        <CustomButton onPress={() => navigateTo("team", row.teamId)} accessibilityRole="link" accessibilityLabel={`View team ${row.teamName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.teamName}</Text>
        </CustomButton>
      )
    },
    {
      key: "successRate",
      header: "Success",
      width: 100,
      align: "right",
      render: (row) => (
        <Text style={[ct.primary, { color: getSuccessRateGreenShadeColor(row.successRate, mode) }]}>
          {formatPercent(row.successRate * 100)}
        </Text>
      ),
    },
    {
      key: "runsCount",
      header: "Runs",
      width: 90,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.runsCount)}</Text>,
    },
    {
      key: "policyViolationCount",
      header: "Violations",
      width: 110,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.policyViolationCount)}</Text>,
    },
    {
      key: "policyViolationRate",
      header: "Violation Rate",
      width: 130,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatPercent(row.policyViolationRate * 100)}</Text>,
    },
    {
      key: "totalCostUsd",
      header: "Cost",
      width: 100,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatCurrency(row.totalCostUsd)}</Text>,
    },
  ], [ct, mode, navigateTo]);

  const policyChangeCols = useMemo<ColumnDef<PolicyChangeEvent>[]>(() => [
    { key: "timestampIso", header: "Time", width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    {
      key: "actorName", header: "Actor", width: 140, render: (row) => (
        <CustomButton onPress={() => navigateTo("human", row.actorUserId)} accessibilityRole="link" accessibilityLabel={`View user ${row.actorName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.actorName}</Text>
        </CustomButton>
      )
    },
    { key: "action", header: "Action", width: 220 },
    {
      key: "target", header: "Target", width: 130, render: (row) => (
        <CustomButton onPress={() => navigateTo("team", row.targetTeamId)} accessibilityRole="link" accessibilityLabel={`View team ${row.target}`}>
          <Text style={ct.link} numberOfLines={1}>{row.target}</Text>
        </CustomButton>
      )
    },
  ], [ct, navigateTo]);

  const subtitle = useMemo(() => data
    ? `${data.policyViolationCount} violations, ${data.securityEvents.length} security events`
    : "Policy enforcement and security monitoring",
    [data],
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const seatUsageChartData = useMemo(() => {
    return filteredSeatUsers.map((row) => ({
      key: row.fullName,
      value: row.runsCount,
      hoverRows: [
        { label: "Full Name", value: row.fullName },
        { label: "Team", value: row.teamName },
        { label: "Runs", value: formatCompactNumber(row.runsCount) },
        { label: "Tokens", value: formatCompactNumber(row.totalTokens) },
        { label: "Cost", value: formatCurrency(row.totalCostUsd) },
      ],
    }));
  }, [filteredSeatUsers]);

  const handleOpenCreateSeat = useCallback(
    () => dispatch(openModal(ModalName.CreateSeat)),
    [dispatch],
  );
  const handleOpenCreateTeam = useCallback(
    () => dispatch(openModal(ModalName.CreateTeam)),
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
        <View ref={refFor("team-performance")} nativeID="team-performance" style={sectionStyles.section}>
          <View style={localStyles.sectionRow}>
            <View style={localStyles.sectionHeaderWrap}>
              <SectionHeader
                title="Team Performance Comparison"
                subtitle="Compare performance metrics across teams"
              />
            </View>
            <CustomButton
              onPress={handleOpenCreateTeam}
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label="+ Create Team"
              textStyle={localStyles.createButtonText}
              accessibilityRole="button"
              accessibilityLabel="Create Team"
            />
          </View>
          <DataTable
            columns={teamPerformanceCols}
            data={filteredTeamPerformance}
            initialSortBy="successRate"
            initialSortDirection="desc"
            emptyMessage="No team performance data for the selected time range."
            keyExtractor={keyExtractors.byTeamId}
          />
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
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label="+ Create User"
              textStyle={localStyles.createButtonText}
              accessibilityRole="button"
              accessibilityLabel="Create User"
            />
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
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label="+ Create Rule"
              textStyle={localStyles.createButtonText}
              accessibilityRole="button"
              accessibilityLabel="Create Compliance Rule"
            />
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
      <CreateTeamModal />
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
