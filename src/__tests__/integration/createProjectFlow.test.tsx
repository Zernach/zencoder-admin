import { renderHook, act } from "@testing-library/react-native";
import { useCreateProject } from "@/features/analytics/hooks/useCreateProject";
import { createTestWrapper, createTestSeedData } from "@/testing/testUtils";

describe("Create Project — integration", () => {
  it("creates a project and returns typed response", async () => {
    const seedData = createTestSeedData();
    const { wrapper } = createTestWrapper({ seedData });

    const { result } = renderHook(() => useCreateProject(), { wrapper });
    await act(async () => {
      await result.current.create({
        name: "Integration Project",
        teamId: seedData.teams[0]!.id,
      });
    });

    expect(result.current.lastResult).toBeDefined();
    expect(result.current.lastResult!.project.name).toBe("Integration Project");
    expect(result.current.error).toBeUndefined();
  });

  it("duplicate project name in same team shows error", async () => {
    const seedData = createTestSeedData();
    const { wrapper } = createTestWrapper({ seedData });

    const { result } = renderHook(() => useCreateProject(), { wrapper });
    await act(async () => {
      try {
        await result.current.create({
          name: seedData.projects[0]!.name,
          teamId: seedData.projects[0]!.teamId,
        });
      } catch {
        // expected
      }
    });

    expect(result.current.error).toContain("already exists");
    expect(result.current.loading).toBe(false);
  });
});
