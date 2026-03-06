import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useCreateComplianceViolationRule } from "@/features/analytics/hooks/useCreateComplianceViolationRule";
import { useGovernanceDashboard } from "@/features/analytics/hooks/useGovernanceDashboard";
import { createTestWrapper } from "@/testing/testUtils";

describe("Create Compliance Rule — integration", () => {
  it("created rule generates violations visible in governance data", async () => {
    const { wrapper } = createTestWrapper();

    const { result: govResult } = renderHook(() => useGovernanceDashboard(), { wrapper });
    await waitFor(() => expect(govResult.current.loading).toBe(false));
    const beforeViolationCount = govResult.current.data!.policyViolationCount;

    const { result: createResult } = renderHook(() => useCreateComplianceViolationRule(), { wrapper });
    await act(async () => {
      await createResult.current.create({
        name: "Integration Rule",
        description: "Test integration",
        severity: "HIGH",
      });
    });

    expect(createResult.current.lastResult!.name).toBe("Integration Rule");

    // Refetch governance data to see the new violation count
    act(() => {
      govResult.current.refetch();
    });
    await waitFor(() =>
      expect(govResult.current.data!.policyViolationCount).toBeGreaterThan(beforeViolationCount),
    );
  });
});
