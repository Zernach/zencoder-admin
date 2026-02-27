# 0017 — Cost Analytics Screen

> Build the Costs screen: 4 KPI cards, 4 charts (daily trend, model type donut, token usage bar, project lines), a cost efficiency panel, a breakdown table, and an optimization recommendations callout.

---

## Prior State

`analyticsService.getCost(filters)` returns `CostResponse` (PR 0005–0006). All UI primitives exist.

## Target State

`/(dashboard)/costs` gives FinOps stakeholders a complete view of spend, unit economics, and actionable optimization recommendations.

---

## Files to Create

### `src/features/analytics/hooks/useCostDashboard.ts`

Returns `{ data: CostViewModel, loading, error, refetch }`.

### `src/features/analytics/mappers/costMappers.ts`

```ts
interface CostViewModel {
  kpis: KpiCardProps[];                    // 4 cards
  dailyCostTrend: TimeSeriesPoint[];
  costByModelType: KeyValueMetric[];       // codex/claude/other
  tokenUsageByAgent: KeyValueMetric[];
  costPerProjectTrend: { project: string; data: TimeSeriesPoint[] }[];
  efficiency: { avgTokenCost: string; cacheSavings: string; toolCallCost: string; toolCallPercent: string; };
  breakdownTable: CostBreakdownRow[];
  recommendations: string[];
  budget: BudgetSummary;
}
```

### `src/app/(dashboard)/costs.tsx`

```
Header: "Costs" / "Cost analysis and optimization insights"
Search + Time selector + Filters

CardGrid(columns=4):
  KpiCard: "Total Cost"     | "$47,823" | +15.2%
  KpiCard: "Cost Per Run"   | "$3.06"   | +2.3%  | "Average"
  KpiCard: "Total Tokens"   | "2.8M"    | +18.5% | "In + Out"
  KpiCard: "Cache Hit Rate" | "67.4%"   | +5.2%  | "Saved cost"

Chart grid (2×2 on desktop):
  ChartCard: "Daily Cost Trend"         → TrendChart(variant="area")
  ChartCard: "Cost by Model Type"       → DonutChart(centerLabel="Total", centerValue="$47,823")
  ChartCard: "Token Usage by Agent"     → BreakdownChart(variant="horizontal-bar")
  ChartCard: "Cost per Project Over Time" → TrendChart (multi-line, one per project)

Cost Efficiency Panel:
  Surface card with accent left border:
    "Avg Token Cost: $0.0234 per 1K tokens"
    "Cache Savings: $12,847"
    "Tool Call Cost: $8,234 (17% of total)"

SectionHeader: "Cost Breakdown by Project"
ResponsiveTable:
  Columns: Project | Total Cost | Runs | Cost/Run | % of Total
  5 rows:
    Customer Support AI    | $18,234 | 5,847 | $3.12 | 38.1%
    Data Pipeline Automation| $12,847| 4,293 | $2.99 | 26.9%
    Code Review Assistant  | $9,234  | 2,847 | $3.24 | 19.3%
    Sales Intelligence     | $5,123  | 1,923 | $2.66 | 10.7%
    Content Generator      | $3,847  | 1,547 | $2.49 | 8.0%

Optimization Recommendations Panel:
  Highlighted neutral card with subtle accent border:
    • "Increase cache hit rate by 10% to save approximately $1,847/week"
    • "Consider switching ETL Orchestrator to a smaller model for 23% cost reduction"
    • "Optimize token usage in Response Generator (currently 15% above average)"
```

**Responsive**: Web: efficiency + recs alongside chart grid. Mobile: KPI → recs → charts → table.

---

## Depends On

- **PR 0005–0006** — `getCost`. **PR 0008** — filters. **PR 0009–0011** — components. **PR 0012** — shell.

## Done When

- 4 KPI cards render with correct cost/token values.
- Daily Cost Trend area chart renders.
- Cost by Model Type donut shows codex/claude/other.
- Token Usage by Agent bar chart ranks agents.
- Cost efficiency panel shows 3 metrics.
- Breakdown table shows 5 rows, percentages sum to ~100%.
- Optimization recommendations render in highlighted panel.
- All currency: consistent `$X,XXX.XX` format.
- Filter changes trigger refetch.
- Loading/empty/error states work.
