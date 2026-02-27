import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useRunsExplorer } from "../useRunsExplorer";
import { createTestWrapper } from "@/testing/testUtils";

describe("useRunsExplorer", () => {
  it("returns loading: true initially", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useRunsExplorer(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("returns data after resolution", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useRunsExplorer(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeDefined();
    expect(result.current.data!.rows).toBeDefined();
  });

  it("has default pagination state", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useRunsExplorer(), { wrapper });
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(25);
    expect(result.current.sortBy).toBe("startedAtIso");
    expect(result.current.sortDirection).toBe("desc");
  });

  it("handleSort toggles direction for same column", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useRunsExplorer(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.handleSort("startedAtIso"));
    expect(result.current.sortDirection).toBe("asc");

    act(() => result.current.handleSort("startedAtIso"));
    expect(result.current.sortDirection).toBe("desc");
  });

  it("handleSort changes column and resets to desc", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useRunsExplorer(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.handleSort("costUsd"));
    expect(result.current.sortBy).toBe("costUsd");
    expect(result.current.sortDirection).toBe("desc");
    expect(result.current.page).toBe(1);
  });

  it("setPage changes current page", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useRunsExplorer(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
  });

  it("returns { data, loading, error, refetch } shape", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useRunsExplorer(), { wrapper });
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
  });
});
