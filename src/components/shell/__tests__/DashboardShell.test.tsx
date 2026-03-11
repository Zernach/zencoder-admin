import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { DashboardShell } from "../DashboardShell";

const mockDispatch = jest.fn();
let mockBreakpoint: "mobile" | "tablet" | "desktop" = "mobile";
let mockPathname = "/dashboard";

jest.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => mockBreakpoint,
}));

jest.mock("expo-router", () => ({
  usePathname: () => mockPathname,
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

describe("DashboardShell chrome", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockBreakpoint = "mobile";
    mockPathname = "/dashboard";
  });

  it("shows bottom tabs on mobile", () => {
    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("bottom-tabs")).toBeTruthy();
  });

  it("hides bottom tabs on desktop", () => {
    mockBreakpoint = "desktop";
    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("bottom-tabs")).toBeNull();
  });

  it("hides sidebar on mobile", () => {
    mockBreakpoint = "mobile";

    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("bottom-tabs")).toBeTruthy();
    expect(queryByTestId("sidebar")).toBeNull();
  });

  it("shows sidebar on desktop", () => {
    mockBreakpoint = "desktop";

    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("sidebar")).toBeTruthy();
    expect(queryByTestId("bottom-tabs")).toBeNull();
  });

  it("shows bottom tabs on mobile chat history route", () => {
    mockPathname = "/chat";

    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("bottom-tabs")).toBeTruthy();
  });

  it("hides bottom tabs on mobile create chat route", () => {
    mockPathname = "/chat/create";

    const { queryByTestId } = render(
      <DashboardShell>
        <Text>content</Text>
      </DashboardShell>,
    );

    expect(queryByTestId("bottom-tabs")).toBeNull();
  });
});
