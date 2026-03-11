import React, { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { CustomButton } from "@/components/buttons";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { SectionHeader, StatusBadge, ErrorState } from "@/components/dashboard";
import { ChartCard, BarChart, MultiLineChart } from "@/components/charts";
import type { MultiLineChartSeries } from "@/components/charts/MultiLineChart";
import { getOrangeBarShadesStepped } from "@/components/charts/palette";
import { DataTable, type ColumnDef, cellText, getSuccessRateGreenShadeColor } from "@/components/tables";
import { formatCompactNumber, formatPercent } from "@/features/analytics/utils/formatters";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import type {
  GovernanceRuleRow,
  PolicyViolationRow,
  SecurityEventRow,
  PolicyChangeEvent,
  SeatUserUsageRow,
  TeamPerformanceComparisonRow,
} from "@/features/analytics/types";
import type { GovernanceDashboardData } from "@/features/analytics/hooks/useGovernanceDashboard";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { CreateComplianceRuleModal } from "@/features/analytics/components/CreateComplianceRuleModal";
import { AddSeatModal } from "@/features/analytics/components/AddSeatModal";
import { CreateTeamModal } from "@/features/analytics/components/CreateTeamModal";
import { useThemeMode } from "@/providers/ThemeProvider";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { keyExtractors } from "@/constants";
import { buildEntityRoute, resolveTabFromPathname } from "@/constants/routes";
import { useAppDispatch, openModal, ModalName } from "@/store";

const VIOLATION_SEARCH_KEYS: (keyof PolicyViolationRow)[] = ["agentName", "ruleTitle", "reason", "severity"];
const SECURITY_SEARCH_KEYS: (keyof SecurityEventRow)[] = ["type", "description"];
const SEAT_SEARCH_KEYS: (keyof SeatUserUsageRow)[] = ["fullName", "teamName"];
const TEAM_PERFORMANCE_SEARCH_KEYS: (keyof TeamPerformanceComparisonRow)[] = ["teamName"];
const POLICY_CHANGE_SEARCH_KEYS: (keyof PolicyChangeEvent)[] = ["action", "target"];
const RULE_SEARCH_KEYS: (keyof GovernanceRuleRow)[] = ["title", "description"];

type GovernanceEntityType = "agent" | "project" | "team" | "human" | "run" | "rule";
type GovernanceNavigateTo = (entityType: GovernanceEntityType, entityId: string) => void;

const GovernanceTeamPerformanceSection = React.memo(function GovernanceTeamPerformanceSection({
  data,
  navigateTo,
  onCreateTeam,
}: {
  data: GovernanceDashboardData;
  navigateTo: GovernanceNavigateTo;
  onCreateTeam: () => void;
}) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();
  const refFor = useSectionRef();
  const filteredTeamPerformance = useSearchFilter(
    data.teamPerformanceComparison,
    TEAM_PERFORMANCE_SEARCH_KEYS,
  );

  const teamPerformanceCols = useMemo<ColumnDef<TeamPerformanceComparisonRow>[]>(() => [
    {
      key: "teamName", header: t("governance.table.team"), width: 210, render: (row) => (
        <CustomButton onPress={() => navigateTo("team", row.teamId)} accessibilityRole="link" accessibilityLabel={`View team ${row.teamName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.teamName}</Text>
        </CustomButton>
      ),
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
      key: "rulesCount",
      header: t("governance.table.rules"),
      width: 90,
      align: "right",
      render: (row) => <Text style={ct.success}>{formatCompactNumber(row.rulesCount)}</Text>,
    },
    {
      key: "policyViolationCount",
      header: t("governance.table.violations"),
      width: 110,
      align: "right",
      render: (row) => <Text style={ct.error}>{formatCompactNumber(row.policyViolationCount)}</Text>,
    },
    {
      key: "policyViolationRate",
      header: t("governance.table.violationRate"),
      width: 130,
      align: "right",
      sortAccessor: (row) => (row.runsCount > 0 ? row.policyViolationCount / row.runsCount : 0),
      render: (row) => {
        const computedViolationRate = row.runsCount > 0 ? row.policyViolationCount / row.runsCount : 0;
        return <Text style={ct.error}>{formatPercent(computedViolationRate * 100)}</Text>;
      },
    },
    {
      key: "totalCostUsd",
      header: t("governance.table.cost"),
      width: 100,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatCurrency(row.totalCostUsd)}</Text>,
    },
  ], [ct, formatCurrency, mode, navigateTo, t]);

  return (
    <View ref={refFor("team-performance")} nativeID="team-performance" style={sectionStyles.section}>
      <View style={sectionStyles.sectionRow}>
        <View style={sectionStyles.sectionHeaderWrap}>
          <SectionHeader
            title={t("governance.teamPerformanceComparison")}
            subtitle={t("governance.teamPerformanceSubtitle")}
          />
        </View>
        <CustomButton
          onPress={onCreateTeam}
          style={sectionStyles.createButton}
          buttonMode="secondary"
          buttonSize="compact"
          label={t("governance.createTeam")}
          textStyle={sectionStyles.createButtonText}
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
  );
});

const GovernanceSeatUserOversightSection = React.memo(function GovernanceSeatUserOversightSection({
  data,
  onCreateSeat,
}: {
  data: GovernanceDashboardData;
  onCreateSeat: () => void;
}) {
  const { t } = useTranslation();
  const refFor = useSectionRef();
  const { formatCurrency } = useCurrencyFormatter();
  const filteredSeatUsers = useSearchFilter(data.seatUserUsage, SEAT_SEARCH_KEYS);

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
  }, [filteredSeatUsers, formatCurrency, t]);

  const activeUsersSeries = useMemo((): MultiLineChartSeries[] => {
    const result: MultiLineChartSeries[] = [];
    if (data.activeUsersTrend && data.activeUsersTrend.length > 0) {
      result.push({ label: "DAU", data: data.activeUsersTrend });
    }
    if (data.wauTrend && data.wauTrend.length > 0) {
      result.push({ label: "WAU", data: data.wauTrend });
    }
    if (data.mauTrend && data.mauTrend.length > 0) {
      result.push({ label: "MAU", data: data.mauTrend });
    }
    const colors = getOrangeBarShadesStepped(result.length);
    return result.map((series, index) => ({ ...series, color: colors[index] }));
  }, [data.activeUsersTrend, data.mauTrend, data.wauTrend]);

  return (
    <View ref={refFor("seat-user-oversight")} nativeID="seat-user-oversight" style={sectionStyles.section}>
      <View style={sectionStyles.sectionRow}>
        <View style={sectionStyles.sectionHeaderWrap}>
          <SectionHeader
            title={t("governance.seatUserOversight")}
            subtitle={t("governance.seatUserSubtitle")}
          />
        </View>
        <CustomButton
          onPress={onCreateSeat}
          style={sectionStyles.createButton}
          buttonMode="secondary"
          buttonSize="compact"
          label={t("governance.createUser")}
          textStyle={sectionStyles.createButtonText}
          accessibilityRole="button"
          accessibilityLabel={t("modals.addUser")}
        />
      </View>
      {activeUsersSeries.length > 0 && (
        <ChartCard
          title={t("dashboard.activeUsers")}
          subtitle={t("governance.activeUsersSubtitle")}
        >
          <MultiLineChart series={activeUsersSeries} height={220} />
        </ChartCard>
      )}
      <ChartCard
        title={t("governance.seatUsageByRuns")}
        subtitle={t("governance.seatUsageSubtitle")}
      >
        <BarChart
          data={seatUsageChartData}
          variant="horizontal-bar"
          truncateLabels={false}
          colorScale="scaled"
        />
      </ChartCard>
    </View>
  );
});

const GovernanceRulesSection = React.memo(function GovernanceRulesSection({
  data,
  navigateTo,
  onCreateRule,
}: {
  data: GovernanceDashboardData;
  navigateTo: GovernanceNavigateTo;
  onCreateRule: () => void;
}) {
  const { mode } = useThemeMode();
  const { t } = useTranslation();
  const ct = cellText(mode);
  const refFor = useSectionRef();
  const filteredRules = useSearchFilter(data.rules, RULE_SEARCH_KEYS);

  const rulesCols = useMemo<ColumnDef<GovernanceRuleRow>[]>(() => [
    {
      key: "title", header: "Title", width: 220, render: (row) => (
        <CustomButton onPress={() => navigateTo("rule", row.id)} accessibilityRole="link" accessibilityLabel={`View rule ${row.title}`}>
          <Text style={ct.link} numberOfLines={1}>{row.title}</Text>
        </CustomButton>
      ),
    },
    {
      key: "description",
      header: "Description",
      width: 540,
      render: (row) => <Text style={[ct.secondary, { fontWeight: "400" }]}>{row.description}</Text>,
    },
    {
      key: "editedAtIso",
      header: "Edited",
      width: 180,
      render: (row) => <Text style={ct.primary}>{new Date(row.editedAtIso).toLocaleString()}</Text>,
    },
    {
      key: "createdAtIso",
      header: "Created",
      width: 180,
      render: (row) => <Text style={ct.primary}>{new Date(row.createdAtIso).toLocaleString()}</Text>,
    },
    {
      key: "runsCheckedCount",
      header: "Runs",
      width: 90,
      align: "right",
      render: (row) => <Text style={ct.primary}>{row.runsCheckedCount.toLocaleString()}</Text>,
    },
  ], [ct, navigateTo]);

  return (
    <View ref={refFor("rules")} nativeID="rules" style={sectionStyles.section}>
      <View style={sectionStyles.sectionRow}>
        <View style={sectionStyles.sectionHeaderWrap}>
          <SectionHeader
            title="Rules"
            subtitle="Customized guardrails per project, team, or agent"
          />
        </View>
        <CustomButton
          onPress={onCreateRule}
          style={sectionStyles.createButton}
          buttonMode="secondary"
          buttonSize="compact"
          label={t("governance.createRule")}
          textStyle={sectionStyles.createButtonText}
          accessibilityRole="button"
          accessibilityLabel={t("modals.createComplianceRuleTitle")}
        />
      </View>
      <DataTable
        columns={rulesCols}
        data={filteredRules}
        initialSortBy="editedAtIso"
        initialSortDirection="desc"
        keyExtractor={keyExtractors.byId}
      />
    </View>
  );
});

const GovernanceRecentViolationsSection = React.memo(function GovernanceRecentViolationsSection({
  data,
  navigateTo,
}: {
  data: GovernanceDashboardData;
  navigateTo: GovernanceNavigateTo;
}) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const refFor = useSectionRef();
  const filteredViolations = useSearchFilter(data.recentViolations, VIOLATION_SEARCH_KEYS);

  const violationCols = useMemo<ColumnDef<PolicyViolationRow>[]>(() => [
    { key: "timestampIso", header: t("governance.table.time"), width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    {
      key: "agentName", header: t("governance.table.agent"), width: 140, render: (row) => (
        <CustomButton onPress={() => navigateTo("agent", row.agentId)} accessibilityRole="link" accessibilityLabel={`View agent ${row.agentName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.agentName}</Text>
        </CustomButton>
      ),
    },
    {
      key: "ruleTitle", header: t("governance.table.rule"), width: 150, render: (row) => (
        <CustomButton onPress={() => navigateTo("rule", row.ruleId)} accessibilityRole="link" accessibilityLabel={`View rule ${row.ruleTitle}`}>
          <Text style={ct.link} numberOfLines={1}>{row.ruleTitle}</Text>
        </CustomButton>
      ),
    },
    { key: "reason", header: t("governance.table.reason"), width: 180 },
    { key: "severity", header: t("governance.table.severity"), width: 90, render: (row) => <StatusBadge variant="severity" severity={row.severity} /> },
  ], [ct, navigateTo, t]);

  return (
    <View ref={refFor("recent-violations")} nativeID="recent-violations" style={sectionStyles.section}>
      <SectionHeader
        title={t("governance.recentViolations")}
        subtitle={t("governance.recentViolationsSubtitle")}
      />
      <DataTable
        columns={violationCols}
        data={filteredViolations}
        keyExtractor={keyExtractors.byId}
      />
    </View>
  );
});

const GovernancePolicyChangesSection = React.memo(function GovernancePolicyChangesSection({
  data,
  navigateTo,
}: {
  data: GovernanceDashboardData;
  navigateTo: GovernanceNavigateTo;
}) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const refFor = useSectionRef();
  const filteredPolicyChanges = useSearchFilter(data.policyChanges, POLICY_CHANGE_SEARCH_KEYS);

  const policyChangeCols = useMemo<ColumnDef<PolicyChangeEvent>[]>(() => [
    { key: "timestampIso", header: t("governance.table.time"), width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    {
      key: "actorName", header: t("governance.table.actor"), width: 140, render: (row) => (
        <CustomButton onPress={() => navigateTo("human", row.actorUserId)} accessibilityRole="link" accessibilityLabel={`View user ${row.actorName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.actorName}</Text>
        </CustomButton>
      ),
    },
    { key: "action", header: t("governance.table.action"), width: 220 },
    {
      key: "target", header: t("governance.table.target"), width: 130, render: (row) => (
        <CustomButton onPress={() => navigateTo("team", row.targetTeamId)} accessibilityRole="link" accessibilityLabel={`View team ${row.target}`}>
          <Text style={ct.link} numberOfLines={1}>{row.target}</Text>
        </CustomButton>
      ),
    },
  ], [ct, navigateTo, t]);

  return (
    <View ref={refFor("policy-changes")} nativeID="policy-changes" style={sectionStyles.section}>
      <SectionHeader title={t("governance.policyChanges")} subtitle={t("governance.policyChangesSubtitle")} />
      <DataTable
        columns={policyChangeCols}
        data={filteredPolicyChanges}
        keyExtractor={keyExtractors.byId}
      />
    </View>
  );
});

const GovernanceSecurityEventsSection = React.memo(function GovernanceSecurityEventsSection({
  data,
}: {
  data: GovernanceDashboardData;
}) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const refFor = useSectionRef();
  const filteredSecurityEvents = useSearchFilter(data.securityEvents, SECURITY_SEARCH_KEYS);

  const securityCols = useMemo<ColumnDef<SecurityEventRow>[]>(() => [
    { key: "timestampIso", header: t("governance.table.time"), width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    { key: "type", header: t("governance.table.type"), width: 160 },
    { key: "description", header: t("governance.table.description") },
  ], [ct, t]);

  return (
    <View ref={refFor("security-events")} nativeID="security-events" style={sectionStyles.section}>
      <SectionHeader
        title={t("governance.securityEvents")}
        subtitle={t("governance.securityEventsSubtitle")}
      />
      <DataTable
        columns={securityCols}
        data={filteredSecurityEvents}
        keyExtractor={keyExtractors.byId}
      />
    </View>
  );
});

export default function GovernanceScreen() {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useGovernanceDashboard();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const navigateTo = useCallback(
    (entityType: GovernanceEntityType, entityId: string) => {
      const tab = resolveTabFromPathname(pathnameRef.current);
      const route = buildEntityRoute(tab, entityType, entityId);
      router.push(route as never);
    },
    [router],
  );

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
    () => ({ title: t("navigation.governance"), subtitle: t("governance.subtitle"), isLoading: loading }),
    [loading, t],
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <ScreenWrapper headerProps={headerProps}>
      {data ? (
        <GovernanceTeamPerformanceSection
          data={data}
          navigateTo={navigateTo}
          onCreateTeam={handleOpenCreateTeam}
        />
      ) : null}
      {data ? (
        <GovernanceSeatUserOversightSection
          data={data}
          onCreateSeat={handleOpenCreateSeat}
        />
      ) : null}
      {data ? (
        <GovernanceRulesSection
          data={data}
          navigateTo={navigateTo}
          onCreateRule={handleOpenCreateRule}
        />
      ) : null}
      {data ? (
        <GovernanceRecentViolationsSection
          data={data}
          navigateTo={navigateTo}
        />
      ) : null}
      {data ? (
        <GovernancePolicyChangesSection
          data={data}
          navigateTo={navigateTo}
        />
      ) : null}
      {data ? <GovernanceSecurityEventsSection data={data} /> : null}
      <CreateComplianceRuleModal />
      <AddSeatModal />
      <CreateTeamModal />
    </ScreenWrapper>
  );
}
