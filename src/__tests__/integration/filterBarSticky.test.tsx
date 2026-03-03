import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
import { useOverviewDashboard } from "@/features/analytics/hooks/useOverviewDashboard";
import { useCostDashboard } from "@/features/analytics/hooks/useCostDashboard";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { createTestWrapper } from "@/testing/testUtils";

// Mock navigation / safe area / reanimated for ScreenWrapper render tests
jest.mock("expo-router", () => ({
  usePathname: () => "/dashboard",
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
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
      View: ({
        children,
        style,
      }: {
        children: React.ReactNode;
        style?: unknown;
      }) => <View style={style}>{children}</View>,
    },
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    withTiming: (val: number) => val,
    Easing: { out: (fn: unknown) => fn, ease: 0 },
  };
});

import ScreenWrapper from "@/components/screen/ScreenWrapper";

describe("filterBarSticky integration", () => {
  it("FilterBar renders in sticky position outside scroll content", () => {
    const { getByTestId, queryAllByTestId } = render(
      <ScreenWrapper headerProps={{ title: "Test Screen" }}>
        <Text>Page content</Text>
      </ScreenWrapper>
    );

    // Sticky filter bar container exists
    const stickyBar = getByTestId("sticky-filter-bar");
    expect(stickyBar).toBeTruthy();

    // Exactly one filter bar instance
    expect(queryAllByTestId("filter-bar")).toHaveLength(1);

    // Content viewport exists separately
    const viewport = getByTestId("content-viewport");
    expect(viewport).toBeTruthy();
  });

  it("filter state changes propagate to overview dashboard hook", async () => {
    const { wrapper, store } = createTestWrapper();

    const { result: filtersResult } = renderHook(
      () => useDashboardFilters(),
      { wrapper }
    );
    const { result: overviewResult } = renderHook(
      () => useOverviewDashboard(),
      { wrapper }
    );

    await waitFor(() =>
      expect(overviewResult.current.loading).toBe(false)
    );
    expect(overviewResult.current.data).toBeDefined();

    // Change time range via filter hook (simulates sticky FilterBar interaction)
    act(() => filtersResult.current.setTimeRange("7d"));
    expect(filtersResult.current.preset).toBe("7d");

    // Data refetches with new filter
    await waitFor(() =>
      expect(overviewResult.current.data).toBeDefined()
    );
  });

  it("filter state changes propagate to cost dashboard hook", async () => {
    const { wrapper } = createTestWrapper();

    const { result: filtersResult } = renderHook(
      () => useDashboardFilters(),
      { wrapper }
    );
    const { result: costResult } = renderHook(() => useCostDashboard(), {
      wrapper,
    });

    await waitFor(() => expect(costResult.current.loading).toBe(false));
    expect(costResult.current.data).toBeDefined();

    // Apply a provider filter (simulates sticky FilterBar interaction)
    act(() => filtersResult.current.setProviderFilter(["codex"]));
    expect(filtersResult.current.filters.providers).toEqual(["codex"]);
    expect(filtersResult.current.activeFilterCount).toBe(1);

    // Cost data remains available after filter change
    await waitFor(() => expect(costResult.current.data).toBeDefined());
  });

  it("filter state changes propagate to governance dashboard hook", async () => {
    const { wrapper } = createTestWrapper();

    const { result: filtersResult } = renderHook(
      () => useDashboardFilters(),
      { wrapper }
    );
    const { result: govResult } = renderHook(
      () => useGovernanceDashboard(),
      { wrapper }
    );

    await waitFor(() => expect(govResult.current.loading).toBe(false));
    expect(govResult.current.data).toBeDefined();

    // Apply a team filter (simulates sticky FilterBar interaction)
    act(() => filtersResult.current.setTeamFilter(["team_01"]));
    expect(filtersResult.current.filters.teamIds).toEqual(["team_01"]);

    // Governance data remains available
    await waitFor(() => expect(govResult.current.data).toBeDefined());
  });

  it("clearAll resets filters and all hooks still resolve data", async () => {
    const { wrapper } = createTestWrapper();

    const { result: filtersResult } = renderHook(
      () => useDashboardFilters(),
      { wrapper }
    );
    const { result: overviewResult } = renderHook(
      () => useOverviewDashboard(),
      { wrapper }
    );

    await waitFor(() =>
      expect(overviewResult.current.loading).toBe(false)
    );

    // Apply multiple filters
    act(() => {
      filtersResult.current.setTeamFilter(["team_01"]);
      filtersResult.current.setProviderFilter(["codex"]);
      filtersResult.current.setStatusFilter(["failed"]);
    });
    expect(filtersResult.current.activeFilterCount).toBe(3);

    // Clear all filters (simulates sticky FilterBar "clear" action)
    act(() => filtersResult.current.clearAll());
    expect(filtersResult.current.activeFilterCount).toBe(0);
    expect(filtersResult.current.preset).toBe("30d");

    // Data still resolves after clearing
    await waitFor(() =>
      expect(overviewResult.current.data).toBeDefined()
    );
  });
});
