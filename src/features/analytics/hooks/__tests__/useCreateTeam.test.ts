import { renderHook, act } from "@testing-library/react-native";
import { useCreateTeam } from "../useCreateTeam";
import { createTestWrapper, createTestSeedData } from "@/testing/testUtils";

describe("useCreateTeam", () => {
  it("starts with idle state", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCreateTeam(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.lastResult).toBeUndefined();
  });

  it("creates a team successfully", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCreateTeam(), { wrapper });

    await act(async () => {
      await result.current.create({ name: "Brand New Team" });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.lastResult).toBeDefined();
    expect(result.current.lastResult!.team.name).toBe("Brand New Team");
  });

  it("surfaces duplicate name error", async () => {
    const seedData = createTestSeedData();
    const { wrapper } = createTestWrapper({ seedData });
    const { result } = renderHook(() => useCreateTeam(), { wrapper });

    await act(async () => {
      try {
        await result.current.create({ name: seedData.teams[0]!.name });
      } catch {
        // expected
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain("already exists");
  });
});
