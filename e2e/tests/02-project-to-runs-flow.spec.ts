import { test, expect } from "@playwright/test";
import { navigateTo, waitForPageLoad } from "../helpers/navigation";

test.describe("Agents Hub", () => {
  test("navigate to agents and verify consolidated page loads", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Agents");
    await waitForPageLoad(page);

    // Verify agents page loaded (Project Breakdown is unique to agents page)
    await expect(page.getByText("Project Breakdown", { exact: true })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("agents page shows project breakdown section", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Agents");
    await waitForPageLoad(page);

    await expect(page.locator("text=Project Breakdown")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("agents page shows recent runs section", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Agents");
    await waitForPageLoad(page);

    await expect(page.locator("text=Recent Runs")).toBeVisible({
      timeout: 10_000,
    });
  });
});
