import { CURRENCY_OPTIONS, type CurrencyCode } from "@/types/settings";

/**
 * EUR-based conversion rates.
 * EUR = 1.0; every other rate is "how many units of X per 1 EUR".
 * These are hard-coded approximations — swap for a live API later.
 */
export const CONVERSION_RATES: Record<CurrencyCode, number> = {
  EUR: 1.0,
  USD: 1.08,
  GBP: 0.86,
  JPY: 162.5,
  CNY: 7.82,
  KRW: 1432.0,
  INR: 90.1,
  BRL: 5.38,
  CAD: 1.47,
  AUD: 1.66,
  CHF: 0.96,
  SEK: 11.42,
  NOK: 11.58,
  HKD: 8.44,
  NZD: 1.79,
  ZAR: 20.15,
  RUB: 99.5,
  TRY: 34.8,
  MXN: 18.45,
  SGD: 1.46,
};

const optionsByCode = new Map(CURRENCY_OPTIONS.map((o) => [o.code, o]));

/** Return the display symbol for a currency code. */
export function getCurrencySymbol(code: CurrencyCode): string {
  return optionsByCode.get(code)?.symbol ?? code;
}

/** Return the number of decimal places for a currency (0 for JPY/KRW, 2 for most). */
export function getCurrencyDecimals(code: CurrencyCode): number {
  return optionsByCode.get(code)?.decimals ?? 2;
}
