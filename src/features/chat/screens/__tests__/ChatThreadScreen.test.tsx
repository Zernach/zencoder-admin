import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { TABS } from "@/constants/routes";
import type { GetChatThreadResponse, SendMessageResponse } from "@/features/chat/types";
import { ChatThreadScreen } from "../ChatThreadScreen";

const mockSendMessage = jest.fn(
  async (): Promise<SendMessageResponse> => ({
    userMessage: {
      id: "server-user-1",
      chatId: "chat-42",
      role: "user",
      authorName: "Admin",
      content: "Need fresh guidance on priorities.",
      createdAtIso: "2026-03-11T12:01:00.000Z",
    },
    assistantMessage: {
      id: "server-assistant-1",
      chatId: "chat-42",
      role: "assistant",
      authorName: "Zencoder",
      content: "Here is a proposed short list of priorities.",
      createdAtIso: "2026-03-11T12:01:01.000Z",
    },
  }),
);

const mockUseChatThread = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useThemeMode: () => ({ mode: "dark" }),
}));

jest.mock("@/store/hooks", () => ({
  useAppSelector: () => "org-test-123",
}));

jest.mock("@/store/slices/filtersSlice", () => ({
  selectOrgId: () => "org-test-123",
}));

jest.mock("@/core/di", () => ({
  useAppDependencies: () => ({
    chatService: {
      sendMessage: mockSendMessage,
    },
  }),
}));

jest.mock("@/features/chat/hooks", () => ({
  useChatThread: () => mockUseChatThread(),
}));

jest.mock("@/components/screen", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  return {
    ScreenWrapper: ({
      headerProps,
      children,
      bottomAccessory,
    }: {
      headerProps?: { title: string; subtitle?: string };
      children: React.ReactNode;
      bottomAccessory?: React.ReactNode;
    }) => (
      <View>
        {headerProps ? (
          <View>
            <Text testID="screen-header-title">{headerProps.title}</Text>
            {headerProps.subtitle ? (
              <Text testID="screen-header-subtitle">{headerProps.subtitle}</Text>
            ) : null}
          </View>
        ) : null}
        <View>{children}</View>
        {bottomAccessory}
      </View>
    ),
  };
});

jest.mock("@/components/dashboard", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  return {
    LoadingSkeleton: () => <View testID="loading-skeleton" />,
    ErrorState: ({ message }: { message: string }) => <Text>{message}</Text>,
  };
});

jest.mock("@/components/buttons", () => ({
  CustomButton: ({
    label,
    onPress,
    disabled,
  }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  }) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable onPress={disabled ? undefined : onPress} accessibilityRole="button">
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

jest.mock("@/components/inputs", () => ({
  CustomTextInput: ({
    value,
    onChangeText,
    placeholder,
    accessibilityLabel,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    accessibilityLabel?: string;
  }) => {
    const { TextInput } = require("react-native");
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel}
      />
    );
  },
}));

jest.mock("@/components/lists", () => ({
  CustomList: ({
    flatListProps,
    scrollViewProps,
    children,
  }: {
    flatListProps?: {
      data: readonly unknown[];
      renderItem: (info: { item: unknown; index: number }) => React.ReactElement;
      ListFooterComponent?: React.ReactNode;
    };
    scrollViewProps?: unknown;
    children?: React.ReactNode;
  }) => {
    const { View } = require("react-native");
    if (scrollViewProps) {
      return <View>{children}</View>;
    }
    if (!flatListProps) {
      return <View />;
    }
    return (
      <View>
        {flatListProps.data.map((item, index) => (
          <View key={`item-${index}`}>
            {flatListProps.renderItem({ item, index })}
          </View>
        ))}
        {flatListProps.ListFooterComponent ?? null}
      </View>
    );
  },
}));

const chatThreadData: GetChatThreadResponse = {
  chat: {
    id: "chat-42",
    tab: TABS.AGENTS,
    topics: ["Agents", "Support"],
    shortSummary: "Quarterly strategy alignment",
    title: "Quarterly strategy alignment for platform migrations and escalations",
    preview: "Latest thread summary",
    updatedAtIso: "2026-03-11T12:00:00.000Z",
    messageCount: 7,
    unreadCount: 0,
    status: "active",
  },
  messages: [
    {
      id: "m1",
      chatId: "chat-42",
      role: "assistant",
      authorName: "Zencoder",
      content: "Let us align on current blockers first.",
      createdAtIso: "2026-03-11T11:58:00.000Z",
    },
  ],
};

describe("ChatThreadScreen", () => {
  beforeEach(() => {
    mockUseChatThread.mockReset();
    mockSendMessage.mockClear();

    mockUseChatThread.mockReturnValue({
      data: chatThreadData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it("uses a compact header title with no subtitle and renders short summary in body metadata", () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <ChatThreadScreen tab={TABS.AGENTS} chatId="chat-42" />,
    );

    expect(getByTestId("screen-header-title").props.children).toBe("Thread");
    expect(queryByTestId("screen-header-subtitle")).toBeNull();
    expect(getByText(chatThreadData.chat.shortSummary!)).toBeTruthy();
  });

  it("shows the attachment tooltip when the attachment button is pressed", () => {
    const { getByTestId, getByText } = render(
      <ChatThreadScreen tab={TABS.AGENTS} chatId="chat-42" />,
    );

    fireEvent.press(getByTestId("chat-thread-attach-button"));

    expect(getByTestId("chat-thread-attach-tooltip")).toBeTruthy();
    expect(getByText("Images and files are not available in this demo.")).toBeTruthy();
  });

  it("sends a message with the current org and tab when composer text is submitted", async () => {
    const { getByLabelText, getByText } = render(
      <ChatThreadScreen tab={TABS.AGENTS} chatId="chat-42" />,
    );

    fireEvent.changeText(getByLabelText("Chat message input"), "Need fresh guidance on priorities.");
    fireEvent.press(getByText("Send"));

    await waitFor(() => expect(mockSendMessage).toHaveBeenCalledTimes(1));
    expect(mockSendMessage).toHaveBeenCalledWith({
      orgId: "org-test-123",
      tab: TABS.AGENTS,
      chatId: "chat-42",
      content: "Need fresh guidance on priorities.",
    });
  });
});
