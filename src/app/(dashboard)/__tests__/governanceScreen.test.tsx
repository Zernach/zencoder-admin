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
    DataTable: ({ columns }: { columns: Array<{ header: string }> }) => (
      <View>
        {columns.map((column) => (
          <Text key={column.header}>{column.header}</Text>
        ))}
      </View>
    ),
  };
});

const GovernanceScreen = require("../governance").default;

function createGovernanceData(seedData: SeedData): GovernanceResponse {
  return {
    policyViolationCount: 5,
    policyViolationRate: 0.02,
    blockedNetworkAttempts: 2,
    auditEventsCount: 12,
    violationsByTeam: [
      { key: "Team Alpha", value: 3 },
      { key: "Team Beta", value: 2 },
    ],
    recentViolations: [],
    securityEvents: [],
    complianceItems: [
      { label: "Data Encryption", status: "compliant" },
    ],
    policyChanges: [],
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
});
