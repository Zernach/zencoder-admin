import { renderHook, act } from "@testing-library/react-native";
import { useCreateComplianceViolationRule } from "../useCreateComplianceViolationRule";
import { createTestWrapper } from "@/testing/testUtils";

describe("useCreateComplianceViolationRule", () => {
  it("starts with idle state", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCreateComplianceViolationRule(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.lastResult).toBeUndefined();
  });

  it("creates a rule successfully", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCreateComplianceViolationRule(), { wrapper });

    await act(async () => {
      await result.current.create({
        name: "Test Rule",
        description: "Test desc",
        severity: "HIGH",
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.lastResult).toBeDefined();
    expect(result.current.lastResult!.id).toMatch(/^rule_/);
    expect(result.current.lastResult!.name).toBe("Test Rule");
  });

  it("surfaces error on failure", async () => {
    const mockApi = {
      getOverview: jest.fn(),
      getUsage: jest.fn(),
      getOutcomes: jest.fn(),
      getCost: jest.fn(),
      getReliability: jest.fn(),
      getGovernance: jest.fn(),
      getAgentsHub: jest.fn(),
      getLiveAgentSessions: jest.fn(),
      getSearchSuggestions: jest.fn(),
      getAgentDetail: jest.fn(),
      getProjectDetail: jest.fn(),
      getTeamDetail: jest.fn(),
      getHumanDetail: jest.fn(),
      getRunDetail: jest.fn(),
      getRuleDetail: jest.fn(),
      updateRule: jest.fn(),
      createComplianceRule: jest.fn().mockRejectedValue(new Error("Server error")),
      createSeat: jest.fn(),
      createProject: jest.fn(),
      createTeam: jest.fn(),
      createAgent: jest.fn(),
      updateAgentDescription: jest.fn(),
    };

    const { wrapper } = createTestWrapper({ api: mockApi });
    const { result } = renderHook(() => useCreateComplianceViolationRule(), { wrapper });

    await act(async () => {
      try {
        await result.current.create({ name: "R", description: "D", severity: "LOW" });
      } catch {
        // expected
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Server error");
  });
});
