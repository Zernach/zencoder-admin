import { test, expect } from "@playwright/test";
import { waitForPageLoad } from "../helpers/navigation";

test.describe("Home screen", () => {
  test("root URL renders Home screen", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Verify home page loaded with title
    await expect(page.locator("text=Home")).toBeVisible({
      timeout: 15_000,
    });
  });
});
