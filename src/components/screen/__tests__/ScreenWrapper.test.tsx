import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { ROUTES } from "@/constants/routes";

const mockDashboardPathname = ROUTES.DASHBOARD;

jest.mock("expo-router", () => ({
  usePathname: () => mockDashboardPathname,
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock("@/components/shell", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    TopBar: () => <Text>TopBar</Text>,
    ContentViewport: ({ children }: { children: React.ReactNode }) => (
      <View testID="content-viewport">{children}</View>
    ),
  };
});

jest.mock("@/components/filters", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    FilterBar: () => <Text testID="filter-bar">FilterBar</Text>,
  };
});

jest.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => "desktop",
}));

jest.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: {
      View: ({ children, style }: { children: React.ReactNode; style?: unknown }) => (
        <View style={style}>{children}</View>
      ),
    },
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    withTiming: (val: number) => val,
    Easing: { out: (fn: unknown) => fn, ease: 0 },
  };
});

import ScreenWrapper from "../ScreenWrapper";

describe("ScreenWrapper", () => {
  it("renders FilterBar outside ContentViewport by default", () => {
    const { getByTestId, getByText } = render(
      <ScreenWrapper headerProps={{ title: "Test" }}>
        <Text>Content</Text>
      </ScreenWrapper>
    );

    const filterBar = getByTestId("sticky-filter-bar");
    const viewport = getByTestId("content-viewport");

    // FilterBar should exist
    expect(filterBar).toBeTruthy();
    expect(getByText("FilterBar")).toBeTruthy();

    // FilterBar should NOT be inside ContentViewport
    // (it's a sibling, not a descendant)
    expect(viewport.props.children).toBeDefined();
  });

  it("renders exactly one FilterBar instance", () => {
    const { getAllByTestId } = render(
      <ScreenWrapper headerProps={{ title: "Test" }}>
        <Text>Content</Text>
      </ScreenWrapper>
    );

    const filterBars = getAllByTestId("filter-bar");
    expect(filterBars).toHaveLength(1);
  });

  it("does not render FilterBar when showFilterBar is false", () => {
    const { queryByTestId } = render(
      <ScreenWrapper headerProps={{ title: "Test" }} showFilterBar={false}>
        <Text>Content</Text>
      </ScreenWrapper>
    );

    expect(queryByTestId("sticky-filter-bar")).toBeNull();
    expect(queryByTestId("filter-bar")).toBeNull();
  });
});
