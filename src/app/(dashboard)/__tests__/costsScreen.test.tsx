import React from "react";
import { render } from "@testing-library/react-native";
import type { CostResponse } from "@/features/analytics/types";

const mockUseCostDashboard = jest.fn();
const mockSectionRef = jest.fn((_sectionId: string) => jest.fn());

jest.mock("@/features/analytics/hooks/useCostDashboard", () => ({
  useCostDashboard: () => mockUseCostDashboard(),
}));

jest.mock("@/hooks/useRegisterSection", () => ({
  useSectionRef: () => mockSectionRef,
}));

jest.mock("@/hooks/useSearchFilter", () => ({
  useSearchFilter: <T,>(data: T[]) => data,
}));

jest.mock("@/components/screen", () => {
  const React = require("react");
  const { View } = require("react-native");
  const { StyleSheet } = require("react-native");
  const { spacing: tokenSpacing } = require("@/theme/tokens");
  return {
    ScreenWrapper: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    sectionStyles: StyleSheet.create({ section: { gap: tokenSpacing[12] }, chartRow: { flexDirection: "row", gap: tokenSpacing[16] } }),
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
    LineChart: () => <View />,
    BarChart: ({ data, truncateLabels }: { data?: Array<{ key?: string; label?: string; value: number }>; truncateLabels?: boolean }) => (
      <View>
        <View testID="bar-chart" />
        <Text testID="truncateLabels">{String(truncateLabels ?? true)}</Text>
        {(data ?? []).map((item) => (
          <Text key={item.key ?? item.label}>{item.key ?? item.label}</Text>
        ))}
      </View>
    ),
    DonutChart: () => <View />,
    ProviderCostChart: () => <View testID="provider-cost-chart" />,
    ProviderTokenCostBarChart: () => <View testID="provider-token-cost-bar-chart" />,
  };
});

jest.mock("@/providers/ThemeProvider", () => ({
  useThemeMode: () => ({ mode: "dark" }),
}));

jest.mock("@/theme/themes", () => ({
  semanticThemes: {
    dark: {
      text: { brand: "#f64a00" },
      state: { warning: "#f59e0b", info: "#38bdf8" },
    },
    light: {
      text: { brand: "#f64a00" },
      state: { warning: "#a16207", info: "#0369a1" },
    },
  },
}));

jest.mock("@/features/analytics/hooks/useCurrencyFormatter", () => ({
  useCurrencyFormatter: () => ({
    formatCurrency: (n: number) => `€${n.toFixed(2)}`,
    formatCostPerToken: (n: number) => `€${Math.round(n * 1000000)} micro-units/token`,
    formatCompactCurrency: (n: number) => `€${n.toFixed(2)}`,
    currencyCode: "EUR",
    currencySymbol: "€",
  }),
}));

jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));

const CostAnalyticsScreen = require("../costs").default;

function createCostData(): CostResponse {
  return {
    totalCostUsd: 12500,
    averageCostPerRunUsd: 1.25,
    costPerSuccessfulRunUsd: 1.45,
    costTrend: [{ tsIso: "2026-03-01T00:00:00.000Z", value: 400 }],
    costPerTeam: [
      { teamId: "team-alpha", teamName: "Team Alpha", totalCostUsd: 6500, runsStarted: 260, averageCostPerRunUsd: 25, percentOfTotal: 0.52 },
      { teamId: "team-beta", teamName: "Team Beta", totalCostUsd: 4000, runsStarted: 170, averageCostPerRunUsd: 23.53, percentOfTotal: 0.32 },
      { teamId: "team-gamma", teamName: "Team Gamma", totalCostUsd: 2000, runsStarted: 100, averageCostPerRunUsd: 20, percentOfTotal: 0.16 },
    ],
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
  beforeEach(() => {
    mockSectionRef.mockClear();
  });

  it("renders Cost per Team and Cost per Project chart titles", () => {
    mockUseCostDashboard.mockReturnValue({
      data: createCostData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText, getAllByText } = render(<CostAnalyticsScreen />);

    expect(getByText("costs.costPerTeam")).toBeTruthy();
    expect(getAllByText("costs.costPerProject").length).toBeGreaterThan(0);
  });

  it("renders full project names in Cost per Project without truncation", () => {
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

  it("passes truncateLabels=false to Cost per Project chart", () => {
    mockUseCostDashboard.mockReturnValue({
      data: createCostData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getAllByTestId } = render(<CostAnalyticsScreen />);
    const truncateFlags = getAllByTestId("truncateLabels");
    // The Cost per Project BarChart should have truncateLabels=false
    const hasFalse = truncateFlags.some((el) => el.props.children === "false");
    expect(hasFalse).toBe(true);
  });

  it("renders both Provider Cost Share pie and Cost per Provider Token bar visualizations", () => {
    mockUseCostDashboard.mockReturnValue({
      data: createCostData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText, getByTestId } = render(<CostAnalyticsScreen />);

    expect(getByText("costs.costPerProvider")).toBeTruthy();
    expect(getByText("costs.costPerToken")).toBeTruthy();
    expect(getByTestId("provider-cost-chart")).toBeTruthy();
    expect(getByTestId("provider-token-cost-bar-chart")).toBeTruthy();
  });

  it("registers all sidebar subsection section IDs as scroll anchors", () => {
    mockUseCostDashboard.mockReturnValue({
      data: createCostData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<CostAnalyticsScreen />);

    const sectionIds = mockSectionRef.mock.calls.map((call) => call[0]);
    expect(sectionIds).toEqual(
      expect.arrayContaining([
        "budget-forecast",
        "cost-summary",
        "cost-by-provider",
      ]),
    );
  });
});
