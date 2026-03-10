import { getCurrencySymbol, getCurrencyDecimals } from "@/constants/currencies";
import type { CurrencyCode } from "@/types/settings";

export function formatCurrency(amount: number, currencyCode: CurrencyCode = "EUR"): string {
  const symbol = getCurrencySymbol(currencyCode);
  const decimals = getCurrencyDecimals(currencyCode);
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatCostPerToken(amountPerToken: number, currencyCode: CurrencyCode = "EUR"): string {
  const symbol = getCurrencySymbol(currencyCode);
  const tenThousandthsOfPennyPerToken = Math.round(amountPerToken * 1_000_000);
  return `${symbol}${tenThousandthsOfPennyPerToken.toLocaleString("en-US")} micro-units/token`;
}

export function formatCompactCurrency(amount: number, currencyCode: CurrencyCode = "EUR"): string {
  const symbol = getCurrencySymbol(currencyCode);
  const decimals = getCurrencyDecimals(currencyCode);
  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toFixed(decimals)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

export function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatTokens(n: number): string {
  return formatCompactNumber(n);
}

export function formatDelta(value: number): string {
  const sign = value >= 0 ? "+" : "\u2212";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}
