import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { CustomButton } from "@/components/buttons";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { SectionHeader, CardGrid, KpiCard, StatusBadge, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, BreakdownChart } from "@/components/charts";
import type { BreakdownChartDatum } from "@/components/charts/BreakdownChart";
import { DataTable, type ColumnDef, cellText, getSuccessRateGreenShadeColor } from "@/components/tables";
import { formatCompactNumber, formatPercent } from "@/features/analytics/utils/formatters";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
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
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const { data, loading, error, refetch } = useGovernanceDashboard();
  const { formatCurrency } = useCurrencyFormatter();
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
    { key: "timestampIso", header: t("governance.table.time"), width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    {
      key: "agentName", header: t("governance.table.agent"), width: 140, render: (row) => (
        <CustomButton onPress={() => navigateTo("agent", row.agentId)} accessibilityRole="link" accessibilityLabel={`View agent ${row.agentName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.agentName}</Text>
        </CustomButton>
      )
    },
    { key: "reason", header: t("governance.table.reason"), width: 180 },
    { key: "severity", header: t("governance.table.severity"), width: 90, render: (row) => <StatusBadge variant="severity" severity={row.severity} /> },
  ], [ct, navigateTo, t]);

  const securityCols = useMemo<ColumnDef<SecurityEventRow>[]>(() => [
    { key: "timestampIso", header: t("governance.table.time"), width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    { key: "type", header: t("governance.table.type"), width: 160 },
    { key: "description", header: t("governance.table.description") },
  ], [ct, t]);

  const teamPerformanceCols = useMemo<ColumnDef<TeamPerformanceComparisonRow>[]>(() => [
    {
      key: "teamName", header: t("governance.table.team"), width: 210, render: (row) => (
        <CustomButton onPress={() => navigateTo("team", row.teamId)} accessibilityRole="link" accessibilityLabel={`View team ${row.teamName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.teamName}</Text>
        </CustomButton>
      )
    },
    {
      key: "successRate",
      header: t("governance.table.success"),
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
      header: t("governance.table.runs"),
      width: 90,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.runsCount)}</Text>,
    },
    {
      key: "policyViolationCount",
      header: t("governance.table.violations"),
      width: 110,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatCompactNumber(row.policyViolationCount)}</Text>,
    },
    {
      key: "policyViolationRate",
      header: t("governance.table.violationRate"),
      width: 130,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatPercent(row.policyViolationRate * 100)}</Text>,
    },
    {
      key: "totalCostUsd",
      header: t("governance.table.cost"),
      width: 100,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatCurrency(row.totalCostUsd)}</Text>,
    },
  ], [ct, mode, navigateTo, t]);

  const policyChangeCols = useMemo<ColumnDef<PolicyChangeEvent>[]>(() => [
    { key: "timestampIso", header: t("governance.table.time"), width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    {
      key: "actorName", header: t("governance.table.actor"), width: 140, render: (row) => (
        <CustomButton onPress={() => navigateTo("human", row.actorUserId)} accessibilityRole="link" accessibilityLabel={`View user ${row.actorName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.actorName}</Text>
        </CustomButton>
      )
    },
    { key: "action", header: t("governance.table.action"), width: 220 },
    {
      key: "target", header: t("governance.table.target"), width: 130, render: (row) => (
        <CustomButton onPress={() => navigateTo("team", row.targetTeamId)} accessibilityRole="link" accessibilityLabel={`View team ${row.target}`}>
          <Text style={ct.link} numberOfLines={1}>{row.target}</Text>
        </CustomButton>
      )
    },
  ], [ct, navigateTo, t]);

  const subtitle = useMemo(() => data
    ? t("governance.subtitleWithData", { violations: data.policyViolationCount, securityEvents: data.securityEvents.length })
    : t("governance.subtitle"),
    [data, t],
  );

  const violationsByTeamChartData = useMemo<BreakdownChartDatum[]>(() => {
    if (!data) return [];
    return data.violationsByTeam.map((team) => ({
      key: team.teamName,
      value: team.totalViolations,
      hoverRows: team.reasonBreakdown.map((r) => ({
        label: r.key,
        value: String(r.value),
      })),
    }));
  }, [data]);

  const seatUsageChartData = useMemo(() => {
    return filteredSeatUsers.map((row) => ({
      key: row.fullName,
      value: row.runsCount,
      hoverRows: [
        { label: t("governance.seatUsage.fullName"), value: row.fullName },
        { label: t("governance.seatUsage.team"), value: row.teamName },
        { label: t("governance.seatUsage.runs"), value: formatCompactNumber(row.runsCount) },
        { label: t("governance.seatUsage.tokens"), value: formatCompactNumber(row.totalTokens) },
        { label: t("governance.seatUsage.cost"), value: formatCurrency(row.totalCostUsd) },
      ],
    }));
  }, [filteredSeatUsers, t]);

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
    () => ({ title: t("navigation.governance"), subtitle, isLoading: loading }),
    [subtitle, loading, t],
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <ScreenWrapper headerProps={headerProps}>
      <View ref={refFor("overview")} nativeID="overview" style={sectionStyles.section}>
        <SectionHeader title={t("governance.overview")} />
        {loading ? (
          <CardGrid columns={4}>
            {SKELETON_4.map((_, i) => (
              <LoadingSkeleton key={i} variant="kpi" />
            ))}
          </CardGrid>
        ) : data ? (
          <>
            <CardGrid columns={4}>
              <KpiCard title={t("governance.violations")} value={formatCompactNumber(data.policyViolationCount)} />
              <KpiCard title={t("governance.blockedNetwork")} value={formatCompactNumber(data.blockedNetworkAttempts)} />
              <KpiCard title={t("governance.auditEvents")} value={formatCompactNumber(data.auditEventsCount)} />
              <KpiCard title={t("governance.violationRate")} value={`${(data.policyViolationRate * 100).toFixed(1)}%`} />
            </CardGrid>

            <ChartCard title={t("governance.violationsByTeam")}>
              <BreakdownChart
                data={violationsByTeamChartData}
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
                title={t("governance.teamPerformanceComparison")}
                subtitle={t("governance.teamPerformanceSubtitle")}
              />
            </View>
            <CustomButton
              onPress={handleOpenCreateTeam}
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label={t("governance.createTeam")}
              textStyle={localStyles.createButtonText}
              accessibilityRole="button"
              accessibilityLabel={t("modals.createTeamTitle")}
            />
          </View>
          <DataTable
            columns={teamPerformanceCols}
            data={filteredTeamPerformance}
            initialSortBy="successRate"
            initialSortDirection="desc"
            emptyMessage={t("governance.noTeamPerformanceData")}
            keyExtractor={keyExtractors.byTeamId}
          />
        </View>
      )}

      {data && (
        <View ref={refFor("seat-user-oversight")} nativeID="seat-user-oversight" style={sectionStyles.section}>
          <View style={localStyles.sectionRow}>
            <View style={localStyles.sectionHeaderWrap}>
              <SectionHeader
                title={t("governance.seatUserOversight")}
                subtitle={t("governance.seatUserSubtitle")}
              />
            </View>
            <CustomButton
              onPress={handleOpenCreateSeat}
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label={t("governance.createUser")}
              textStyle={localStyles.createButtonText}
              accessibilityRole="button"
              accessibilityLabel={t("modals.addUser")}
            />
          </View>
          <ChartCard
            title={t("governance.seatUsageByRuns")}
            subtitle={t("governance.seatUsageSubtitle")}
          >
            <BreakdownChart
              data={seatUsageChartData}
              variant="horizontal-bar"
              truncateLabels={false}
              colorScale="scaled"
            />
          </ChartCard>
        </View>
      )}

      {data && (
        <View ref={refFor("recent-violations")} nativeID="recent-violations" style={sectionStyles.section}>
          <View style={localStyles.sectionRow}>
            <View style={localStyles.sectionHeaderWrap}>
              <SectionHeader title={t("governance.recentViolations")} />
            </View>
            <CustomButton
              onPress={handleOpenCreateRule}
              style={localStyles.createButton}
              buttonMode="secondary"
              buttonSize="compact"
              label={t("governance.createRule")}
              textStyle={localStyles.createButtonText}
              accessibilityRole="button"
              accessibilityLabel={t("modals.createComplianceRuleTitle")}
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
          <SectionHeader title={t("governance.securityEvents")} />
          <DataTable
            columns={securityCols}
            data={filteredSecurityEvents}
            keyExtractor={keyExtractors.byId}
          />
        </View>
      )}

      {data && (
        <View ref={refFor("policy-changes")} nativeID="policy-changes" style={sectionStyles.section}>
          <SectionHeader title={t("governance.policyChanges")} subtitle={t("governance.policyChangesSubtitle")} />
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
