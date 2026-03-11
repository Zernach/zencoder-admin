import { test, expect } from "@playwright/test";
import { navigateTo, waitForPageLoad } from "../helpers/navigation";

test.describe("Agents Hub", () => {
  test("navigate to agents and verify consolidated page loads", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Agents");
    await waitForPageLoad(page);

    // Verify agents page loaded by checking the actual section container.
    await expect(page.locator("#project-breakdown")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("agents page shows project breakdown section", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Agents");
    await waitForPageLoad(page);

    await expect(page.locator("#project-breakdown")).toContainText("All Projects", {
      timeout: 10_000,
    });
  });

  test("agents page shows recent runs section", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Agents");
    await waitForPageLoad(page);

    await expect(page.locator("#recent-runs")).toContainText("All Runs", {
      timeout: 10_000,
    });
  });
});
