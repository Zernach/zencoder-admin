# 0015 — Agents Screen

> Build the Agents screen: 4 KPI cards, 2 performance charts, and a detailed agent table where agents below 90% success rate show a warning indicator.

---

## Prior State

Projects screen (PR 0014) demonstrates the project-level pattern. Agent data exists in seed data (PR 0004).

## Target State

`/(dashboard)/agents` renders agent performance comparisons. Low performers are flagged. Row press drills to agent-filtered runs.

---

## Files to Create

### `src/features/analytics/hooks/useAgentsDashboard.ts`

```ts
export function useAgentsDashboard() {
  // Aggregates agent-level metrics: group runs by agentId
  // Returns { data: AgentsViewModel, loading, error, refetch }
}
```

### `src/features/analytics/mappers/agentsMappers.ts`

```ts
interface AgentsViewModel {
  kpis: KpiCardProps[];             // Total Agents, Avg Success Rate, Total Runs, Avg Duration
  performanceByAgent: KeyValueMetric[];  // success rate per agent
  durationByAgent: KeyValueMetric[];     // avg duration per agent
  agentTable: AgentTableRow[];
}

interface AgentTableRow {
  id: string;
  name: string;
  projectName: string;
  successRate: number;
  runs: number;
  avgDurationMs: number;
  isWarning: boolean;       // true when successRate < 90
}
```

### `src/app/(dashboard)/agents.tsx`

Layout:

```
Header: "Agents" / "All deployed agents across your organization"
Search + Time selector + Filters

CardGrid(columns=4):
  KpiCard: "Total Agents"      | "6"
  KpiCard: "Avg Success Rate"  | "93.8%"
  KpiCard: "Total Runs"        | "10,584"
  KpiCard: "Avg Duration"      | "3.7s"

ChartCard row:
  "Agent Performance by Success Rate" → BreakdownChart(variant="horizontal-bar")
  "Agents by Average Duration"        → BreakdownChart or DistributionChart

SectionHeader: "All Agents"
ResponsiveTable:
  Columns: Agent Name | Project | Success Rate | Runs | Avg Duration
  6 rows:
    Ticket Classifier   | Customer Support AI        | 97.8% | 2,341 | 1.2s
    Response Generator   | Customer Support AI        | 95.4% | 2,103 | 3.4s
    ETL Orchestrator     | Data Pipeline Automation   | 92.1% | 1,847 | 8.7s
    Data Validator       | Data Pipeline Automation   | 90.3% | 1,523 | 2.1s
    PR Reviewer          | Code Review Assistant      | 98.9% | 867   | 5.2s
    Lead Scorer          | Sales Intelligence         | 88.4% | 923   | 1.8s  ⚠️

  Lead Scorer row: warning StatusBadge or background tint (successRate < 90%)
  Row press → router.push(`/(dashboard)/runs?agentId=${row.id}`)
```

**Responsive**: Web: full sortable table. Mobile: condensed cards with expandable detail.

---

## Depends On

- **PR 0008** — filters. **PR 0009** — KpiCard, StatusBadge. **PR 0010** — charts. **PR 0011** — ResponsiveTable. **PR 0012** — shell.

## Done When

- 4 KPI cards render correctly.
- Performance bar chart ranks agents by success rate.
- Duration chart shows distribution.
- Agent table shows 6 rows.
- Lead Scorer (88.4%) has visual warning indicator.
- Row press navigates to agent-filtered runs.
- Sortable by success rate, runs, duration.
- Filter changes trigger refetch.
- Loading/empty/error states work.
