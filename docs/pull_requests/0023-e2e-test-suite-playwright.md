# 0023 — E2E Test Suite (Playwright)

> Implement 5 Playwright end-to-end tests covering the critical web user flows: overview smoke, project-to-runs drill-down, cost analysis, governance, and run detail. Tests run against the full Expo web build at 1440×900.

---

## Prior State

All screens and features are implemented and unit/component tested. Playwright is installed (PR 0001). No E2E tests exist.

## Target State

`npx playwright test` passes — 5 specs validating complete user journeys in a real browser.

---

## Files to Create

### `e2e/playwright.config.ts`

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:8081",  // Expo web dev server
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
  },
  retries: 1,
  webServer: {
    command: "npx expo start --web --port 8081",
    port: 8081,
    reuseExistingServer: true,
  },
});
```

### `e2e/helpers/navigation.ts`

```ts
export async function navigateTo(page: Page, label: string) {
  // Click sidebar nav item by label text
  await page.click(`nav >> text=${label}`);
  await page.waitForLoadState("networkidle");
}

export async function waitForKpiCards(page: Page, count: number) {
  await expect(page.locator('[data-testid="kpi-card"]')).toHaveCount(count, { timeout: 10_000 });
}
```

### `e2e/helpers/assertions.ts`

```ts
export async function expectTableRows(page: Page, minRows: number) {
  const rows = page.locator('table tbody tr, [data-testid="table-row"]');
  await expect(rows).toHaveCount(expect.any(Number));
  expect(await rows.count()).toBeGreaterThanOrEqual(minRows);
}

export async function expectChartRendered(page: Page, testId: string) {
  await expect(page.locator(`[data-testid="${testId}"] svg`)).toBeVisible();
}
```

### `e2e/tests/01-overview-smoke.spec.ts`

```ts
test("Overview smoke: KPI cards render and filter change updates data", async ({ page }) => {
  await page.goto("/");
  // Should redirect to /(dashboard)/dashboard

  // Verify KPI cards
  await waitForKpiCards(page, 16);  // 4 + 5 + 4 + 3

  // Verify charts
  await expectChartRendered(page, "runs-over-time");
  await expectChartRendered(page, "success-rate-trend");

  // Verify table
  await expectTableRows(page, 5);

  // Change time range
  await page.click('[data-testid="time-range-selector"]');
  await page.click('text=Last 7 days');
  await page.waitForTimeout(1500);  // wait for stub latency + refetch

  // KPIs should still be present (values may change)
  await waitForKpiCards(page, 16);
});
```

### `e2e/tests/02-project-to-runs-flow.spec.ts`

```ts
test("Project drill-down: click project row → filtered runs", async ({ page }) => {
  await page.goto("/");
  await navigateTo(page, "Projects");

  // Verify projects table
  await expectTableRows(page, 5);

  // Click first project row
  await page.click('table tbody tr:first-child, [data-testid="table-row"]:first-child');

  // Should navigate to runs with project filter
  await expect(page).toHaveURL(/\/runs/);

  // Filter chip should show project name
  await expect(page.locator('[data-testid="filter-chip"]')).toBeVisible();

  // Runs table should show filtered results
  await expectTableRows(page, 1);
});
```

### `e2e/tests/03-cost-flow.spec.ts`

```ts
test("Cost analysis: breakdown table + recommendations visible", async ({ page }) => {
  await page.goto("/");
  await navigateTo(page, "Costs");

  await waitForKpiCards(page, 4);
  await expectTableRows(page, 5);  // cost breakdown

  // Recommendations panel visible
  await expect(page.locator('text=Cost Optimization Recommendations')).toBeVisible();

  // Change time range → values update
  await page.click('[data-testid="time-range-selector"]');
  await page.click('text=Last 7 days');
  await page.waitForTimeout(1500);
  await waitForKpiCards(page, 4);
});
```

### `e2e/tests/04-governance-flow.spec.ts`

```ts
test("Governance: violations table + compliance checklist", async ({ page }) => {
  await page.goto("/");
  await navigateTo(page, "Governance");

  await waitForKpiCards(page, 6);

  // Policy blocks table
  await expectTableRows(page, 4);

  // Compliance checklist visible
  await expect(page.locator('text=Data Retention Policy')).toBeVisible();
  await expect(page.locator('text=PII Protection')).toBeVisible();
});
```

### `e2e/tests/05-run-detail-flow.spec.ts`

```ts
test("Run detail: timeline + artifacts + policy context", async ({ page }) => {
  await page.goto("/");
  await navigateTo(page, "Runs");

  // Click first run row
  await page.click('table tbody tr:first-child, [data-testid="table-row"]:first-child');

  // Should navigate to run detail
  await expect(page).toHaveURL(/\/runs\/.+/);

  // Timeline visible
  await expect(page.locator('[data-testid="timeline"]')).toBeVisible();

  // Artifacts section
  await expect(page.locator('text=Artifacts')).toBeVisible();

  // Token breakdown
  await expect(page.locator('text=Input Tokens')).toBeVisible();

  // Policy context
  await expect(page.locator('text=Policy Context')).toBeVisible();

  // Back navigation
  await page.goBack();
  await expect(page).toHaveURL(/\/runs$/);
});
```

### `package.json` (modify)

Add script: `"test:e2e": "npx playwright test"`.

---

## Depends On

- **PR 0001** — Playwright. **PR 0012** — shell/navigation. **PR 0013–0019** — all screens.

## Done When

- All 5 E2E specs pass.
- Overview smoke: KPI cards render, filter change works.
- Project drill-down: row click → filtered runs.
- Cost: breakdown table + recommendations visible.
- Governance: violations table + compliance checklist.
- Run detail: timeline, artifacts, tokens, policy context visible.
- Back navigation preserves state.
- Tests run at 1440×900.
- Screenshots captured on failure.
- `npx playwright test` exits 0.
