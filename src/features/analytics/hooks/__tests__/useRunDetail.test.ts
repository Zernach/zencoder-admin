import { renderHook, waitFor } from "@testing-library/react-native";
import { useRunDetail } from "../useRunDetail";
import { createTestWrapper, createTestSeedData } from "@/testing/testUtils";

const seedData = createTestSeedData();

describe("useRunDetail", () => {
  it("returns loading: true initially for valid runId", () => {
    const { wrapper } = createTestWrapper();
    const runId = seedData.runs[0]!.id;
    const { result } = renderHook(() => useRunDetail(runId), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("returns data after resolution", async () => {
    const { wrapper } = createTestWrapper();
    const runId = seedData.runs[0]!.id;
    const { result } = renderHook(() => useRunDetail(runId), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeDefined();
    expect(result.current.data!.run.id).toBe(runId);
  });

  it("data includes timeline and artifacts", async () => {
    const { wrapper } = createTestWrapper();
    const runId = seedData.runs[0]!.id;
    const { result } = renderHook(() => useRunDetail(runId), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data!.timeline.length).toBe(6);
    expect(result.current.data!.artifacts).toBeDefined();
    expect(result.current.data!.policyContext).toBeDefined();
  });

  it("returns { data, loading, error, refetch } shape", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useRunDetail("run_1"), { wrapper });
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
  });
});
