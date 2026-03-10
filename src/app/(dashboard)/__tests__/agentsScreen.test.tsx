import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import type { AgentsHubResponse } from "@/features/analytics/types";

const mockPush = jest.fn();
const mockPathname = "/agents";

const mockUseAgentsHub = jest.fn();
const mockDispatch = jest.fn();
const mockSectionRef = jest.fn((_sectionId: string) => jest.fn());

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

jest.mock("@/features/analytics/hooks/useAgentsHub", () => ({
  useAgentsHub: () => mockUseAgentsHub(),
}));

jest.mock("@/hooks/useRegisterSection", () => ({
  useSectionRef: () => mockSectionRef,
}));

jest.mock("@/hooks/useSearchFilter", () => ({
  useSearchFilter: <T,>(data: T[]) => data,
}));

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => false,
  selectModalVisible: () => () => false,
  openModal: jest.fn((name: string) => ({ type: "modal/openModal", payload: name })),
  closeModal: jest.fn((name: string) => ({ type: "modal/closeModal", payload: name })),
  ModalName: {
    CreateProject: "createProject",
    CreateComplianceRule: "createComplianceRule",
    CreateSeat: "createSeat",
    CreateTeam: "createTeam",
    CreateAgent: "createAgent",
    SignOutNotice: "signOutNotice",
  },
}));

jest.mock("@/components/buttons", () => {
  const React = require("react");
  const { Pressable } = require("react-native");
  return {
    CustomButton: ({ children, onPress, accessibilityLabel, testID }: { children: React.ReactNode; onPress?: () => void; accessibilityLabel?: string; testID?: string }) => (
      <Pressable onPress={onPress} accessibilityLabel={accessibilityLabel} testID={testID}>
        {children}
      </Pressable>
    ),
  };
});

jest.mock("@/features/analytics/components/CreateAgentModal", () => ({
  CreateAgentModal: () => null,
}));

jest.mock("@/features/analytics/components/CreateProjectModal", () => ({
  CreateProjectModal: () => null,
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
    LineChart: () => <View />,
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
    DataTable: ({ columns, data }: { columns: Array<{ header: string; key: string; render?: (row: Record<string, unknown>) => React.ReactNode }>; data: Array<Record<string, unknown>> }) => (
      <View>
        {data.map((row, index) => (
          <View key={index} testID={`table-row-${index}`}>
            {columns.map((col) =>
              col.render ? <View key={col.key}>{col.render(row)}</View> : <Text key={col.key}>{String(row[col.key] ?? "")}</Text>
            )}
          </View>
        ))}
      </View>
    ),
    cellText: () => StyleSheet.create({
      primary: { color: "#e5e5e5", fontSize: 12 },
      secondary: { color: "#a3a3a3", fontSize: 12 },
      brand: { color: "#ff7a3d", fontSize: 12 },
      link: { color: "#ff7a3d", fontSize: 12, textDecorationLine: "underline" },
    }),
    getSuccessRateColor: () => "#f64a00",
    getSuccessRateGreenShadeColor: () => "#22c55e",
    chartColors: () => ({ success: "#f64a00", warning: "#f59e0b", error: "#ef4444" }),
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
      { key: "Timeout", value: 10, agentBreakdown: [{ key: "CodeBot", value: 6 }, { key: "TestRunner", value: 4 }] },
      { key: "Tool Error", value: 6, agentBreakdown: [{ key: "CodeBot", value: 4 }, { key: "Reviewer", value: 2 }] },
    ],
    reliabilityTrend: [
      { tsIso: "2026-03-01T00:00:00.000Z", value: 94 },
      { tsIso: "2026-03-02T00:00:00.000Z", value: 92 },
    ],
    p50DurationTrend: [
      { tsIso: "2026-03-01T00:00:00.000Z", value: 1100 },
      { tsIso: "2026-03-02T00:00:00.000Z", value: 1300 },
    ],
    p95DurationTrend: [
      { tsIso: "2026-03-01T00:00:00.000Z", value: 3200 },
      { tsIso: "2026-03-02T00:00:00.000Z", value: 3600 },
    ],
    p95QueueWaitTrend: [
      { tsIso: "2026-03-01T00:00:00.000Z", value: 200 },
      { tsIso: "2026-03-02T00:00:00.000Z", value: 300 },
    ],
    peakConcurrencyTrend: [
      { tsIso: "2026-03-01T00:00:00.000Z", value: 15 },
      { tsIso: "2026-03-02T00:00:00.000Z", value: 20 },
    ],
    agentBreakdown: [
      {
        agentId: "agent_1",
        agentName: "CodeBot",
        projectId: "project_1",
        projectName: "Frontend App",
        totalRuns: 100,
        successRate: 0.95,
        avgDurationMs: 1500,
        totalCostUsd: 250,
      },
    ],
    totalProjects: 5,
    activeProjects: 4,
    totalRuns: 1200,
    overallSuccessRate: 0.91,
    totalCostUsd: 5200,
    projectBreakdown: [
      {
        projectId: "project_1",
        projectName: "Frontend App",
        teamId: "team_1",
        teamName: "Team Alpha",
        totalRuns: 500,
        successRate: 0.91,
        totalCostUsd: 2100,
        avgCostPerRunUsd: 4.2,
        agentCount: 3,
      },
    ],
    recentRuns: [
      {
        id: "run_001",
        status: "succeeded",
        teamId: "team_1",
        userId: "user_1",
        projectId: "project_1",
        agentId: "agent_1",
        provider: "codex",
        modelId: "gpt-4.1",
        inputTokens: 1000,
        outputTokens: 500,
        totalTokens: 1500,
        costUsd: 2.45,
        queueWaitMs: 120,
        durationMs: 1800,
        startedAtIso: "2026-03-03T10:00:00.000Z",
      },
    ],
  };
}

