import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useCreateHuman } from "@/features/analytics/hooks/useCreateHuman";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { createTestWrapper, createTestSeedData } from "@/testing/testUtils";

describe("Create Human — integration", () => {
  it("created user appears in governance seat usage after refetch", async () => {
    const seedData = createTestSeedData();
    const { wrapper } = createTestWrapper({ seedData });

    const { result: govResult } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(govResult.current.loading).toBe(false));
    const beforeNames = govResult.current.data!.seatUserUsage.map((u) => u.fullName);

    const { result: createResult } = renderHook(() => useCreateHuman(), { wrapper });
    await act(async () => {
      await createResult.current.create({
        name: "Integration User",
        email: "integration@test.com",
        teamId: seedData.teams[0]!.id,
      });
    });

    expect(createResult.current.lastResult!.user.name).toBe("Integration User");

    act(() => {
      govResult.current.refetch();
    });
    await waitFor(() => {
      const names = govResult.current.data!.seatUserUsage.map((u) => u.fullName);
      expect(names).toContain("Integration User");
    });
    expect(beforeNames).not.toContain("Integration User");
  });

  it("duplicate email shows error without crashing", async () => {
    const seedData = createTestSeedData();
    const { wrapper } = createTestWrapper({ seedData });

    const { result } = renderHook(() => useCreateHuman(), { wrapper });
    await act(async () => {
      try {
        await result.current.create({
          name: "Dup",
          email: seedData.users[0]!.email,
          teamId: seedData.teams[0]!.id,
        });
      } catch {
        // expected
      }
    });

    expect(result.current.error).toContain("already exists");
    expect(result.current.loading).toBe(false);
  });
});
