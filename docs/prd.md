# Zencoder Organizational Analytics Dashboard PRD

## Document Objective
This PRD is intentionally prescriptive so an LLM coding agent can one-shot a high-quality first release of a customer-facing organizational analytics dashboard for cloud coding agents.

The implementation target is a single TypeScript Expo codebase that ships:
- Mobile app for iOS and Android.
- Web admin dashboard for enterprise admins and engineering leaders.
- Stubbed backend APIs only, behind interfaces, with shared request/response types.

## Product Summary
Enterprise customers need a single place to understand whether agent usage is:
- Adopted by teams.
- Delivering useful engineering outcomes.
- Reliable.
- Cost-efficient.
- Governed under policy.

The dashboard must support organization-level reporting and drill-down to team, user, project, and run detail.

## Users and Jobs To Be Done
- Enterprise Org Admin: monitor adoption, spending, and governance at org scale.
- Engineering Manager: compare team performance, reliability, and outcomes.
- FinOps Lead: track spend, budget health, and unit economics.
- Security/Compliance: monitor policy violations, risky behavior, and auditability.

## Product Principles
- One place for signal, not vanity metrics.
- Every KPI must define exact formula and filter behavior.
- Overview answers "what changed"; drill-down answers "why".
- Web prioritizes density and exploration; mobile prioritizes at-a-glance + drill-down.
- Every analytic view must work with stubbed data and shared TypeScript contracts.

## Success Criteria (MVP)
- Admin identifies `% Codex` vs `% Claude` model share for any time range in under 10 seconds.
- Admin identifies total spend, average cost per run, and highest-cost outlier in one workflow.
- Manager drills down org -> team -> user -> run detail without losing filter context.
- Security user identifies top policy violation categories and impacted teams.
- All required tests pass with the quality gates in `docs/test-driven-development.md`.

## Scope (V1)
- Authenticated enterprise-only dashboard shell with org scoping.
- Global filters and synchronized filter state across all dashboard screens.
- KPI cards, trend charts, breakdown charts, run explorer table, and run detail drawer/page.
- Export action (CSV/JSON) powered by stubbed API responses.
- Loading, empty, and error states for every data surface.

## Information Architecture
Primary routes (Expo Router):
- `/(dashboard)/overview`
- `/(dashboard)/usage`
- `/(dashboard)/outcomes`
- `/(dashboard)/cost`
- `/(dashboard)/reliability`
- `/(dashboard)/governance`
- `/(dashboard)/runs`
- `/(dashboard)/runs/[runId]`

Web layout requirements:
- Left navigation rail + top global filter bar.
- 12-column responsive grid.
- Dense tables and multi-chart composition.

Mobile layout requirements:
- Top summary/filter strip + tab navigation.
- Stacked KPI cards and compact charts.
- Drill-down lists and details via full-screen pages/sheets.

## Global Filters and Segmentation
Global filters apply to every screen and persist while navigating:
- Time range: `24h`, `7d`, `30d`, `90d`, custom.
- Team.
- User.
- Project/Repository.
- Model provider and model version.
- Environment.
- Run status.

All metrics must support these dimensions where applicable.

## Core Metric Catalog
All formulas are computed on the filtered dataset.

| Metric | Definition | Why it matters |
| --- | --- | --- |
| `seatsPurchased` | Contracted seats for the organization. | Baseline for adoption targets. |
| `activeSeats30d` | Users with >=1 run in the last 30 days. | True adoption signal. |
| `seatAdoptionRate` | `activeSeats30d / seatsPurchased * 100`. | Utilization of paid seats. |
| `wau` | Unique active users in last 7 days. | Weekly engagement. |
| `mau` | Unique active users in last 30 days. | Monthly engagement. |
| `wauMauRatio` | `wau / mau * 100`. | Product stickiness. |
| `runsStarted` | Count of runs created. | Throughput and traffic. |
| `runsCompleted` | Count of terminal runs (`succeeded`, `failed`, `canceled`). | Work completed signal. |
| `runCompletionRate` | `runsCompleted / runsStarted * 100`. | Queue/execution completion quality. |
| `runSuccessRate` | `succeededRuns / runsCompleted * 100`. | Outcome and reliability combined. |
| `errorRate` | `failedRuns / runsStarted * 100`. | Reliability signal. |
| `p50RunDurationMs` | Median run duration from start to terminal state. | Typical user experience. |
| `p95RunDurationMs` | 95th percentile run duration. | Tail latency risk. |
| `p95QueueWaitMs` | 95th percentile queued time before execution starts. | Saturation and capacity signal. |
| `peakConcurrency` | Max concurrent running runs in period. | Capacity planning indicator. |
| `providerShareCodex` | `runs(provider=codex) / runsStarted * 100`. | Model mix accountability. |
| `providerShareClaude` | `runs(provider=claude) / runsStarted * 100`. | Model mix accountability. |
| `totalTokens` | Sum of input + output tokens. | Overall model consumption. |
| `averageTokensPerRun` | `totalTokens / runsStarted`. | Prompt/run size efficiency. |
| `totalCostUsd` | Sum of run cost in USD. | Executive spend KPI. |
| `averageCostPerRunUsd` | `totalCostUsd / runsStarted`. | Efficiency and optimization baseline. |
| `costPerSuccessfulRunUsd` | `totalCostUsd / succeededRuns`. | Spend effectiveness. |
| `prsCreated` | Count of PRs created by agent runs. | Delivery throughput. |
| `prsMerged` | Count of agent-generated PRs merged. | Accepted business value. |
| `prMergeRate` | `prsMerged / prsCreated * 100`. | Outcome quality proxy. |
| `medianTimeToMergeHours` | Median time from PR created to merged. | Delivery cycle speed. |
| `testsPassRate` | `runsWithTestsPassing / runsWithTestsExecuted * 100`. | Quality confidence. |
| `codeAcceptanceRate` | `acceptedSuggestions / totalSuggestions * 100`. | Human acceptance of agent output. |
| `reworkRate` | `runsWithFollowUpWithin24h / succeededRuns * 100`. | Detects low-quality initial output. |
| `policyViolationCount` | Count of policy-blocked actions. | Governance risk trend. |
| `policyViolationRate` | `policyViolationCount / sensitiveActions * 100`. | Normalized governance risk. |
| `blockedNetworkAttempts` | Count of blocked external network attempts. | Security posture signal. |
| `auditEventsCount` | Count of audited admin/policy actions. | Traceability volume. |

