import { renderHook, waitFor } from "@testing-library/react-native";
import { useLiveAgentSessions } from "../useLiveAgentSessions";
import { createTestWrapper } from "@/testing/testUtils";

describe("useLiveAgentSessions", () => {
  it("returns loading: true initially", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useLiveAgentSessions(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("returns active sessions after resolution", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useLiveAgentSessions(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("returns { data, lastUpdatedIso, loading, error, refetch } shape", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useLiveAgentSessions(), { wrapper });
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("lastUpdatedIso");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
  });
});
