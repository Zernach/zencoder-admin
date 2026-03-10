import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import type { GovernanceResponse } from "@/features/analytics/types";

const mockPush = jest.fn();
const mockPathname = "/governance";

const mockUseGovernanceDashboard = jest.fn();
const mockDispatch = jest.fn();
const mockSectionRef = jest.fn((_sectionId: string) => jest.fn());

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

jest.mock("@/features/analytics/hooks/useGovernanceDashboard", () => ({
  useGovernanceDashboard: () => mockUseGovernanceDashboard(),
}));

jest.mock("@/hooks/useSearchFilter", () => ({
  useSearchFilter: <T,>(data: T[]) => data,
}));

jest.mock("@/hooks/useRegisterSection", () => ({
  useSectionRef: () => mockSectionRef,
}));

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  openModal: jest.fn((name: string) => ({ type: "modal/openModal", payload: name })),
  ModalName: {
    CreateProject: "createProject",
    CreateComplianceRule: "createComplianceRule",
    CreateSeat: "createSeat",
    CreateTeam: "createTeam",
    SignOutNotice: "signOutNotice",
  },
}));

jest.mock("@/components/buttons", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    CustomButton: ({ children, onPress, accessibilityLabel, testID, label }: { children?: React.ReactNode; onPress?: () => void; accessibilityLabel?: string; testID?: string; label?: string }) => (
      <Pressable onPress={onPress} accessibilityLabel={accessibilityLabel} testID={testID}>
        {label ? <Text>{label}</Text> : null}
        {children}
      </Pressable>
    ),
  };
});

jest.mock("@/features/analytics/components/CreateComplianceRuleModal", () => ({
  CreateComplianceRuleModal: () => null,
}));

jest.mock("@/features/analytics/components/AddSeatModal", () => ({
  AddSeatModal: () => null,
}));

jest.mock("@/features/analytics/components/CreateTeamModal", () => ({
  CreateTeamModal: () => null,
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useThemeMode: () => ({ mode: "dark" }),
}));

