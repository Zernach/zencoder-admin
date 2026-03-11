import type { OverviewResponse, OutcomesResponse, TimeSeriesPoint, RunAnomaly, DeltaPolarity } from "../types";
import { formatPercent, formatCompactNumber } from "../utils/formatters";
import { ROUTES } from "@/constants/routes";

export interface KpiCardData {
  title: string;
  value: string;
  delta?: number;
  deltaPolarity?: DeltaPolarity;
  caption?: string;
  route?: ROUTES;
}

export interface OverviewViewModel {
  adoptionKpis: KpiCardData[];
  reliabilityKpis: KpiCardData[];
  usageKpis: KpiCardData[];
  outcomesKpis: KpiCardData[];
  runsTrend: TimeSeriesPoint[];
  costTrend: TimeSeriesPoint[];
  outcomesTrend?: TimeSeriesPoint[];
  anomalies: RunAnomaly[];
}

export function mapOverviewToViewModel(
  res: OverviewResponse,
  outcomes: OutcomesResponse | undefined,
  formatCurrency: (amount: number) => string,
): OverviewViewModel {
  const k = res.kpis;
  const d = res.deltas;

  return {
    adoptionKpis: [
      { title: "Success Rate", value: formatPercent(k.runSuccessRate * 100), delta: d.runSuccessRate, caption: "All runs" },
      { title: "Total Cost", value: formatCurrency(k.totalCostUsd), delta: d.totalCostUsd, caption: "Period total", route: ROUTES.COSTS },
      { title: "Violations", value: formatCompactNumber(k.policyViolationCount), delta: d.policyViolationCount, deltaPolarity: "negative-good", caption: "Policy blocks", route: ROUTES.GOVERNANCE },
    ],
    reliabilityKpis: [
      { title: "Success Rate", value: formatPercent(k.runSuccessRate * 100), delta: d.runSuccessRate },
      { title: "Codex Share", value: formatPercent(k.providerShareCodex * 100), caption: "Provider mix" },
      { title: "Claude Share", value: formatPercent(k.providerShareClaude * 100), caption: "Provider mix" },
    ],
    usageKpis: [],
    outcomesKpis: outcomes
      ? [
        { title: "PRs Created", value: formatCompactNumber(outcomes.prsCreated), caption: `${formatCompactNumber(outcomes.prsMerged)} merged` },
        { title: "Merge Rate", value: formatPercent(outcomes.prMergeRate * 100), caption: "PR merge rate" },
        { title: "Test Pass Rate", value: formatPercent(outcomes.testsPassRate * 100), caption: "Across all runs" },
      ]
      : [],
    runsTrend: res.runsTrend,
    costTrend: res.costTrend,
    outcomesTrend: outcomes?.outcomesTrend,
    anomalies: res.anomalies,
  };
}
