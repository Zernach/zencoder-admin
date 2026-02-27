import { test, expect } from "@playwright/test";
import { navigateTo, waitForPageLoad } from "../helpers/navigation";

test.describe("Governance", () => {
  test("navigate to governance and verify page loads", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Governance");
    await waitForPageLoad(page);

    // Verify governance page loaded
    await expect(page.locator("text=Governance")).toBeVisible({
      timeout: 10_000,
    });
  });
});
