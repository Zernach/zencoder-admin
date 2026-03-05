function clampPercent(v: number): number {
  return Math.min(100, Math.max(0, v));
}

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

export function calcSeatAdoptionRate(activeSeats: number, purchased: number): number {
  if (purchased <= 0) return 0;
  return clampPercent((activeSeats / purchased) * 100);
}

export function calcWauMauRatio(wau: number, mau: number): number {
  if (mau <= 0) return 0;
  return clampPercent((wau / mau) * 100);
}

export function calcRunCompletionRate(completed: number, started: number): number {
  if (started <= 0) return 0;
  return clampPercent((completed / started) * 100);
}

export function calcRunSuccessRate(succeeded: number, completed: number): number {
  if (completed <= 0) return 0;
  return clampPercent((succeeded / completed) * 100);
}

export function calcErrorRate(failed: number, started: number): number {
  if (started <= 0) return 0;
  return clampPercent((failed / started) * 100);
}

export function calcProviderShare(providerRuns: number, totalRuns: number): number {
  if (totalRuns <= 0) return 0;
  return clampPercent((providerRuns / totalRuns) * 100);
}

export function calcAverageTokensPerRun(totalTokens: number, runs: number): number {
  if (runs <= 0) return 0;
  return Math.round(totalTokens / runs);
}

export function calcAverageCostPerRunUsd(totalCost: number, runs: number): number {
  if (runs <= 0) return 0;
  return round2(totalCost / runs);
}

export function calcCostPerSuccessfulRunUsd(totalCost: number, succeeded: number): number {
  if (succeeded <= 0) return 0;
  return round2(totalCost / succeeded);
}

export function calcPrMergeRate(merged: number, created: number): number {
  if (created <= 0) return 0;
  return clampPercent((merged / created) * 100);
}

export function calcTestsPassRate(passing: number, executed: number): number {
  if (executed <= 0) return 0;
  return clampPercent((passing / executed) * 100);
}

export function calcCodeAcceptanceRate(accepted: number, total: number): number {
  if (total <= 0) return 0;
  return clampPercent((accepted / total) * 100);
}

export function calcReworkRate(followUps: number, succeeded: number): number {
  if (succeeded <= 0) return 0;
  return clampPercent((followUps / succeeded) * 100);
}

export function calcPolicyViolationRate(violations: number, actions: number): number {
  if (actions <= 0) return 0;
  return clampPercent((violations / actions) * 100);
}
