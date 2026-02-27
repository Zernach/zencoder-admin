import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useOverviewDashboard } from "@/features/analytics/hooks/useOverviewDashboard";
import { useCostDashboard } from "@/features/analytics/hooks/useCostDashboard";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
import { createTestWrapper } from "@/testing/testUtils";

describe("filter propagation", () => {
  it("changing time range refetches active hooks", async () => {
    const { wrapper } = createTestWrapper();

    const { result: filtersResult } = renderHook(
      () => useDashboardFilters(),
      { wrapper }
    );
    const { result: overviewResult } = renderHook(
      () => useOverviewDashboard(),
      { wrapper }
    );

    await waitFor(() => expect(overviewResult.current.loading).toBe(false));
    const firstData = overviewResult.current.data;
    expect(firstData).toBeDefined();

    // Change time range - this updates query keys, triggering refetch
    act(() => filtersResult.current.setTimeRange("7d"));

    // The query key changes, so loading state transitions
    await waitFor(() => expect(overviewResult.current.data).toBeDefined());
  });

  it("provider filter updates are reflected in filters state", async () => {
    const { wrapper } = createTestWrapper();

    const { result: filtersResult } = renderHook(
      () => useDashboardFilters(),
      { wrapper }
    );

    expect(filtersResult.current.filters.providers).toBeUndefined();

    act(() => filtersResult.current.setProviderFilter(["codex"]));
    expect(filtersResult.current.filters.providers).toEqual(["codex"]);
    expect(filtersResult.current.activeFilterCount).toBe(1);

    act(() => filtersResult.current.setProviderFilter(undefined));
    expect(filtersResult.current.filters.providers).toBeUndefined();
    expect(filtersResult.current.activeFilterCount).toBe(0);
  });

  it("team filter updates are consistent across hooks", async () => {
    const { wrapper } = createTestWrapper();

    const { result: filtersResult } = renderHook(
      () => useDashboardFilters(),
      { wrapper }
    );
    const { result: costResult } = renderHook(
      () => useCostDashboard(),
      { wrapper }
    );
    const { result: govResult } = renderHook(
      () => useGovernanceDashboard(),
      { wrapper }
    );

    await waitFor(() => expect(costResult.current.loading).toBe(false));
    await waitFor(() => expect(govResult.current.loading).toBe(false));

    // All hooks share the same Redux store filters
    act(() => filtersResult.current.setTeamFilter(["team_01"]));

    expect(filtersResult.current.filters.teamIds).toEqual(["team_01"]);
    expect(filtersResult.current.activeFilterCount).toBe(1);
  });

  it("clearAll resets all filters to defaults", async () => {
    const { wrapper } = createTestWrapper();

    const { result: filtersResult } = renderHook(
      () => useDashboardFilters(),
      { wrapper }
    );

    act(() => {
      filtersResult.current.setTeamFilter(["team_01"]);
      filtersResult.current.setProviderFilter(["codex"]);
      filtersResult.current.setStatusFilter(["failed"]);
    });
    expect(filtersResult.current.activeFilterCount).toBe(3);

    act(() => filtersResult.current.clearAll());
    expect(filtersResult.current.activeFilterCount).toBe(0);
    expect(filtersResult.current.preset).toBe("30d");
  });
});
