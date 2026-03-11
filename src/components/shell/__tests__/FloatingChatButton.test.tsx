import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FloatingChatButton } from "../FloatingChatButton";

const mockPush = jest.fn();
let mockPathname = "/";
let mockBreakpoint: "mobile" | "tablet" | "desktop" = "mobile";
let capturedOnClose: (() => void) | undefined;

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

jest.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => mockBreakpoint,
}));

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native");
  const Icon = () => <View />;

  return {
    MessageCircle: Icon,
  };
});

jest.mock("../MiniChatModal", () => ({
  MiniChatModal: ({ onClose }: { onClose: () => void }) => {
    const { View, Text } = require("react-native");
    const { CustomButton } = require("@/components/buttons");
    capturedOnClose = onClose;

    return (
      <View testID="mini-chat-modal">
        <Text>Mini Chat</Text>
        <CustomButton onPress={onClose} testID="mini-chat-close">
          <Text>Close</Text>
        </CustomButton>
      </View>
    );
  },
}));

describe("FloatingChatButton", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockBreakpoint = "mobile";
    mockPathname = "/";
    capturedOnClose = undefined;
  });

  it("routes root path to /dashboard/chat/history on mobile", () => {
    mockPathname = "/";
    const { getByTestId } = render(<FloatingChatButton />);

    fireEvent.press(getByTestId("floating-chat-button"));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/dashboard/chat/history");
  });

  it("routes agent tab path to /agents/chat/history on mobile", () => {
    mockPathname = "/agents";
    const { getByTestId } = render(<FloatingChatButton />);

    fireEvent.press(getByTestId("floating-chat-button"));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/agents/chat/history");
  });

  it("routes settings nested chat path back to /settings/chat/history", () => {
    mockPathname = "/settings/chat/history/settings-chat-2";
    const { getByTestId } = render(<FloatingChatButton />);

    fireEvent.press(getByTestId("floating-chat-button"));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/settings/chat/history");
  });

  it("does not navigate when already on chat history route", () => {
    mockPathname = "/governance/chat/history";
    const { getByTestId } = render(<FloatingChatButton />);

    fireEvent.press(getByTestId("floating-chat-button"));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates normally on tablet", () => {
    mockBreakpoint = "tablet";
    mockPathname = "/costs";
    const { getByTestId } = render(<FloatingChatButton />);

    fireEvent.press(getByTestId("floating-chat-button"));

    expect(mockPush).toHaveBeenCalledWith("/costs/chat/history");
  });

  describe("desktop mini modal", () => {
    beforeEach(() => {
      mockBreakpoint = "desktop";
      mockPathname = "/dashboard";
    });

    it("opens mini modal instead of navigating on desktop", () => {
      const { getByTestId } = render(<FloatingChatButton />);

      fireEvent.press(getByTestId("floating-chat-button"));

      expect(mockPush).not.toHaveBeenCalled();
      expect(getByTestId("mini-chat-modal")).toBeTruthy();
    });

    it("closes mini modal with close button and shows FAB again", () => {
      const { getByTestId, queryByTestId } = render(<FloatingChatButton />);

      fireEvent.press(getByTestId("floating-chat-button"));
      expect(getByTestId("mini-chat-modal")).toBeTruthy();

      fireEvent.press(getByTestId("mini-chat-close"));
      expect(queryByTestId("mini-chat-modal")).toBeNull();
      expect(getByTestId("floating-chat-button")).toBeTruthy();
    });
  });
});
