# 0021 — Contract & Service Layer Tests

> Test `StubAnalyticsApi` (response type conformance, filtering, time-range boundaries, pagination stability, sorting, failure injection) and `AnalyticsService` (pass-through correctness, derived metrics, drill-down linkage). Target: >=90% line coverage on both.

---

## Prior State

`StubAnalyticsApi` (PR 0005) and `AnalyticsService` (PR 0006) are implemented. Unit tests for metric formulas exist (PR 0020). No tests exist for the API or service layers.

## Target State

`npm test -- StubAnalyticsApi AnalyticsService` passes with >=90% line coverage. Every API method's contract is verified. Filter, sort, and pagination logic is regression-proof.

---

## Files to Create

### `src/features/analytics/api/stub/__tests__/StubAnalyticsApi.test.ts`

```ts
const seedData = generateSeedData(42);
const api = new StubAnalyticsApi(seedData, { latencyMinMs: 0, latencyMaxMs: 0 }); // disable latency in tests

const defaultFilters: AnalyticsFilters = {
  orgId: "org_zencoder_001",
  timeRange: { fromIso: "2024-12-01T00:00:00Z", toIso: "2025-02-27T23:59:59Z" },
};
```

**Response type conformance** (one `describe` per method):

```ts
describe("getOverview", () => {
  it("returns valid OverviewResponse with all required fields", async () => {
    const res = await api.getOverview(defaultFilters);
    expect(res.kpis).toBeDefined();
    expect(typeof res.kpis.seatAdoptionRate).toBe("number");
    expect(typeof res.kpis.totalCostUsd).toBe("number");
    expect(res.runsTrend.length).toBeGreaterThan(0);
    expect(res.costTrend.length).toBeGreaterThan(0);
    expect(res.anomalies.length).toBe(3);
  });
});
// Repeat pattern for getUsage, getOutcomes, getCost, getReliability, getGovernance, getRunsPage, getRunDetail
```

**Filtering correctness:**

```ts
describe("filtering", () => {
  it("teamIds narrows to specified teams", async () => {
    const res = await api.getRunsPage({ filters: { ...defaultFilters, teamIds: ["team_01"] }, page: 1, pageSize: 100, sortBy: "startedAtIso", sortDirection: "desc" });
    res.rows.forEach(r => expect(r.teamId).toBe("team_01"));
  });

  it("providers: ['codex'] returns only codex runs", async () => {
    const res = await api.getRunsPage({ filters: { ...defaultFilters, providers: ["codex"] }, ... });
    res.rows.forEach(r => expect(r.provider).toBe("codex"));
  });

  it("statuses: ['failed'] returns only failed runs", async () => { ... });
  it("combined filters use AND logic", async () => { ... });
  it("empty filter arrays return full dataset", async () => { ... });
});
```

**Time-range boundaries:**
```ts
it("runs outside time range are excluded", async () => { ... });
it("boundary dates are inclusive", async () => { ... });
it("different time ranges produce different counts", async () => { ... });
```

**Pagination stability:**
```ts
it("same input returns same page content", async () => {
  const a = await api.getRunsPage(request);
  const b = await api.getRunsPage(request);
  expect(a.rows.map(r => r.id)).toEqual(b.rows.map(r => r.id));
});
it("page 1 + page 2 cover all rows", async () => { ... });
it("total matches full filtered count", async () => { ... });
```

**Sorting:**
```ts
it("sortBy: startedAtIso asc → oldest first", async () => { ... });
it("sortBy: costUsd desc → most expensive first", async () => { ... });
it("sortBy: durationMs asc → fastest first", async () => { ... });
it("sortBy: totalTokens desc → highest tokens first", async () => { ... });
```

**Failure injection:**
```ts
it("debugFailureRate: 1 → every call rejects", async () => {
  const failApi = new StubAnalyticsApi(seedData, { debugFailureRate: 1, latencyMinMs: 0, latencyMaxMs: 0 });
  await expect(failApi.getOverview(defaultFilters)).rejects.toThrow();
});
it("debugFailureRate: 0 → no calls reject", async () => { ... });
```

### `src/features/analytics/services/__tests__/AnalyticsService.test.ts`

```ts
const mockApi: IAnalyticsApi = { /* mock all 8 methods with jest.fn() returning typed data */ };
const service = new AnalyticsService(mockApi);
```

**Pass-through:**
```ts
it("getOverview calls api.getOverview with correct filters", async () => { ... });
it("getCost returns api response with rounded currency values", async () => { ... });
```

**Drill-down linkage:**
```ts
it("anomaly runId from getOverview is resolvable by getRunDetail", async () => {
  const overview = await service.getOverview(filters);
  const runId = overview.anomalies[0].runId;
  const detail = await service.getRunDetail(filters.orgId, runId);
  expect(detail.run.id).toBe(runId);
});
```

**Partial data:**
```ts
it("handles empty result set gracefully", async () => { ... });
it("missing optional fields don't cause errors", async () => { ... });
```

---

## Depends On

- **PR 0004** — `generateSeedData`. **PR 0005** — `StubAnalyticsApi`. **PR 0006** — `AnalyticsService`.

## Done When

- All 8 stub API methods have conformance tests.
- Filtering, time range, pagination, and sorting are verified.
- Failure injection tested at 0% and 100%.
- Service delegation + drill-down linkage verified.
- `npm test -- --coverage` shows >=90% for both files.
- All tests pass.
