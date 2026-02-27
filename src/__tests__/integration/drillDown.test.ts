import { renderHook, waitFor } from "@testing-library/react-native";
import { useOverviewDashboard } from "@/features/analytics/hooks/useOverviewDashboard";
import { useRunsExplorer } from "@/features/analytics/hooks/useRunsExplorer";
import { useRunDetail } from "@/features/analytics/hooks/useRunDetail";
import { createTestWrapper } from "@/testing/testUtils";

describe("drill-down integration", () => {
  it("overview anomaly runId is resolvable by useRunDetail", async () => {
    const { wrapper } = createTestWrapper();

    const { result: overviewResult } = renderHook(
      () => useOverviewDashboard(),
      { wrapper }
    );
    await waitFor(() => expect(overviewResult.current.data).toBeDefined());

    const anomalyRunId = overviewResult.current.data!.anomalies[0]!.runId;
    expect(anomalyRunId).toBeDefined();

    const { result: detailResult } = renderHook(
      () => useRunDetail(anomalyRunId),
      { wrapper }
    );
    await waitFor(() => expect(detailResult.current.data).toBeDefined());
    expect(detailResult.current.data!.run.id).toBe(anomalyRunId);
  });

  it("runs explorer row is resolvable by useRunDetail", async () => {
    const { wrapper } = createTestWrapper();

    const { result: runsResult } = renderHook(
      () => useRunsExplorer(),
      { wrapper }
    );
    await waitFor(() => expect(runsResult.current.data).toBeDefined());

    const firstRunId = runsResult.current.data!.rows[0]!.id;

    const { result: detailResult } = renderHook(
      () => useRunDetail(firstRunId),
      { wrapper }
    );
    await waitFor(() => expect(detailResult.current.data).toBeDefined());
    expect(detailResult.current.data!.run.id).toBe(firstRunId);
  });

  it("run detail includes timeline with 6 steps", async () => {
    const { wrapper } = createTestWrapper();

    const { result: runsResult } = renderHook(
      () => useRunsExplorer(),
      { wrapper }
    );
    await waitFor(() => expect(runsResult.current.data).toBeDefined());

    const runId = runsResult.current.data!.rows[0]!.id;
    const { result: detailResult } = renderHook(
      () => useRunDetail(runId),
      { wrapper }
    );
    await waitFor(() => expect(detailResult.current.data).toBeDefined());

    const timeline = detailResult.current.data!.timeline;
    expect(timeline.length).toBe(6);
    expect(timeline[0]!.step).toBe("queued");
    expect(timeline[5]!.step).toBe("completed");
  });

  it("run detail artifacts are accessible", async () => {
    const { wrapper } = createTestWrapper();

    const { result: runsResult } = renderHook(
      () => useRunsExplorer(),
      { wrapper }
    );
    await waitFor(() => expect(runsResult.current.data).toBeDefined());

    const runId = runsResult.current.data!.rows[0]!.id;
    const { result: detailResult } = renderHook(
      () => useRunDetail(runId),
      { wrapper }
    );
    await waitFor(() => expect(detailResult.current.data).toBeDefined());

    const artifacts = detailResult.current.data!.artifacts;
    expect(typeof artifacts.linesAdded).toBe("number");
    expect(typeof artifacts.prCreated).toBe("boolean");
    expect(typeof artifacts.testsExecuted).toBe("number");
  });
});
