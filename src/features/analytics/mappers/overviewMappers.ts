import type { OverviewResponse, TimeSeriesPoint, KeyValueMetric, RunAnomaly } from "../types";
import { formatCurrency, formatPercent, formatCompactNumber, formatDuration } from "../utils/formatters";

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
  costKpis: KpiCardData[];
  governanceKpis: KpiCardData[];
  runsTrend: TimeSeriesPoint[];
  costTrend: TimeSeriesPoint[];
  anomalies: RunAnomaly[];
}

export function mapOverviewToViewModel(res: OverviewResponse): OverviewViewModel {
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
    costKpis: [
      { title: "Total Cost", value: formatCurrency(k.totalCostUsd), delta: d.totalCostUsd, route: "/(dashboard)/costs" },
      { title: "Violations", value: formatCompactNumber(k.policyViolationCount), delta: d.policyViolationCount, deltaPolarity: "negative-good" },
    ],
    governanceKpis: [
      { title: "Policy Blocks", value: formatCompactNumber(k.policyViolationCount), delta: d.policyViolationCount },
    ],
    runsTrend: res.runsTrend,
    costTrend: res.costTrend,
    anomalies: res.anomalies,
  };
}