## Screen-Level Requirements
### 1. Overview
Must include:
- KPI cards for `seatAdoptionRate`, `runSuccessRate`, `totalCostUsd`, `providerShareCodex`, `providerShareClaude`, `policyViolationCount`.
- Run volume trend and spend trend for selected period.
- Top anomalies list (highest cost run, longest run, highest token run).
- Cross-links to detailed pages preserving active filters.

### 2. Usage
Must include:
- Active users trend (`wau`, `mau`) and seat adoption trend.
- Team/user/project breakdown tables.
- Distribution chart of runs per user.

### 3. Outcomes
Must include:
- `prsCreated`, `prsMerged`, `prMergeRate`, `medianTimeToMergeHours`.
- `testsPassRate`, `codeAcceptanceRate`, and `reworkRate` trends.
- Team/project leaderboard for delivered value.

### 4. Cost
Must include:
- `totalCostUsd`, `averageCostPerRunUsd`, `costPerSuccessfulRunUsd`.
- Cost breakdown by team/user/project/provider/model.
- Budget progress visualization and over-budget indicators.

### 5. Reliability
Must include:
- `runSuccessRate`, `errorRate`, `p50RunDurationMs`, `p95RunDurationMs`, `p95QueueWaitMs`, `peakConcurrency`.
- Failure category breakdown (`timeout`, `tool_error`, `policy_block`, `infra_error`, `model_error`).
- Reliability trend with incident-like annotations from stub data.

### 6. Governance
Must include:
- `policyViolationCount`, `policyViolationRate`, `blockedNetworkAttempts`, `auditEventsCount`.
- Violations by team/project/user.
- Recent policy changes and actor attribution.

### 7. Runs Explorer
Must include:
- Sortable, paginated table/list of runs with columns: status, team, user, project, provider, tokens, cost, duration, startedAt.
- Filter chips reflecting global filters.
- Quick actions to open run detail.

### 8. Run Detail
Must include:
- Lifecycle timeline (`queued -> running -> terminal`).
- Artifact summary (diff stats, PR status, tests).
- Token + cost breakdown.
- Policy context (granted/blocked actions and reason).

## Required States and UX Behavior
- Every data block supports loading skeleton, empty state, error state, and retry action.
- Empty state copy must explain which filters are active.
- Error states must be user-safe and avoid raw stack traces.
- All charts/tables must reflect filter changes in under 1 second with local stub data.

## Non-Functional Requirements
- TypeScript strict mode across app and stubs.
- No `any` unless documented with justification comment.
- Accessible color contrast and keyboard navigation on web.
- Touch targets minimum `44x44` on mobile.
- Route transitions and list scrolling remain smooth on mid-range devices.

## Data Assumptions (Stubbed)
- Seed data covers at least 90 days.
- Minimum simulated org scale: 6 teams, 80 users, 50 projects, 25,000 runs.
- Includes realistic outliers, failure spikes, and policy violation events.
- Includes model distribution across `codex`, `claude`, and `other`.

## Non-Goals
- Real backend integrations.
- Billing/invoice generation workflow.
- Policy editing or enforcement workflow (analytics/read-only only for V1).
- Multi-org tenant switching UI.

## Definition of Done
- All scoped screens implemented for web + iOS + Android in one Expo app.
- All metrics in this PRD implemented from shared typed contracts.
- Screen, hook, service, and API layering follows the technical spec.
- Test suites and quality gates from `docs/test-driven-development.md` are green.
- Dashboard demonstrates credible enterprise analytics with realistic stub data.
