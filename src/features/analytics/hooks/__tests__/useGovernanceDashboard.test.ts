import { renderHook, waitFor } from "@testing-library/react-native";
import { useGovernanceDashboard } from "../useGovernanceDashboard";
import { createTestWrapper } from "@/testing/testUtils";

describe("useGovernanceDashboard", () => {
  it("returns loading: true initially", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("returns data after resolution", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeDefined();
  });

  it("governance data has expected fields", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const data = result.current.data!;
    expect(typeof data.policyViolationCount).toBe("number");
    expect(typeof data.policyViolationRate).toBe("number");
    expect(typeof data.blockedNetworkAttempts).toBe("number");
    expect(Array.isArray(data.recentViolations)).toBe(true);
    expect(Array.isArray(data.complianceItems)).toBe(true);
  });

  it("returns { data, loading, error, refetch } shape", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
  });
});
