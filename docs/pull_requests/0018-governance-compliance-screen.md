# 0018 — Governance & Compliance Screen

> Build the Governance screen: 6 KPI cards, 2 charts, a policy violations table (with severity badges), a security events table, a compliance checklist, and governance recommendations.

---

## Prior State

`analyticsService.getGovernance(filters)` returns `GovernanceResponse` with violations, events, compliance items, and policy changes (PR 0005–0006). All UI primitives exist.

## Target State

`/(dashboard)/governance` gives security/compliance stakeholders full visibility into policy enforcement, security events, and compliance posture.

---

## Files to Create

### `src/features/analytics/hooks/useGovernanceDashboard.ts`

Returns `{ data: GovernanceViewModel, loading, error, refetch }`.

### `src/features/analytics/mappers/governanceMappers.ts`

```ts
interface GovernanceViewModel {
  kpis: KpiCardProps[];                        // 6 cards
  policyBlocksTrend: TimeSeriesPoint[];
  blocksByPolicyType: KeyValueMetric[];
  violationsTable: PolicyViolationRow[];
  securityEventsTable: SecurityEventRow[];
  complianceChecklist: ComplianceItem[];
  recommendations: string[];
}
```

### `src/app/(dashboard)/governance.tsx`

```
Header: "Governance" / "Security, compliance, and policy enforcement"
Search + Time selector + Filters

CardGrid(columns=3):  (6 cards in 2 rows of 3)
  KpiCard: "Policy Blocks"      | "147"     | +12.4%
  KpiCard: "Secrets Detected"   | "23"      | +8.7%  | "Scanned & blocked"
  KpiCard: "Data Egress"        | "847 GB"  | +22.1% | "Total transfer"
  KpiCard: "Compliance Score"   | "94.2%"   |        | "Above threshold"
  KpiCard: "Active Alerts"      | "7"       |        | "Requires attention"
  KpiCard: "Audit Events"       | "1,247"   |

ChartCard row:
  "Policy Blocks Over Time"   → TrendChart(variant="line")
  "Blocks by Policy Type"     → DonutChart

SectionHeader: "Recent Policy Blocks"
ResponsiveTable:
  Columns: Timestamp | Agent | Reason | Severity
  4 rows:
    9:23:45 AM | Response Generator  | PII Detection              | HIGH   (red badge)
    9:18:12 AM | Lead Scorer         | Rate Limit Exceeded        | MEDIUM (amber badge)
    8:45:23 AM | Data Validator      | Unauthorized API Access    | HIGH   (red badge)
    7:32:11 AM | Ticket Classifier   | Content Policy Violation   | LOW    (gray badge)

  Severity: StatusBadge(variant="severity") — always icon + text label

SectionHeader: "Security Events"
ResponsiveTable:
  Columns: Type | Description | Timestamp
  3 rows:
    Secret Detected    | API key found in prompt       | 9:12:34 AM
    Data Egress Alert  | Large file download: 124 MB   | 8:45:12 AM
    Anomalous Behavior | Unusual token usage pattern   | 7:23:45 AM

Compliance Status Checklist:
  Card with check/warning icons per item:
    ✓ Data Retention Policy   — Compliant
    ✓ Access Controls         — Compliant
    ✓ Audit Logging           — Compliant
    ✓ Encryption at Rest      — Compliant
    ⚠ PII Protection          — Warning  (warning color)
    ⚠ Rate Limiting           — Warning  (warning color)

Governance Recommendations Panel:
  Warning-styled card (amber left border):
    • "Review and update PII detection rules for Response Generator agent"
    • "Implement additional rate limiting for Lead Scorer to prevent policy violations"
    • "Schedule quarterly access review for all agents with elevated permissions"
```

**Responsive**: Web: tables stacked with severity badges visible. Mobile: KPI → charts → expandable lists.

---

## Depends On

- **PR 0005–0006** — `getGovernance`. **PR 0008** — filters. **PR 0009–0011** — components. **PR 0012** — shell.

## Done When

- 6 KPI cards render.
- Policy Blocks trend chart renders.
- Policy type donut renders with segment percentages.
- Violations table shows 4 rows with severity badges (icon + text, never color-only).
- Security events table shows 3 rows.
- Compliance checklist: 4 compliant (green check), 2 warning (amber warning).
- Recommendations panel renders in warning-styled callout.
- Filter changes trigger refetch.
- Loading/empty/error states work.
