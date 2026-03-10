import { renderHook, waitFor, act } from "@testing-library/react-native";
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
    expect(Array.isArray(data.seatUserUsage)).toBe(true);
    expect(Array.isArray(data.teamPerformanceComparison)).toBe(true);
  });

  it("returns { data, loading, error, refetch } shape", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
  });

  it("seatUserUsage is sorted by runsCount descending", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const rows = result.current.data!.seatUserUsage;
    expect(rows.length).toBeGreaterThan(0);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1]!.runsCount).toBeGreaterThanOrEqual(rows[i]!.runsCount);
    }
  });

  it("seatUserUsage rows have chart-ready fields (fullName, runsCount)", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const rows = result.current.data!.seatUserUsage;
    for (const row of rows) {
      expect(typeof row.fullName).toBe("string");
      expect(row.fullName.length).toBeGreaterThan(0);
      expect(typeof row.runsCount).toBe("number");
      expect(row.runsCount).toBeGreaterThan(0);
    }
  });

  it("recentViolations sorted by timestampIso descending", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const rows = result.current.data!.recentViolations;
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1]!.timestampIso >= rows[i]!.timestampIso).toBe(true);
    }
  });

  it("securityEvents sorted by timestampIso descending", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const rows = result.current.data!.securityEvents;
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1]!.timestampIso >= rows[i]!.timestampIso).toBe(true);
    }
  });

  it("policyChanges sorted by timestampIso descending", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const rows = result.current.data!.policyChanges;
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1]!.timestampIso >= rows[i]!.timestampIso).toBe(true);
    }
  });

  it("recentViolations remains newest-first after refetch", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Trigger refetch
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const rows = result.current.data!.recentViolations;
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1]!.timestampIso >= rows[i]!.timestampIso).toBe(true);
    }
  });

  it("recentViolations tie-breaking by id ascending is deterministic", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const rows = result.current.data!.recentViolations;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i - 1]!.timestampIso === rows[i]!.timestampIso) {
        expect(rows[i - 1]!.id.localeCompare(rows[i]!.id)).toBeLessThanOrEqual(0);
      }
    }
  });
});
