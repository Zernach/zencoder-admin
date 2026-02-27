import { test, expect } from "@playwright/test";
import { navigateTo, waitForPageLoad } from "../helpers/navigation";
import { expectTableRows } from "../helpers/assertions";

test.describe("Run Detail", () => {
  test("navigate to runs and verify page loads", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Runs");
    await waitForPageLoad(page);

    // Verify runs page loaded
    await expect(page.locator("text=Runs Explorer")).toBeVisible({
      timeout: 10_000,
    });
  });
});
