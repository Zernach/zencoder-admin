import { renderHook, act } from "@testing-library/react-native";
import { useCreateProject } from "../useCreateProject";
import { createTestWrapper, createTestSeedData } from "@/testing/testUtils";

describe("useCreateProject", () => {
  it("starts with idle state", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCreateProject(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.lastResult).toBeUndefined();
  });

  it("creates a project successfully", async () => {
    const seedData = createTestSeedData();
    const { wrapper } = createTestWrapper({ seedData });
    const { result } = renderHook(() => useCreateProject(), { wrapper });

    await act(async () => {
      await result.current.create({
        name: "Brand New Project",
        teamId: seedData.teams[0]!.id,
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.lastResult).toBeDefined();
    expect(result.current.lastResult!.project.name).toBe("Brand New Project");
  });

  it("surfaces duplicate name error", async () => {
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

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain("already exists");
  });
});
