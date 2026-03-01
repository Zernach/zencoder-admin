import type { OverviewResponse, UsageResponse, OutcomesResponse, TimeSeriesPoint, RunAnomaly } from "../types";
import { formatCurrency, formatPercent, formatCompactNumber } from "../utils/formatters";

interface KpiCardData {
  title: string;
  value: string;
  delta?: number;
  deltaPolarity?: "positive-good" | "negative-good";
  caption?: string;
  route?: string;
}

export interface OverviewViewModel {
  adoptionKpis: KpiCardData[];
  reliabilityKpis: KpiCardData[];
  usageKpis: KpiCardData[];
  outcomesKpis: KpiCardData[];
  runsTrend: TimeSeriesPoint[];
  costTrend: TimeSeriesPoint[];
  activeUsersTrend?: TimeSeriesPoint[];
  outcomesTrend?: TimeSeriesPoint[];
  anomalies: RunAnomaly[];
}

export function mapOverviewToViewModel(
  res: OverviewResponse,
  usage?: UsageResponse,
  outcomes?: OutcomesResponse,
): OverviewViewModel {
  const k = res.kpis;
  const d = res.deltas;

  return {
    adoptionKpis: [
      { title: "Seat Adoption", value: formatPercent(k.seatAdoptionRate * 100), delta: d.seatAdoptionRate, caption: "Active seats" },
      { title: "Success Rate", value: formatPercent(k.runSuccessRate * 100), delta: d.runSuccessRate, caption: "All runs" },
      { title: "Total Cost", value: formatCurrency(k.totalCostUsd), delta: d.totalCostUsd, caption: "Period total", route: "/(dashboard)/costs" },
      { title: "Violations", value: formatCompactNumber(k.policyViolationCount), delta: d.policyViolationCount, deltaPolarity: "negative-good", caption: "Policy blocks", route: "/(dashboard)/governance" },
    ],
    reliabilityKpis: [
      { title: "Success Rate", value: formatPercent(k.runSuccessRate * 100), delta: d.runSuccessRate },
      { title: "Codex Share", value: formatPercent(k.providerShareCodex * 100), caption: "Provider mix" },
      { title: "Claude Share", value: formatPercent(k.providerShareClaude * 100), caption: "Provider mix" },
    ],
    usageKpis: usage
      ? [
          { title: "WAU", value: formatCompactNumber(usage.wau), caption: "Weekly active users" },
          { title: "MAU", value: formatCompactNumber(usage.mau), caption: "Monthly active users" },
          { title: "Adoption Rate", value: formatPercent(usage.seatAdoptionRate * 100), caption: `${usage.activeSeats30d} of total seats` },
        ]
      : [],
    outcomesKpis: outcomes
      ? [
          { title: "PRs Created", value: formatCompactNumber(outcomes.prsCreated), caption: `${formatCompactNumber(outcomes.prsMerged)} merged` },
          { title: "Merge Rate", value: formatPercent(outcomes.prMergeRate * 100), caption: "PR merge rate" },
          { title: "Test Pass Rate", value: formatPercent(outcomes.testsPassRate * 100), caption: "Across all runs" },
        ]
      : [],
    runsTrend: res.runsTrend,
    costTrend: res.costTrend,
    activeUsersTrend: usage?.activeUsersTrend,
    outcomesTrend: outcomes?.outcomesTrend,
    anomalies: res.anomalies,
  };
}
