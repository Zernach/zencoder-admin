import { test, expect } from "@playwright/test";
import { navigateTo, waitForPageLoad } from "../helpers/navigation";
import { expectTableRows } from "../helpers/assertions";

test.describe("Project Drill-down", () => {
  test("navigate to projects screen", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Projects");
    await waitForPageLoad(page);

    // Verify projects page loaded
    await expect(page.locator("text=Projects")).toBeVisible({
      timeout: 10_000,
    });
  });
});
