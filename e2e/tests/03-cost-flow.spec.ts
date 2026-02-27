import { test, expect } from "@playwright/test";
import { navigateTo, waitForPageLoad } from "../helpers/navigation";
import { expectTableRows } from "../helpers/assertions";

test.describe("Cost Analytics", () => {
  test("navigate to costs and verify page loads", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Costs");
    await waitForPageLoad(page);

    // Verify costs page loaded
    await expect(page.locator("text=Cost Analytics")).toBeVisible({
      timeout: 10_000,
    });
  });
});
