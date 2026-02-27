import { renderHook, waitFor } from "@testing-library/react-native";
import { useAgentsDashboard } from "../useAgentsDashboard";
import { createTestWrapper } from "@/testing/testUtils";

describe("useAgentsDashboard", () => {
  it("returns loading: true initially", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useAgentsDashboard(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("returns data after resolution", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useAgentsDashboard(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeDefined();
  });

  it("returns { data, loading, error, refetch } shape", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useAgentsDashboard(), { wrapper });
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
  });
});
