export function formatCurrency(usd: number): string {
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCostPerToken(usdPerToken: number): string {
  const tenThousandthsOfPennyPerToken = Math.round(usdPerToken * 1_000_000);
  return `${tenThousandthsOfPennyPerToken.toLocaleString("en-US")} ten-thousandths of a penny per token`;
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
