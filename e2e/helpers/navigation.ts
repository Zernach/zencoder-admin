import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function navigateTo(page: Page, label: string) {
  // Desktop: sidebar uses button. Mobile: bottom tabs use tab role.
  const nav =
    page.getByRole("button", { name: label, exact: true }).or(
      page.getByRole("tab", { name: label, exact: true }),
    );
  await nav.click();
  await page.waitForTimeout(500);
}

export async function waitForKpiCards(page: Page, count: number) {
  await expect(
    page.locator('[data-testid="kpi-card"]')
  ).toHaveCount(count, { timeout: 10_000 });
}

export async function waitForPageLoad(page: Page) {
  await page.waitForTimeout(2000);
}