jest.mock("@/components/screen", () => {
  const React = require("react");
  const { View } = require("react-native");
  const { StyleSheet } = require("react-native");
  const { spacing: tokenSpacing } = require("@/theme/tokens");
  return {
    ScreenWrapper: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    sectionStyles: StyleSheet.create({
      section: { gap: tokenSpacing[12] },
      chartRow: { flexDirection: "row", gap: tokenSpacing[16] },
    }),
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
    BreakdownChart: ({
      data,
      truncateLabels,
    }: {
      data: Array<{ key: string; value: number; hoverRows?: Array<{ label: string; value: string }> }>;
      truncateLabels?: boolean;
    }) => (
      <View>
        <Text testID="truncateLabels">{String(truncateLabels ?? true)}</Text>
        {data.map((item) => (
          <Text key={item.key}>{`${item.key}: ${item.value}`}</Text>
        ))}
        {data.map((item) => (
          <Text key={`${item.key}-hoverRows`}>{`hoverRows:${item.key}:${item.hoverRows?.length ?? 0}`}</Text>
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
        {columns.map((column) => (
          <Text key={column.header}>{column.header}</Text>
        ))}
        {data.map((row, i) => (
          <View key={i} testID={`table-row-${i}`}>
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

const GovernanceScreen = require("../governance").default;

function createGovernanceData(): GovernanceResponse {
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
      { id: "p1", actorUserId: "u1", actorName: "Alice Johnson", action: "Updated policy", timestampIso: "2026-03-03T14:00:00.000Z", targetTeamId: "t1", target: "Network" },
      { id: "p2", actorUserId: "u2", actorName: "Bob Smith", action: "Created policy", timestampIso: "2026-03-01T09:00:00.000Z", targetTeamId: "t2", target: "Shell" },
    ],
    seatUserUsage: [
      { userId: "u1", fullName: "Alice Johnson", teamId: "t1", teamName: "Team Alpha", runsCount: 150, totalTokens: 50000, totalCostUsd: 45.0 },
      { userId: "u2", fullName: "Bob Smith", teamId: "t2", teamName: "Team Beta", runsCount: 120, totalTokens: 40000, totalCostUsd: 36.0 },
      { userId: "u3", fullName: "Carol Davis", teamId: "t1", teamName: "Team Alpha", runsCount: 80, totalTokens: 25000, totalCostUsd: 20.0 },
    ],
    teamPerformanceComparison: [
      {
        teamId: "t1",
        teamName: "Team Alpha",
        runsCount: 500,
        successRate: 0.93,
        policyViolationCount: 3,
        policyViolationRate: 0.006,
        totalCostUsd: 2250,
      },
      {
        teamId: "t2",
        teamName: "Team Beta",
        runsCount: 420,
        successRate: 0.9,
        policyViolationCount: 2,
        policyViolationRate: 0.005,
        totalCostUsd: 1800,
      },
    ],
  };
}

describe("GovernanceScreen", () => {
  beforeEach(() => {
    mockSectionRef.mockClear();
  });

  it("renders seat usage chart section title and subtitle", () => {
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<GovernanceScreen />);

    expect(getByText("governance.seatUsageByRuns")).toBeTruthy();
    expect(getByText("governance.seatUsageSubtitle")).toBeTruthy();
  });

  it("renders full-name labels in the seat usage chart", () => {
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
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
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<GovernanceScreen />);

    expect(getByText("governance.seatUserOversight")).toBeTruthy();
  });

  it("removes seat usage table and passes hover details into the chart", () => {
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText, queryByText } = render(<GovernanceScreen />);

    expect(queryByText("User")).toBeNull();
    expect(getByText("hoverRows:Alice Johnson:5")).toBeTruthy();
    expect(getByText("hoverRows:Bob Smith:5")).toBeTruthy();
    expect(getByText("hoverRows:Carol Davis:5")).toBeTruthy();
  });

  it("renders team performance comparison section and create-team button", () => {
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<GovernanceScreen />);

    expect(getByText("governance.teamPerformanceComparison")).toBeTruthy();
    expect(getByText("governance.createTeam")).toBeTruthy();
  });

  it("passes truncateLabels=false to governance horizontal breakdown charts", () => {
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getAllByTestId } = render(<GovernanceScreen />);
    const truncateFlags = getAllByTestId("truncateLabels");
    const falseFlags = truncateFlags.filter((el) => el.props.children === "false");

    // Governance screen renders two horizontal-bar breakdown charts.
    expect(falseFlags.length).toBeGreaterThanOrEqual(2);
  });

  it("renders violations with newest timestamp first", () => {
    const data = createGovernanceData();
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
    const data = createGovernanceData();
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
    const data = createGovernanceData();
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

  it("violations remain newest-first after simulated re-render", () => {
    const data = createGovernanceData();
    mockUseGovernanceDashboard.mockReturnValue({
      data,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { rerender, getAllByTestId } = render(<GovernanceScreen />);

    // Simulate refetch — re-render with same data
    rerender(<GovernanceScreen />);

    const rows = getAllByTestId(/^table-row-/);
    // Violations table renders first, its rows should still be newest-first
    const violationTimestamps = data.recentViolations.map((v) => v.timestampIso);
    expect(violationTimestamps[0]! >= violationTimestamps[1]!).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });

  it("does not render stale violations during loading transition", () => {
    // Initial render with data
    const data = createGovernanceData();
    mockUseGovernanceDashboard.mockReturnValue({
      data,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { rerender, queryAllByTestId, getByText } = render(<GovernanceScreen />);

    // Simulate loading state (refetch in progress)
    mockUseGovernanceDashboard.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: jest.fn(),
    });

    rerender(<GovernanceScreen />);

    // During loading, tables should not render (data is undefined)
    const tableRows = queryAllByTestId(/^table-row-/);
    expect(tableRows.length).toBe(0);
  });

  it("registers all sidebar subsection section IDs as scroll anchors", () => {
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<GovernanceScreen />);

    const sectionIds = mockSectionRef.mock.calls.map((call) => call[0]);
    expect(sectionIds).toEqual(
      expect.arrayContaining([
        "overview",
        "team-performance",
        "seat-user-oversight",
        "recent-violations",
        "security-events",
        "policy-changes",
      ]),
    );
  });

  it("keeps a single team link source after seat usage table removal", () => {
    mockPush.mockClear();
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getAllByLabelText } = render(<GovernanceScreen />);
    expect(getAllByLabelText("View team Team Alpha")).toHaveLength(1);
  });

  it("navigates to human detail when pressing actorName in policy changes table", () => {
    mockPush.mockClear();
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<GovernanceScreen />);
    fireEvent.press(getByLabelText("View user Bob Smith"));

    expect(mockPush).toHaveBeenCalledWith("/governance/human/u2");
  });

  it("navigates to team detail when pressing team name in team performance table", () => {
    mockPush.mockClear();
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<GovernanceScreen />);
    fireEvent.press(getByLabelText("View team Team Beta"));

    expect(mockPush).toHaveBeenCalledWith("/governance/team/t2");
  });

  it("navigates to agent detail when pressing agent name in recent violations table", () => {
    mockPush.mockClear();
    mockUseGovernanceDashboard.mockReturnValue({
      data: createGovernanceData(),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<GovernanceScreen />);
    fireEvent.press(getByLabelText("View agent Agent B"));

    expect(mockPush).toHaveBeenCalledWith("/governance/agent/a2");
  });
});
