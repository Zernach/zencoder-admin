import { renderHook, waitFor } from "@testing-library/react-native";
import { useProjectsDashboard } from "../useProjectsDashboard";
import { createTestWrapper } from "@/testing/testUtils";

describe("useProjectsDashboard", () => {
  it("returns loading: true initially", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useProjectsDashboard(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("returns data after resolution", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useProjectsDashboard(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeDefined();
  });

  it("returns { data, loading, error, refetch } shape", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useProjectsDashboard(), { wrapper });
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
  });
});
