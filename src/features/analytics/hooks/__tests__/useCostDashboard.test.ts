import { renderHook, waitFor } from "@testing-library/react-native";
import { useCostDashboard } from "../useCostDashboard";
import { createTestWrapper } from "@/testing/testUtils";

describe("useCostDashboard", () => {
  it("returns loading: true initially", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCostDashboard(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("returns data after resolution", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCostDashboard(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeDefined();
  });

  it("cost data has expected fields", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCostDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const data = result.current.data!;
    expect(typeof data.totalCostUsd).toBe("number");
    expect(typeof data.averageCostPerRunUsd).toBe("number");
    expect(Array.isArray(data.costTrend)).toBe(true);
    expect(Array.isArray(data.costBreakdown)).toBe(true);
    expect(data.budget).toBeDefined();
    expect(typeof data.budget.budgetUsd).toBe("number");
  });

  it("returns { data, loading, error, refetch } shape", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCostDashboard(), { wrapper });
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
  });
});
