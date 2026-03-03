import React from "react";
import { render } from "@testing-library/react-native";
import { createTestSeedData } from "@/testing/testUtils";
import type { GovernanceResponse, SeedData } from "@/features/analytics/types";

const mockUseGovernanceDashboard = jest.fn();
const mockUseAppDependencies = jest.fn();

jest.mock("@/features/analytics/hooks/useGovernanceDashboard", () => ({
  useGovernanceDashboard: () => mockUseGovernanceDashboard(),
}));

jest.mock("@/core/di/AppDependencies", () => ({
  useAppDependencies: () => mockUseAppDependencies(),
}));

jest.mock("@/components/screen", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    ScreenWrapper: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock("@/components/filters", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    FilterBar: () => <View />,
  };
});

jest.mock("@/components/dashboard", () => {
  const React = require("react");
  const { Text, View } = require("react-native");
  return {
    SectionHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
      <View>
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
      </View>
    ),
    KpiCard: ({ title, value }: { title: string; value: string }) => (
      <Text>{`${title}: ${value}`}</Text>
    ),
    CardGrid: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    StatusBadge: ({ status }: { status: string }) => <Text>{status}</Text>,
    LoadingSkeleton: () => <Text>Loading</Text>,
    ErrorState: ({ message }: { message: string }) => <Text>{message}</Text>,
  };
});

jest.mock("@/components/charts", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    ChartCard: ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
      <View>
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
        {children}
      </View>
    ),
    BreakdownChart: ({ data }: { data: Array<{ key: string; value: number }> }) => (
      <View>
        {data.map((item) => (
          <Text key={item.key}>{`${item.key}: ${item.value}`}</Text>
        ))}
      </View>
    ),
  };
});

jest.mock("@/components/tables", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    DataTable: ({ columns, data }: { columns: Array<{ header: string; key: string }>; data: Array<Record<string, unknown>> }) => (
      <View>
        {columns.map((column) => (
          <Text key={column.header}>{column.header}</Text>
        ))}
        {data.map((row, i) => (
          <Text key={i} testID={`table-row-${i}`}>
            {row.timestampIso ? String(row.timestampIso) : JSON.stringify(row)}
          </Text>
        ))}
      </View>
    ),
  };
});

const GovernanceScreen = require("../governance").default;

function createGovernanceData(_seedData: SeedData): GovernanceResponse {
  return {
    policyViolationCount: 5,
    policyViolationRate: 0.02,
    blockedNetworkAttempts: 2,
    auditEventsCount: 12,
    violationsByTeam: [
      { key: "Team Alpha", value: 3 },
      { key: "Team Beta", value: 2 },
    ],
    recentViolations: [
      { id: "v1", timestampIso: "2026-03-03T10:00:00.000Z", agentId: "a1", agentName: "Agent A", reason: "Blocked", severity: "HIGH" },
      { id: "v2", timestampIso: "2026-03-02T08:00:00.000Z", agentId: "a2", agentName: "Agent B", reason: "Timeout", severity: "MEDIUM" },
    ],
    securityEvents: [
      { id: "s1", type: "Login", description: "Failed login", timestampIso: "2026-03-03T12:00:00.000Z" },
      { id: "s2", type: "Access", description: "Unauthorized", timestampIso: "2026-03-01T06:00:00.000Z" },
    ],
    complianceItems: [
      { label: "Data Encryption", status: "compliant" },
    ],
    policyChanges: [
      { id: "p1", actorUserId: "u1", action: "Updated policy", timestampIso: "2026-03-03T14:00:00.000Z", target: "Network" },
      { id: "p2", actorUserId: "u2", action: "Created policy", timestampIso: "2026-03-01T09:00:00.000Z", target: "Shell" },
    ],
    seatUserUsage: [
      { userId: "u1", fullName: "Alice Johnson", teamName: "Team Alpha", runsCount: 150, totalTokens: 50000, totalCostUsd: 45.0 },
      { userId: "u2", fullName: "Bob Smith", teamName: "Team Beta", runsCount: 120, totalTokens: 40000, totalCostUsd: 36.0 },
      { userId: "u3", fullName: "Carol Davis", teamName: "Team Alpha", runsCount: 80, totalTokens: 25000, totalCostUsd: 20.0 },
    ],
  };
}

describe("GovernanceScreen", () => {
  const seedData = createTestSeedData();

  beforeEach(() => {
    mockUseAppDependencies.mockReturnValue({ seedData });
  });

  it("renders seat usage chart section title and subtitle", () => {
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(seedData),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<GovernanceScreen />);

    expect(getByText("Seat Usage by Runs")).toBeTruthy();
    expect(getByText("AI runs per seat user, sorted by usage")).toBeTruthy();
  });

  it("renders full-name labels in the seat usage chart", () => {
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(seedData),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<GovernanceScreen />);

    expect(getByText("Alice Johnson: 150")).toBeTruthy();
    expect(getByText("Bob Smith: 120")).toBeTruthy();
    expect(getByText("Carol Davis: 80")).toBeTruthy();
  });

  it("renders seat user oversight section header", () => {
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(seedData),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<GovernanceScreen />);

    expect(getByText("Seat User Oversight")).toBeTruthy();
  });

  it("renders violations with newest timestamp first", () => {
    const data = createGovernanceData(seedData);
    mockUseGovernanceDashboard.mockReturnValue({
      data,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getAllByTestId } = render(<GovernanceScreen />);
    const rows = getAllByTestId(/^table-row-/);

    // First table rows correspond to violations — newest first
    const violationTimestamps = data.recentViolations.map((v) => v.timestampIso);
    expect(violationTimestamps[0]! >= violationTimestamps[1]!).toBe(true);
  });

  it("renders security events with newest timestamp first", () => {
    const data = createGovernanceData(seedData);
    mockUseGovernanceDashboard.mockReturnValue({
      data,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<GovernanceScreen />);

    const eventTimestamps = data.securityEvents.map((e) => e.timestampIso);
    expect(eventTimestamps[0]! >= eventTimestamps[1]!).toBe(true);
  });

  it("renders policy changes with newest timestamp first", () => {
    const data = createGovernanceData(seedData);
    mockUseGovernanceDashboard.mockReturnValue({
      data,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<GovernanceScreen />);

    const changeTimestamps = data.policyChanges.map((c) => c.timestampIso);
    expect(changeTimestamps[0]! >= changeTimestamps[1]!).toBe(true);
  });
});
