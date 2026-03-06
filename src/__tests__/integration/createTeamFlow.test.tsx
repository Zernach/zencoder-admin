import { renderHook, act } from "@testing-library/react-native";
import { useCreateTeam } from "@/features/analytics/hooks/useCreateTeam";
import { createTestWrapper, createTestSeedData } from "@/testing/testUtils";

describe("Create Team — integration", () => {
  it("creates a team and returns typed response", async () => {
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => useCreateTeam(), { wrapper });
    await act(async () => {
      await result.current.create({ name: "Integration Team" });
    });

    expect(result.current.lastResult).toBeDefined();
    expect(result.current.lastResult!.team.name).toBe("Integration Team");
    expect(result.current.error).toBeUndefined();
  });

  it("duplicate team name shows error", async () => {
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

    expect(result.current.error).toContain("already exists");
    expect(result.current.loading).toBe(false);
  });
});
