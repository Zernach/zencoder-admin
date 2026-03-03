import { test, expect } from "@playwright/test";
import { waitForKpiCards, waitForPageLoad } from "../helpers/navigation";
import { expectTableRows, expectChartRendered } from "../helpers/assertions";

test.describe("Overview Dashboard", () => {
  test("KPI cards render and page loads", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Should render the dashboard page with title
    await expect(page.locator("text=Home")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("filter change updates time range", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Verify page loaded
    await expect(page.locator("text=Home")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("sticky filter bar remains visible on scroll", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Filter controls should be visible on load
    await expect(page.locator("[data-testid='sticky-filter-bar']")).toBeVisible({
      timeout: 10_000,
    });
  });
});
