import { test, expect } from "@playwright/test";
import { navigateTo, waitForPageLoad } from "../helpers/navigation";

test.describe("Governance", () => {
  test("navigate to governance and verify page loads", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Governance");
    await waitForPageLoad(page);

    // Verify governance page loaded (overview section, not sidebar subsection)
    await expect(page.locator("#overview").getByText("Overview")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("seat usage chart section is visible", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Governance");
    await waitForPageLoad(page);

    await expect(page.locator("text=Seat Usage by Runs")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("sticky filter bar is visible on governance page", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await navigateTo(page, "Governance");
    await waitForPageLoad(page);

    await expect(page.locator("[data-testid='sticky-filter-bar']:visible").first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
