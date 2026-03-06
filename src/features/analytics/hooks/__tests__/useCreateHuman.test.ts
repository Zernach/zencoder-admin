import { renderHook, act } from "@testing-library/react-native";
import { useCreateHuman } from "../useCreateHuman";
import { createTestWrapper, createTestSeedData } from "@/testing/testUtils";

describe("useCreateHuman", () => {
  it("starts with idle state", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCreateHuman(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.lastResult).toBeUndefined();
  });

  it("creates a seat successfully", async () => {
    const seedData = createTestSeedData();
    const { wrapper } = createTestWrapper({ seedData });
    const { result } = renderHook(() => useCreateHuman(), { wrapper });

    await act(async () => {
      await result.current.create({
        name: "New User",
        email: "newuser@test.com",
        teamId: seedData.teams[0]!.id,
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.lastResult).toBeDefined();
    expect(result.current.lastResult!.user.name).toBe("New User");
  });

  it("surfaces duplicate email error", async () => {
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

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain("already exists");
  });
});
