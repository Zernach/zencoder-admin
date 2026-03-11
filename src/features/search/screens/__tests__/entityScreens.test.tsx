import React from "react";
import { render } from "@testing-library/react-native";
import { AgentDetailScreen } from "../AgentDetailScreen";
import { ProjectDetailScreen } from "../ProjectDetailScreen";
import { TeamDetailScreen } from "../TeamDetailScreen";
import { HumanDetailScreen } from "../HumanDetailScreen";
import { RunDetailScreen } from "../RunDetailScreen";

jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));

jest.mock("@/features/analytics/hooks/useCurrencyFormatter", () => ({
  useCurrencyFormatter: () => ({
    formatCurrency: (n: number) => `€${n.toFixed(2)}`,
    formatCostPerToken: (n: number) => `€${Math.round(n * 1000000)} micro-units/token`,
    formatCompactCurrency: (n: number) => `€${n.toFixed(2)}`,
    currencyCode: "EUR",
    currencySymbol: "€",
  }),
}));

// Mock all dependencies
jest.mock("@/providers/ThemeProvider", () => ({
  useThemeMode: () => ({ mode: "dark", setMode: jest.fn(), toggleMode: jest.fn() }),
}));

jest.mock("@/components/dashboard", () => ({
  LoadingSkeleton: ({ variant }: { variant: string }) => {
    const { Text } = require("react-native");
    return <Text>Loading {variant}</Text>;
  },
  ErrorState: ({ message }: { message: string }) => {
    const { Text } = require("react-native");
    return <Text>Error: {message}</Text>;
  },
}));

jest.mock("@/components/screen", () => ({
  ScreenWrapper: ({ children, headerProps }: { children: React.ReactNode; headerProps?: { title?: string; subtitle?: string } }) => {
    const { Text, View } = require("react-native");
    return (
      <View>
        {headerProps?.title && <Text>{headerProps.title}</Text>}
        {headerProps?.subtitle && <Text>{headerProps.subtitle}</Text>}
        {children}
      </View>
    );
  },
  sectionStyles: {},
}));

jest.mock("@/components/tables", () => ({
  DataTable: ({ data, emptyMessage }: { data: unknown[]; emptyMessage?: string }) => {
    const { Text } = require("react-native");
    if (data.length === 0) return <Text>{emptyMessage ?? "No data"}</Text>;
    return <Text>DataTable ({data.length} rows)</Text>;
  },
}));

jest.mock("@/components/tables/cellStyles", () => {
  const base = { color: "#fff", fontSize: 12, fontWeight: "500" };
  const styles = {
    primary: base,
    secondary: base,
    brand: base,
    link: base,
    success: base,
    warning: base,
    error: base,
  };
  return {
    cellText: () => styles,
    getSuccessRateColor: () => "#00ca51",
    chartColors: () => ({ success: "#0f0", warning: "#ff0", error: "#f00" }),
  };
});

jest.mock("@/components/feedback/CustomSpinner", () => ({
  CustomSpinner: () => {
    const { View } = require("react-native");
    return <View testID="spinner" />;
  },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/agents",
}));

jest.mock("@/components/buttons", () => ({
  CustomButton: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
    const { Pressable } = require("react-native");
    return <Pressable onPress={onPress}>{children}</Pressable>;
  },
}));

jest.mock("@/constants/routes", () => ({
  ...jest.requireActual("@/constants/routes"),
  buildEntityRoute: (tab: string, type: string, id: string) => `/${tab}/${type}/${id}`,
  resolveTabFromPathname: (p: string) => p.replace("/", ""),
}));

jest.mock("@/store/api", () => ({
  useUpdateAgentDescriptionMutation: () => [jest.fn(), { isLoading: false }],
}));

jest.mock("@/store/hooks", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: (state: { filters: { orgId: string } }) => unknown) =>
    selector({ filters: { orgId: "org1" } }),
}));

jest.mock("@/components/inputs/CustomTextInput", () => ({
  CustomTextInput: ({ value, onChangeText, ...props }: { value: string; onChangeText: (v: string) => void; placeholder?: string; accessibilityLabel?: string }) => {
    const { TextInput } = require("react-native");
    return <TextInput value={value} onChangeText={onChangeText} {...props} />;
  },
}));

