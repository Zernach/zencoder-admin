import React from "react";
import { render } from "@testing-library/react-native";
import { createTestSeedData } from "@/testing/testUtils";
import type { RunDetailResponse, SeedData } from "@/features/analytics/types";

const mockUseRunDetail = jest.fn();
const mockUseLocalSearchParams = jest.fn();
const mockUseAppDependencies = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock("@/features/analytics/hooks/useRunDetail", () => ({
  useRunDetail: () => mockUseRunDetail(),
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
    EmptyState: ({ message }: { message: string }) => <Text>{message}</Text>,
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

const RunDetailScreen = require("../[runId]").default;

function createRunDetail(seedData: SeedData, includePromptChain = true): RunDetailResponse {
  const run = seedData.runs[0]!;
  return {
    run,
    timeline: [
      { step: "queued", timestampIso: run.startedAtIso, detail: "Queued" },
      { step: "started", timestampIso: run.startedAtIso, detail: "Started" },
      { step: "tools", timestampIso: run.startedAtIso, detail: "Tools" },
      { step: "tests", timestampIso: run.startedAtIso, detail: "Tests" },
      { step: "artifact", timestampIso: run.startedAtIso, detail: "Artifacts" },
      { step: "completed", timestampIso: run.completedAtIso ?? run.startedAtIso, detail: "Done" },
    ],
    artifacts: {
      linesAdded: 12,
      linesRemoved: 3,
      prCreated: true,
      prMerged: false,
      testsExecuted: 14,
      testsPassed: 13,
    },
    policyContext: {
      blockedActions: ["network_egress"],
      allowedActions: ["file_read", "file_write"],
      networkMode: "limited",
    },
    promptChain: includePromptChain
      ? [
          {
            id: `${run.id}_m1`,
            order: 1,
            role: "system",
            content: "System policy loaded",
            contextTokensBefore: 0,
            inputTokens: 120,
            outputTokens: 24,
            contextTokensAfter: 144,
            inputCostUsd: 0.02,
            outputCostUsd: 0.01,
            totalCostUsd: 0.03,
            cumulativeCostUsd: 0.03,
          },
          {
            id: `${run.id}_m2`,
            order: 2,
            role: "assistant",
            content: "Working on code updates",
            contextTokensBefore: 144,
            inputTokens: 210,
            outputTokens: 130,
            contextTokensAfter: 484,
            inputCostUsd: 0.03,
            outputCostUsd: 0.03,
            totalCostUsd: 0.06,
            cumulativeCostUsd: 0.09,
          },
        ]
      : [],
    promptChainSummary: {
      totalMessages: includePromptChain ? 2 : 0,
      maxContextTokens: includePromptChain ? 484 : 0,
      totalInputTokens: includePromptChain ? 330 : 0,
      totalOutputTokens: includePromptChain ? 154 : 0,
      totalCostUsd: includePromptChain ? 0.09 : 0,
    },
  };
}

describe("RunDetailScreen", () => {
  const seedData = createTestSeedData();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ runId: seedData.runs[0]!.id });
    mockUseAppDependencies.mockReturnValue({ seedData });
  });

  it("renders prompt chain conversation and cost growth sections", () => {
    mockUseRunDetail.mockReturnValue({
      data: createRunDetail(seedData, true),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<RunDetailScreen />);

    expect(getByText("Prompt Chain Conversation")).toBeTruthy();
    expect(getByText("Cost Growth by Context Window")).toBeTruthy();
    expect(getByText("Message Cost")).toBeTruthy();
    expect(getByText("Cumulative Cost")).toBeTruthy();
    expect(getByText(/Later messages inherit larger context windows/i)).toBeTruthy();
  });

  it("renders empty state when prompt chain is unavailable", () => {
    mockUseRunDetail.mockReturnValue({
      data: createRunDetail(seedData, false),
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText } = render(<RunDetailScreen />);

    expect(getByText("Prompt chain unavailable for this run.")).toBeTruthy();
  });
});
