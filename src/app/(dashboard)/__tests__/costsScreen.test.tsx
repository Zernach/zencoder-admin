import React from "react";
import { render } from "@testing-library/react-native";
import type { CostResponse } from "@/features/analytics/types";

const mockUseCostDashboard = jest.fn();

jest.mock("@/features/analytics/hooks/useCostDashboard", () => ({
  useCostDashboard: () => mockUseCostDashboard(),
}));

jest.mock("@/hooks/useSearchFilter", () => ({
  useSearchFilter: <T,>(data: T[]) => data,
}));

jest.mock("@/components/screen", () => {
  const React = require("react");
  const { View } = require("react-native");
  const { StyleSheet } = require("react-native");
  return {
    ScreenWrapper: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    sectionStyles: StyleSheet.create({ section: { gap: 12 }, chartRow: { flexDirection: "row", gap: 16 } }),
  };
});

jest.mock("@/components/dashboard", () => {
  const React = require("react");
  const { Text, View } = require("react-native");
  return {
    SectionHeader: ({ title }: { title: string }) => <Text>{title}</Text>,
    KpiCard: ({ title, value }: { title: string; value: string }) => <Text>{`${title}: ${value}`}</Text>,
    CardGrid: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    LoadingSkeleton: () => <Text>Loading</Text>,
    ErrorState: ({ message }: { message: string }) => <Text>{message}</Text>,
  };
});

jest.mock("@/components/charts", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    ChartCard: ({ title, children }: { title: string; children: React.ReactNode }) => (
      <View><Text>{title}</Text>{children}</View>
    ),
    TrendChart: () => <View />,
    BreakdownChart: ({ data, truncateLabels }: { data: Array<{ key: string; value: number }>; truncateLabels?: boolean }) => (
      <View>
        <Text testID="truncateLabels">{String(truncateLabels ?? true)}</Text>
        {data.map((item) => (
          <Text key={item.key}>{item.key}</Text>
        ))}
      </View>
    ),
    DonutChart: () => <View />,
    ProviderCostChart: () => <View />,
  };
});

const CostAnalyticsScreen = require("../costs").default;

function createCostData(): CostResponse {
  return {
    totalCostUsd: 12500,
    averageCostPerRunUsd: 1.25,
    costPerSuccessfulRunUsd: 1.45,
    costTrend: [{ tsIso: "2026-03-01T00:00:00.000Z", value: 400 }],
    costBreakdown: [
      { key: "Enterprise Cloud Migration Platform with Extended Name", totalCostUsd: 5000, runsStarted: 200, averageCostPerRunUsd: 25, percentOfTotal: 0.4 },
      { key: "Internal Developer Tools Dashboard Project", totalCostUsd: 3500, runsStarted: 150, averageCostPerRunUsd: 23.33, percentOfTotal: 0.28 },
      { key: "Customer Analytics Reporting Suite v2", totalCostUsd: 2000, runsStarted: 100, averageCostPerRunUsd: 20, percentOfTotal: 0.16 },
    ],
    providerBreakdown: [
      { provider: "codex", totalCostUsd: 8000, runCount: 300, totalTokens: 500000, percentOfTotal: 0.64 },
    ],
    budget: {
      budgetUsd: 60000,
      spentUsd: 12500,
      remainingUsd: 47500,
      forecastMonthEndUsd: 15000,
    },
  };
}

describe("CostAnalyticsScreen", () => {
  it("renders full project names in Project Breakdown without truncation", () => {
    mockUseCostDashboard.mockReturnValue({
      data: createCostData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<CostAnalyticsScreen />);

    expect(getByText("Enterprise Cloud Migration Platform with Extended Name")).toBeTruthy();
    expect(getByText("Internal Developer Tools Dashboard Project")).toBeTruthy();
    expect(getByText("Customer Analytics Reporting Suite v2")).toBeTruthy();
  });

  it("passes truncateLabels=false to Project Breakdown chart", () => {
    mockUseCostDashboard.mockReturnValue({
      data: createCostData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getAllByTestId } = render(<CostAnalyticsScreen />);
    const truncateFlags = getAllByTestId("truncateLabels");
    // The Project Breakdown BreakdownChart should have truncateLabels=false
    const hasFalse = truncateFlags.some((el) => el.props.children === "false");
    expect(hasFalse).toBe(true);
  });
});
