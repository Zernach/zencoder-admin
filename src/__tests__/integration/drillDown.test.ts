import { renderHook, waitFor } from "@testing-library/react-native";
import { useOverviewDashboard } from "@/features/analytics/hooks/useOverviewDashboard";
import { useAgentsHub } from "@/features/analytics/hooks/useAgentsHub";
import { createTestWrapper } from "@/testing/testUtils";

describe("drill-down integration", () => {
  it("overview anomaly runIds are present and valid", async () => {
    const { wrapper } = createTestWrapper();

    const { result: overviewResult } = renderHook(
      () => useOverviewDashboard(),
      { wrapper }
    );
    await waitFor(() => expect(overviewResult.current.data).toBeDefined());

    const anomalyRunId = overviewResult.current.data!.anomalies[0]!.runId;
    expect(anomalyRunId).toBeDefined();
    expect(typeof anomalyRunId).toBe("string");
  });

  it("agents hub includes project breakdown data", async () => {
    const { wrapper } = createTestWrapper();

    const { result: hubResult } = renderHook(
      () => useAgentsHub(),
      { wrapper }
    );
    await waitFor(() => expect(hubResult.current.data).toBeDefined());

    const data = hubResult.current.data!;
    expect(data.projectBreakdown.length).toBeGreaterThan(0);
    expect(data.agentBreakdown.length).toBeGreaterThan(0);
    expect(data.recentRuns.length).toBeGreaterThan(0);
  });

  it("agents hub recent runs have valid fields", async () => {
    const { wrapper } = createTestWrapper();

    const { result: hubResult } = renderHook(
      () => useAgentsHub(),
      { wrapper }
    );
    await waitFor(() => expect(hubResult.current.data).toBeDefined());

    const firstRun = hubResult.current.data!.recentRuns[0]!;
    expect(firstRun.id).toBeDefined();
    expect(firstRun.status).toBeDefined();
    expect(typeof firstRun.costUsd).toBe("number");
    expect(typeof firstRun.durationMs).toBe("number");
  });

  it("agents hub project breakdown includes agent counts", async () => {
    const { wrapper } = createTestWrapper();

    const { result: hubResult } = renderHook(
      () => useAgentsHub(),
      { wrapper }
    );
    await waitFor(() => expect(hubResult.current.data).toBeDefined());

    const firstProject = hubResult.current.data!.projectBreakdown[0]!;
    expect(firstProject.projectId).toBeDefined();
    expect(firstProject.projectName).toBeDefined();
    expect(typeof firstProject.agentCount).toBe("number");
    expect(firstProject.agentCount).toBeGreaterThan(0);
  });
});
