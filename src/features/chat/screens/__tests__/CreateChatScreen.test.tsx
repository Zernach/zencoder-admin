import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { TABS } from "@/constants/routes";
import type { CreateChatRequest, CreateChatResponse } from "@/features/chat/types";
import { CreateChatScreen } from "../CreateChatScreen";

const mockReplace = jest.fn();
const mockCreateChat = jest.fn(
  async (_request: CreateChatRequest): Promise<CreateChatResponse> => ({
    chat: {
      id: "chat-suggested-1",
      tab: TABS.AGENTS,
      topics: ["Agents"],
      title: "chat.topics.agents.message",
      preview: "Stub preview",
      updatedAtIso: "2026-03-11T12:00:00.000Z",
      messageCount: 3,
      unreadCount: 0,
      status: "active",
    },
  }),
);

const mockReduxState = {
  filters: {
    orgId: "org-test-123",
  },
  navigationHistory: {
    mostRecentTab: TABS.AGENTS,
  },
};

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: { View },
    useAnimatedKeyboard: () => ({ height: { value: 0 } }),
    useAnimatedStyle: (updater: () => object) => updater(),
  };
});

jest.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => "desktop",
}));

jest.mock("@/store", () => ({
  selectMostRecentTab: (state: { navigationHistory: { mostRecentTab: string } }) =>
    state.navigationHistory.mostRecentTab,
}));

jest.mock("@/store/hooks", () => ({
  useAppSelector: (selector: (state: typeof mockReduxState) => unknown) => selector(mockReduxState),
}));

jest.mock("@/store/slices/filtersSlice", () => ({
  selectOrgId: (state: { filters: { orgId: string } }) => state.filters.orgId,
}));

jest.mock("@/core/di", () => ({
  useAppDependencies: () => ({
    chatService: {
      createChat: mockCreateChat,
    },
  }),
}));

jest.mock("@/components/screen", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    ScreenWrapper: ({
      children,
      bottomAccessory,
    }: {
      children: React.ReactNode;
      bottomAccessory?: React.ReactNode;
    }) => (
      <View>
        <View>{children}</View>
        {bottomAccessory}
      </View>
    ),
  };
});

jest.mock("@/features/chat/components", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  return {
    InfiniteHorizontalScrollview: ({
      prompts,
      onPressPrompt,
      disabled,
    }: {
      prompts: readonly { label: string; message: string }[];
      onPressPrompt: (promptMessage: string) => void;
      disabled?: boolean;
    }) => (
      <View>
        {prompts.map((prompt, index) => (
          <Pressable
            key={`${prompt.label}-${index}`}
            onPress={() => onPressPrompt(prompt.message)}
            testID={`suggestion-${index}`}
            disabled={disabled}
          >
            <Text>{prompt.label}</Text>
          </Pressable>
        ))}
      </View>
    ),
  };
});

describe("CreateChatScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockCreateChat.mockReset();
    mockCreateChat.mockResolvedValue({
      chat: {
        id: "chat-suggested-1",
        tab: TABS.AGENTS,
        topics: ["Agents"],
        title: "chat.topics.agents.message",
        preview: "Stub preview",
        updatedAtIso: "2026-03-11T12:00:00.000Z",
        messageCount: 3,
        unreadCount: 0,
        status: "active",
      },
    });
  });

  it("submits selected suggested prompt and opens the new conversation", async () => {
    const { getByTestId } = render(<CreateChatScreen />);

    fireEvent.press(getByTestId("suggestion-0"));

    await waitFor(() => expect(mockCreateChat).toHaveBeenCalledTimes(1));
    expect(mockCreateChat).toHaveBeenCalledWith({
      orgId: mockReduxState.filters.orgId,
      tab: mockReduxState.navigationHistory.mostRecentTab,
      title: "chat.topics.agents.message",
      firstMessage: "chat.topics.agents.message",
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/chat/chat-suggested-1");
    });
  });
});
