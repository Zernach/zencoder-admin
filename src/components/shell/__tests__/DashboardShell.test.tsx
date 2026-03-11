import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { DashboardShell } from "../DashboardShell";

const mockDispatch = jest.fn();
let mockPathname = "/agents";
let mockBreakpoint: "mobile" | "tablet" | "desktop" = "mobile";

jest.mock("expo-router", () => ({
  usePathname: () => mockPathname,
}));

jest.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => mockBreakpoint,
}));

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/hooks/useSectionScroll", () => ({
  SectionScrollProvider: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

jest.mock("../Sidebar", () => ({
  Sidebar: () => {
    const { Text: MockText } = require("react-native");
    return <MockText testID="sidebar" />;
  },
}));

jest.mock("../BottomTabs", () => ({
  BottomTabs: () => {
    const { Text: MockText } = require("react-native");
    return <MockText testID="bottom-tabs" />;
  },
}));

jest.mock("../FloatingChatButton", () => ({
  FloatingChatButton: () => {
    const { Text: MockText } = require("react-native");
    return <MockText testID="floating-chat-fab" />;
  },
}));

describe("DashboardShell route-aware chrome", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockBreakpoint = "mobile";
    mockPathname = "/agents";
  });

  it("shows bottom tabs and FAB on non-chat routes", () => {
    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("bottom-tabs")).toBeTruthy();
    expect(queryByTestId("floating-chat-fab")).toBeTruthy();
  });

  it("hides both tabs and FAB on chat history routes", () => {
    mockPathname = "/agents/chat/history";

    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("bottom-tabs")).toBeNull();
    expect(queryByTestId("floating-chat-fab")).toBeNull();
  });

  it("hides both tabs and FAB on chat thread routes", () => {
    mockPathname = "/agents/chat/history/thread-1";

    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("bottom-tabs")).toBeNull();
    expect(queryByTestId("floating-chat-fab")).toBeNull();
  });

  it("hides both tabs and FAB on chat create routes", () => {
    mockPathname = "/agents/chat/create";

    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("bottom-tabs")).toBeNull();
    expect(queryByTestId("floating-chat-fab")).toBeNull();
  });
});
