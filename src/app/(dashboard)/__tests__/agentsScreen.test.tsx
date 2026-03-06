import React from "react";
import { render } from "@testing-library/react-native";
import type { AgentsHubResponse } from "@/features/analytics/types";

const mockUseAgentsHub = jest.fn();

jest.mock("@/features/analytics/hooks/useAgentsHub", () => ({
  useAgentsHub: () => mockUseAgentsHub(),
}));

jest.mock("@/hooks/useSearchFilter", () => ({
  useSearchFilter: <T,>(data: T[]) => data,
}));

jest.mock("@/features/analytics/hooks/useCreateProject", () => ({
  useCreateProject: () => ({
    create: jest.fn().mockResolvedValue({ project: { id: "proj_1" } }),
    loading: false,
    error: undefined,
    lastResult: undefined,
  }),
}));

jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    X: () => <Text>X</Text>,
  };
});

jest.mock("@/features/analytics/components/CreateProjectForm", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    CreateProjectForm: () => <Text>CreateProjectForm</Text>,
  };
});

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
    SectionHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
      <View>
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
      </View>
    ),
    KpiCard: ({ title, value }: { title: string; value: string }) => <Text>{`${title}: ${value}`}</Text>,
    CardGrid: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    LoadingSkeleton: () => <Text>Loading</Text>,
    ErrorState: ({ message }: { message: string }) => <Text>{message}</Text>,
    StatusBadge: ({ status }: { status: string }) => <Text>{status}</Text>,
  };
});

jest.mock("@/components/charts", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    ChartCard: ({ title, children }: { title: string; children: React.ReactNode }) => (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    ),
    TrendChart: () => <View />,
    BreakdownChart: ({
      data,
      truncateLabels,
    }: {
      data: Array<{ key: string; value: number }>;
      truncateLabels?: boolean;
    }) => (
      <View>
        <Text testID="truncateLabels">{String(truncateLabels ?? true)}</Text>
        {data.map((item) => (
          <Text key={item.key}>{item.key}</Text>
        ))}
      </View>
    ),
  };
});

jest.mock("@/components/tables", () => {
  const React = require("react");
  const { View, Text, StyleSheet } = require("react-native");
  return {
    DataTable: ({ data }: { data: Array<Record<string, unknown>> }) => (
      <View>
        {data.map((row, index) => (
          <Text key={index}>{JSON.stringify(row)}</Text>
        ))}
      </View>
    ),
    cellText: () => StyleSheet.create({
      primary: { color: "#e5e5e5", fontSize: 12 },
      secondary: { color: "#a3a3a3", fontSize: 12 },
      brand: { color: "#67c4ea", fontSize: 12 },
    }),
    getSuccessRateColor: () => "#22c55e",
    chartColors: () => ({ success: "#22c55e", warning: "#f59e0b", error: "#ef4444" }),
  };
});

const AgentsScreen = require("../agents").default;

function createAgentsHubData(): AgentsHubResponse {
  return {
    runSuccessRate: 0.92,
    errorRate: 0.08,
    p50RunDurationMs: 1200,
    p95RunDurationMs: 3400,
    p95QueueWaitMs: 250,
    peakConcurrency: 18,
    failureCategoryBreakdown: [
      { key: "Timeout", value: 10 },
      { key: "Tool Error", value: 6 },
    ],
    reliabilityTrend: [
      { tsIso: "2026-03-01T00:00:00.000Z", value: 94 },
      { tsIso: "2026-03-02T00:00:00.000Z", value: 92 },
    ],
    agentBreakdown: [],
    totalProjects: 5,
    activeProjects: 4,
    totalRuns: 1200,
    overallSuccessRate: 0.91,
    totalCostUsd: 5200,
    projectBreakdown: [],
    recentRuns: [],
  };
}

describe("AgentsScreen", () => {
  it("passes truncateLabels=false to failure categories breakdown chart", () => {
    mockUseAgentsHub.mockReturnValue({
      data: createAgentsHubData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getAllByTestId } = render(<AgentsScreen />);
    const truncateFlags = getAllByTestId("truncateLabels");
    const hasFalse = truncateFlags.some((el) => el.props.children === "false");

    expect(hasFalse).toBe(true);
  });
});
