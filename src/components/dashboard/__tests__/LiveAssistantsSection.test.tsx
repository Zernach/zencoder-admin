import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import type { LiveAgentSession } from "@/features/analytics/types";
import { LiveAssistantsSection } from "../LiveAssistantsSection";
import { useLiveAgentSessions } from "@/features/analytics/hooks/useLiveAgentSessions";

const mockUseLiveAgentSessions = useLiveAgentSessions as jest.MockedFunction<typeof useLiveAgentSessions>;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("lucide-react-native", () => ({
  Check: () => null,
  AlertTriangle: () => null,
}));

jest.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

jest.mock("@/hooks/useSearchFilter", () => ({
  useSearchFilter: <T,>(data: T[]) => data,
}));

jest.mock("@/features/analytics/hooks/useLiveAgentSessions", () => ({
  useLiveAgentSessions: jest.fn(),
}));

jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    Circle: () => <View />,
  };
});

jest.mock("react-native-reanimated", () => {
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (component: unknown) => component,
    },
    Easing: {
      linear: {},
      out: () => ({}),
      cubic: {},
      bezier: () => ({}),
    },
    cancelAnimation: jest.fn(),
    useAnimatedProps: (fn: () => Record<string, unknown>) => fn(),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    useSharedValue: <T,>(value: T) => ({ value }),
    withRepeat: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});

jest.mock("@/components/lists", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    CustomList: ({
      flatListProps,
      children,
    }: {
      flatListProps?: {
        data: unknown[];
        keyExtractor?: (item: unknown, index: number) => string;
        renderItem: (info: {
          item: unknown;
          index: number;
          separators: {
            highlight: () => void;
            unhighlight: () => void;
            updateProps: () => void;
          };
        }) => React.ReactNode;
      };
      children?: React.ReactNode;
    }) => {
      if (!flatListProps) {
        return <View>{children}</View>;
      }

      return (
        <View testID="custom-list">
          {flatListProps.data.map((item, index) => (
            <View key={flatListProps.keyExtractor ? flatListProps.keyExtractor(item, index) : String(index)}>
              {flatListProps.renderItem({
                item,
                index,
                separators: {
                  highlight: () => undefined,
                  unhighlight: () => undefined,
                  updateProps: () => undefined,
                },
              })}
            </View>
          ))}
        </View>
      );
    },
  };
});

function createSession(overrides?: Partial<LiveAgentSession>): LiveAgentSession {
  return {
    sessionId: "session_1",
    runId: "run_1",
    agentId: "agent_1",
    agentName: "Code Pilot",
    projectName: "Admin Console",
    teamId: "team_1",
    teamName: "Alpha",
    userName: "Dana",
    status: "running",
    startedAtIso: "2026-03-10T14:00:00.000Z",
    currentTask: "Reviewing pull request",
    ...overrides,
  };
}

describe("LiveAssistantsSection", () => {
  beforeEach(() => {
    mockUseLiveAgentSessions.mockReset();
  });

  it("renders polished skeleton while loading with no sessions", () => {
    mockUseLiveAgentSessions.mockReturnValue({
      data: [],
      lastUpdatedIso: undefined,
      loading: true,
      error: undefined,
      refetch: jest.fn(),
    });
    const { getByTestId, queryByText } = render(<LiveAssistantsSection />);

    expect(getByTestId("live-assistants-skeleton")).toBeTruthy();
    expect(getByTestId("live-assistants-skeleton-card-0")).toBeTruthy();
    expect(queryByText("dashboard.live.emptySubtitle")).toBeNull();
  });

  it("renders empty state when not loading and no sessions", () => {
    mockUseLiveAgentSessions.mockReturnValue({
      data: [],
      lastUpdatedIso: undefined,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });
    const { getByText, queryByTestId } = render(<LiveAssistantsSection />);

    expect(queryByTestId("live-assistants-skeleton")).toBeNull();
    expect(getByText("dashboard.live.emptySubtitle")).toBeTruthy();
  });

  it("renders error state instead of skeleton when error is present", () => {
    mockUseLiveAgentSessions.mockReturnValue({
      data: [],
      lastUpdatedIso: undefined,
      loading: true,
      error: "live sessions failed",
      refetch: jest.fn(),
    });
    const { getByText, queryByTestId } = render(<LiveAssistantsSection />);

    expect(getByText("live sessions failed")).toBeTruthy();
    expect(queryByTestId("live-assistants-skeleton")).toBeNull();
  });

  it("renders live assistant cards when sessions are available", async () => {
    const sessions = [
      createSession(),
      createSession({
        sessionId: "session_2",
        runId: "run_2",
        agentId: "agent_2",
        agentName: "Issue Triage Bot",
        status: "queued",
      }),
    ];
    mockUseLiveAgentSessions.mockReturnValue({
      data: sessions,
      lastUpdatedIso: undefined,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { getByText, queryByTestId } = render(<LiveAssistantsSection />);

    await waitFor(() => {
      expect(getByText("Code Pilot")).toBeTruthy();
      expect(getByText("Issue Triage Bot")).toBeTruthy();
    });

    expect(queryByTestId("live-assistants-skeleton")).toBeNull();
  });
});
