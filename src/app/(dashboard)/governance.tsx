import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { SectionHeader, CardGrid, KpiCard, StatusBadge, LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { ChartCard, BreakdownChart } from "@/components/charts";
import { DataTable, type ColumnDef } from "@/components/tables";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import type { PolicyViolationRow, SecurityEventRow, ComplianceItem } from "@/features/analytics/types";

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

export default function GovernanceScreen() {
  const { data, loading, error, refetch } = useGovernanceDashboard();

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Governance & Compliance</Text>
      <Text style={styles.subtitle}>Policy enforcement and security monitoring</Text>

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

          <SectionHeader title="Compliance Status" />
          <CardGrid columns={3}>
            {data.complianceItems.map((item: ComplianceItem) => (
              <KpiCard
                key={item.label}
                title={item.label}
                value={item.status}
                caption={item.status === "compliant" ? "Passing" : "Attention needed"}
              />
            ))}
          </CardGrid>

          <SectionHeader title="Recent Violations" />
          <DataTable
            columns={violationCols}
            data={data.recentViolations}
            keyExtractor={(row) => row.id}
          />

          <SectionHeader title="Security Events" />
          <DataTable
            columns={securityCols}
            data={data.securityEvents}
            keyExtractor={(row) => row.id}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#e5e5e5", letterSpacing: -0.2 },
  subtitle: { fontSize: 14, color: "#a3a3a3", marginTop: -16 },
});
