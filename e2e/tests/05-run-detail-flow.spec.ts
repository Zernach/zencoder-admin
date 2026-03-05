import { test, expect } from "@playwright/test";
import { waitForPageLoad } from "../helpers/navigation";

test.describe("Home screen", () => {
  test("root URL renders Home screen", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Verify home page loaded (Key Metrics section is unique to overview)
    await expect(page.getByText("Key Metrics", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });
});
