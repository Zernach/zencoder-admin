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

  return {
    adoptionKpis: [
      { title: "Seat Adoption", value: formatPercent(k.seatAdoptionRate * 100), delta: 12.3, caption: "Active seats" },
      { title: "Success Rate", value: formatPercent(k.runSuccessRate * 100), delta: 2.1, caption: "All runs" },
      { title: "Total Cost", value: formatCurrency(k.totalCostUsd), delta: 15.2, caption: "Period total", route: "/(dashboard)/costs" },
      { title: "Violations", value: formatCompactNumber(k.policyViolationCount), delta: -3.1, deltaPolarity: "negative-good", caption: "Policy blocks", route: "/(dashboard)/governance" },
    ],
    reliabilityKpis: [
      { title: "Success Rate", value: formatPercent(k.runSuccessRate * 100), delta: 2.1 },
      { title: "Codex Share", value: formatPercent(k.providerShareCodex * 100), delta: 1.5, caption: "Provider mix" },
      { title: "Claude Share", value: formatPercent(k.providerShareClaude * 100), delta: -0.8, caption: "Provider mix" },
    ],
    costKpis: [
      { title: "Total Cost", value: formatCurrency(k.totalCostUsd), delta: 15.2, route: "/(dashboard)/costs" },
      { title: "Violations", value: formatCompactNumber(k.policyViolationCount), delta: -3.1, deltaPolarity: "negative-good" },
    ],
    governanceKpis: [
      { title: "Policy Blocks", value: formatCompactNumber(k.policyViolationCount), delta: 12.4 },
    ],
    runsTrend: res.runsTrend,
    costTrend: res.costTrend,
    anomalies: res.anomalies,
  };
}
