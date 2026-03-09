import React from "react";
import { render } from "@testing-library/react-native";
import { AgentDetailScreen } from "../AgentDetailScreen";
import { ProjectDetailScreen } from "../ProjectDetailScreen";
import { TeamDetailScreen } from "../TeamDetailScreen";
import { HumanDetailScreen } from "../HumanDetailScreen";
import { RunDetailScreen } from "../RunDetailScreen";

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
  ScreenWrapper: ({ children }: { children: React.ReactNode }) => children,
  sectionStyles: {},
}));

const mockAgentData = {
  data: {
    agent: { id: "a1", name: "Test Agent", projectId: "p1" },
    projectName: "Test Project",
    teamName: "Test Team",
    totalRuns: 42,
    successRate: 0.85,
    avgDurationMs: 5000,
    totalCostUsd: 123.45,
    recentRuns: [],
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
    expect(getByText("$123.45")).toBeTruthy();
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
    expect(getByText("$75.50")).toBeTruthy();
  });

  it("RunDetailScreen renders run data", () => {
    const { getByText } = render(<RunDetailScreen runId="r1" />);
    expect(getByText("Run r1")).toBeTruthy();
    expect(getByText("succeeded")).toBeTruthy();
  });
});
