import { renderHook, waitFor } from "@testing-library/react-native";
import { useOverviewDashboard } from "../useOverviewDashboard";
import { createTestWrapper } from "@/testing/testUtils";

describe("useOverviewDashboard", () => {
  it("returns loading: true initially", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useOverviewDashboard(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("returns data after resolution", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useOverviewDashboard(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeDefined();
  });

  it("data matches OverviewViewModel shape", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useOverviewDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const data = result.current.data!;
    expect(data.adoptionKpis).toBeDefined();
    expect(data.reliabilityKpis).toBeDefined();
    expect(data.costKpis).toBeDefined();
    expect(data.governanceKpis).toBeDefined();
    expect(data.runsTrend).toBeDefined();
    expect(data.costTrend).toBeDefined();
    expect(data.anomalies).toBeDefined();
  });

  it("returns { data, loading, error, refetch } shape", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useOverviewDashboard(), { wrapper });
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
  });
});
