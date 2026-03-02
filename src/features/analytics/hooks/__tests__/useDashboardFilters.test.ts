import { renderHook, act } from "@testing-library/react-native";
import { useDashboardFilters } from "../useDashboardFilters";
import { createTestWrapper } from "@/testing/testUtils";

describe("useDashboardFilters", () => {
  it("returns filters with time range covering seed data", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    // Test wrapper sets custom time range to match seed data
    expect(result.current.preset).toBe("custom");
    expect(result.current.filters.orgId).toBe("org_zencoder_001");
    expect(result.current.filters.timeRange).toBeDefined();
  });

  it("setTimeRange updates preset", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => result.current.setTimeRange("7d"));
    expect(result.current.preset).toBe("7d");
  });

  it("setTeamFilter updates teamIds", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => result.current.setTeamFilter(["team_01"]));
    expect(result.current.filters.teamIds).toEqual(["team_01"]);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("setProviderFilter updates providers", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => result.current.setProviderFilter(["codex"]));
    expect(result.current.filters.providers).toEqual(["codex"]);
  });

  it("setStatusFilter updates statuses", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => result.current.setStatusFilter(["failed"]));
    expect(result.current.filters.statuses).toEqual(["failed"]);
  });

  it("clearAll resets all filters", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => {
      result.current.setTeamFilter(["team_01"]);
      result.current.setProviderFilter(["codex"]);
    });
    expect(result.current.activeFilterCount).toBe(2);
    act(() => result.current.clearAll());
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.preset).toBe("30d");
  });

  it("activeFilterCount counts active dimension filters", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    expect(result.current.activeFilterCount).toBe(0);
    act(() => {
      result.current.setTeamFilter(["team_01"]);
      result.current.setUserFilter(["user_01"]);
      result.current.setProjectFilter(["proj_01"]);
    });
    expect(result.current.activeFilterCount).toBe(3);
  });

  it("setCustomTimeRange sets preset to custom", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() =>
      result.current.setCustomTimeRange({
        fromIso: "2025-01-01T00:00:00Z",
        toIso: "2025-01-31T23:59:59Z",
      })
    );
    expect(result.current.preset).toBe("custom");
  });

  it("keeps filters reference stable across rerenders when state is unchanged", () => {
    const { wrapper } = createTestWrapper();
    const { result, rerender } = renderHook(() => useDashboardFilters(), {
      wrapper,
    });

    const firstFiltersRef = result.current.filters;
    rerender({});

    expect(result.current.filters).toBe(firstFiltersRef);
  });
});