const mockAgentData = {
  data: {
    agent: { id: "a1", name: "Test Agent", projectId: "p1", description: "Classifies incoming tickets" },
    projectName: "Test Project",
    teamName: "Test Team",
    totalRuns: 42,
    successRate: 0.85,
    avgDurationMs: 5000,
    totalCostUsd: 123.45,
    recentRuns: [],
    userMap: {},
  },
  loading: false,
  error: undefined,
  refetch: jest.fn(),
};

const mockProjectData = {
  data: {
    project: { id: "p1", name: "Test Project", teamId: "t1" },
    teamName: "Test Team",
    agentCount: 3,
    totalRuns: 100,
    successRate: 0.9,
    totalCostUsd: 500,
    avgCostPerRunUsd: 5,
    agents: [],
    recentRuns: [],
  },
  loading: false,
  error: undefined,
  refetch: jest.fn(),
};

const mockTeamData = {
  data: {
    team: { id: "t1", name: "Test Team" },
    memberCount: 5,
    projectCount: 3,
    totalRuns: 200,
    successRate: 0.88,
    totalCostUsd: 1000,
    members: [],
    projects: [],
  },
  loading: false,
  error: undefined,
  refetch: jest.fn(),
};

const mockHumanData = {
  data: {
    user: { id: "u1", name: "Jane Doe", email: "jane@example.com", teamId: "t1" },
    teamName: "Test Team",
    totalRuns: 50,
    totalTokens: 100000,
    totalCostUsd: 75.5,
    recentRuns: [],
  },
  loading: false,
  error: undefined,
  refetch: jest.fn(),
};

const mockRunData = {
  data: {
    run: {
      id: "r1",
      status: "succeeded" as const,
      teamId: "t1",
      userId: "u1",
      projectId: "p1",
      agentId: "a1",
      provider: "claude" as const,
      modelId: "m1",
      inputTokens: 1000,
      outputTokens: 500,
      totalTokens: 1500,
      costUsd: 0.05,
      queueWaitMs: 100,
      durationMs: 5000,
      startedAtIso: "2025-01-01T00:00:00Z",
    },
    agentName: "Test Agent",
    projectName: "Test Project",
    teamName: "Test Team",
    userName: "Jane Doe",
  },
  loading: false,
  error: undefined,
  refetch: jest.fn(),
};

jest.mock("@/features/search/hooks", () => ({
  useAgentDetailScreen: () => mockAgentData,
  useProjectDetailScreen: () => mockProjectData,
  useTeamDetailScreen: () => mockTeamData,
  useHumanDetailScreen: () => mockHumanData,
  useRunDetailScreen: () => mockRunData,
}));

describe("Entity detail screens", () => {
  it("AgentDetailScreen renders agent data", () => {
    const { getByText } = render(<AgentDetailScreen agentId="a1" />);
    expect(getByText("Test Agent")).toBeTruthy();
    expect(getByText("42")).toBeTruthy();
    expect(getByText("€123.45")).toBeTruthy();
    expect(getByText("Classifies incoming tickets")).toBeTruthy();
    expect(getByText("entityDetail.promptDescription")).toBeTruthy();
  });

  it("ProjectDetailScreen renders project data", () => {
    const { getByText } = render(<ProjectDetailScreen projectId="p1" />);
    expect(getByText("Test Project")).toBeTruthy();
    expect(getByText("3")).toBeTruthy(); // agentCount
  });

  it("TeamDetailScreen renders team data", () => {
    const { getByText } = render(<TeamDetailScreen teamId="t1" />);
    expect(getByText("Test Team")).toBeTruthy();
    expect(getByText("5")).toBeTruthy(); // memberCount
  });

  it("HumanDetailScreen renders human data", () => {
    const { getByText } = render(<HumanDetailScreen humanId="u1" />);
    expect(getByText("Jane Doe")).toBeTruthy();
    expect(getByText("€75.50")).toBeTruthy();
  });

  it("RunDetailScreen renders run data", () => {
    const { getByText } = render(<RunDetailScreen runId="r1" />);
    expect(getByText("Run r1")).toBeTruthy();
  });
});
