import type { RunListRow } from "@/features/analytics/types";

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)]!;
}

export function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const arr = map.get(key);
    if (arr) arr.push(item);
    else map.set(key, [item]);
  }
  return map;
}

export function countBy<T>(items: T[], keyFn: (item: T) => string | undefined): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    if (key != null) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return map;
}

export function sumField(runs: RunListRow[], field: "costUsd" | "durationMs" | "totalTokens"): number {
  return runs.reduce((s, r) => s + r[field], 0);
}

export function filterByTimeRange<T extends { timestampIso: string }>(
  items: T[],
  from: string,
  to: string,
): T[] {
  return items.filter((item) => item.timestampIso >= from && item.timestampIso <= to);
}

export function sortByTimestampDesc<T extends { id: string; timestampIso: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const cmp = b.timestampIso.localeCompare(a.timestampIso);
    return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
  });
}

export function safeRate(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

export function countSucceeded(runs: RunListRow[]): number {
  return runs.filter((r) => r.status === "succeeded").length;
}

export function countFailed(runs: RunListRow[]): number {
  return runs.filter((r) => r.status === "failed").length;
}

export const LIVE_TASKS = [
  "Analyzing repository changes",
  "Generating implementation plan",
  "Running focused unit tests",
  "Executing lint and type checks",
  "Refactoring service layer",
  "Applying dashboard UI updates",
  "Validating pull request changes",
  "Summarizing runtime findings",
] as const;
