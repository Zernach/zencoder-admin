import { CONVERSION_RATES } from "@/constants/currencies";
import type { CurrencyCode } from "@/types/settings";

/**
 * Convert an amount denominated in EUR to the target currency.
 * All seed data is assumed to be in EUR.
 */
export function convertFromEUR(amountEUR: number, targetCurrency: CurrencyCode): number {
  return amountEUR * CONVERSION_RATES[targetCurrency];
}

/**
 * Convert an amount from one currency to another via EUR cross-rate.
 */
export function convertBetween(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const amountInEUR = amount / CONVERSION_RATES[from];
  return amountInEUR * CONVERSION_RATES[to];
}
