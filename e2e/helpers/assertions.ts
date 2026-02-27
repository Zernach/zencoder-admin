import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function expectTableRows(page: Page, minRows: number) {
  const rows = page.locator('[data-testid="table-row"]');
  await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  expect(await rows.count()).toBeGreaterThanOrEqual(minRows);
}

export async function expectChartRendered(page: Page, testId: string) {
  await expect(
    page.locator(`[data-testid="${testId}"] svg`)
  ).toBeVisible({ timeout: 10_000 });
}

export async function expectTextVisible(page: Page, text: string) {
  await expect(page.locator(`text=${text}`)).toBeVisible({ timeout: 10_000 });
}
