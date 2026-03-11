import { test, expect } from "@playwright/test";
import { navigateTo, waitForPageLoad } from "../helpers/navigation";
import { expectTableRows } from "../helpers/assertions";

test.describe("Costs", () => {
  test("navigate to costs and verify page loads", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Costs");
    await waitForPageLoad(page);

    // Verify costs page loaded (cost-summary section has Cost per Team chart)
    await expect(page.locator("#cost-summary").getByText("Cost per Team")).toBeVisible({
      timeout: 10_000,
    });
  });
});