describe("AgentsScreen", () => {
  beforeEach(() => {
    mockSectionRef.mockClear();
  });

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

  it("registers all sidebar subsection section IDs as scroll anchors", () => {
    mockUseAgentsHub.mockReturnValue({
      data: createAgentsHubData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<AgentsScreen />);

    const sectionIds = mockSectionRef.mock.calls.map((call) => call[0]);
    expect(sectionIds).toEqual(
      expect.arrayContaining([
        "reliability",
        "agent-performance",
        "project-breakdown",
        "recent-runs",
      ]),
    );
  });

  it("navigates to project detail when pressing project name in tables", () => {
    mockPush.mockClear();
    mockUseAgentsHub.mockReturnValue({
      data: createAgentsHubData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getAllByLabelText } = render(<AgentsScreen />);
    // Agent perf + project breakdown both show "View project Frontend App"
    const links = getAllByLabelText("View project Frontend App");
    expect(links.length).toBe(2);
    fireEvent.press(links[0]!);

    expect(mockPush).toHaveBeenCalledWith("/agents/project/project_1");
  });

  it("navigates to agent detail when pressing agent name in agent performance table", () => {
    mockPush.mockClear();
    mockUseAgentsHub.mockReturnValue({
      data: createAgentsHubData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<AgentsScreen />);
    fireEvent.press(getByLabelText("View agent CodeBot"));

    expect(mockPush).toHaveBeenCalledWith("/agents/agent/agent_1");
  });

  it("navigates to team detail when pressing team name in project breakdown table", () => {
    mockPush.mockClear();
    mockUseAgentsHub.mockReturnValue({
      data: createAgentsHubData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<AgentsScreen />);
    fireEvent.press(getByLabelText("View team Team Alpha"));

    expect(mockPush).toHaveBeenCalledWith("/agents/team/team_1");
  });

  it("navigates to run detail when pressing run ID in recent runs table", () => {
    mockPush.mockClear();
    mockUseAgentsHub.mockReturnValue({
      data: createAgentsHubData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<AgentsScreen />);
    fireEvent.press(getByLabelText("View run run_001"));

    expect(mockPush).toHaveBeenCalledWith("/agents/run/run_001");
  });

  it("renders four performance trend line charts in reliability section", () => {
    mockUseAgentsHub.mockReturnValue({
      data: createAgentsHubData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<AgentsScreen />);

    expect(getByText("agents.p50DurationTrend")).toBeTruthy();
    expect(getByText("agents.p95DurationTrend")).toBeTruthy();
    expect(getByText("agents.p95QueueWaitTrend")).toBeTruthy();
    expect(getByText("agents.peakConcurrencyTrend")).toBeTruthy();
  });

  it("does not render KpiCards for duration/queue/concurrency metrics", () => {
    mockUseAgentsHub.mockReturnValue({
      data: createAgentsHubData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { queryByText } = render(<AgentsScreen />);

    // Old KpiCard scalar labels should no longer appear
    expect(queryByText("agents.p50Duration: 1.2s")).toBeNull();
    expect(queryByText("agents.p95Duration: 3.4s")).toBeNull();
    expect(queryByText("agents.p95QueueWait: 0.3s")).toBeNull();
    expect(queryByText("agents.peakConcurrency: 18")).toBeNull();
  });

  it("still renders reliability trend and failure categories charts", () => {
    mockUseAgentsHub.mockReturnValue({
      data: createAgentsHubData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<AgentsScreen />);

    expect(getByText("agents.reliabilityTrend")).toBeTruthy();
    expect(getByText("agents.failureCategories")).toBeTruthy();
  });
});
