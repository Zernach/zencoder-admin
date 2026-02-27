# Dashboard Design Content (One-Shot Build Guide)

This document converts the Figma screen content (`docs/designs/out`) into implementation instructions for a coding assistant building a modern React Native dashboard for web/mobile admin users.

Global style constraints for all screens:
- Use Zencoder-inspired palette: `#0a0a0a` / `#000000` backgrounds, `#1a1a1a` / `#262626` surfaces, accent `#30a8dc`, text `#e5e5e5` / `#ffffff`, secondary text and borders `#a3a3a3`.
- Keep a clean enterprise look: dense but readable cards/tables, subtle borders, minimal visual noise.
- Use shared shell and tokens from `docs/dashboard-design-system.md` and `docs/dashboard-layout-motion.md`.
- Keep web + mobile parity with responsive layout and collapsible sidebar on web/tablet.

Sidebar label to route mapping:
- `Dashboard` -> `/(dashboard)/dashboard`
- `Projects` -> `/(dashboard)/projects`
- `Agents` -> `/(dashboard)/agents`
- `Runs` -> `/(dashboard)/runs`
- `Costs` -> `/(dashboard)/costs`
- `Governance` -> `/(dashboard)/governance`
- `Settings` -> `/(dashboard)/settings`

## Dashboard
Route target:
- `/(dashboard)/dashboard`

Screen intent:
- Give org admins a fast snapshot of adoption, reliability, cost, and governance.

Header and controls:
- Sidebar label: `Dashboard`
- Title: `Overview Dashboard`
- Subtitle: `Organization-level analytics for cloud agent operations`
- Meta: `Last updated: Feb 27, 14:32`
- Search input placeholder: `Search agents, projects, runs...`
- Action button: `Filters`

Required sections and content:
- Section title: `Adoption & Throughput`
- KPI cards:
  - `Active Users` = `1,247`, delta `12.3%`, caption `Daily active`
  - `Active Agents` = `342`, delta `8.5%`, caption `In production`
  - `Runs / Day` = `15,623`, delta `3.2%`, caption `Total executions`
  - `Peak Concurrency` = `89`, delta `5.7%`, caption `Max simultaneous`
- Charts row:
  - `Runs Over Time (24h)` line/area chart, x-axis ticks: `00:00, 04:00, 08:00, 12:00, 16:00, 20:00`, y-axis ticks: `0, 500, 1000, 1500, 2000`
  - `Success Rate Trend` line chart with y reference points around `85, 89, 93, 100`
- Section title: `Reliability & Quality`
- KPI cards:
  - `Success Rate` = `94.2%` (delta `2.1%`)
  - `Failure Rate` = `5.8%` (delta `2.1%`)
  - `P50 Duration` = `2.3s` (delta `8.4%`)
  - `P95 Duration` = `12.7s` (delta `5.2%`)
  - `Retry Rate` = `3.1%` (delta `0.5%`)
- Section title: `Cost & Efficiency`
- KPI cards:
  - `Total Cost` = `$47,823` (delta `15.2%`, period `Last 7 days`)
  - `Cost Per Run` = `$3.06` (delta `2.3%`, caption `Average`)
  - `Total Tokens` = `2.8M` (delta `18.5%`, caption `In + Out`)
  - `Cache Hit Rate` = `67.4%` (delta `5.2%`)
- Charts:
  - `Cost by Project` with categories `Customer Support`, `Data Pipeline`, `Code Review`, `Sales Intel`, `Content Gen`
  - `Failures by Category` donut/pie with `Timeout 39%`, `Model Error 26%`, `Tool Error 17%`, `Policy Block 11%`, `Infrastructure 7%`
- Section title: `Safety & Governance`
- KPI cards:
  - `Policy Blocks` = `147` (delta `12.4%`, `Last 7 days`)
  - `Secrets Scans` = `23` (delta `8.7%`, caption `Detected`)
  - `Data Egress` = `847 GB` (delta `22.1%`)
- Table: `Top Projects by Activity`
  - Columns: `Project Name`, `Runs`, `Success Rate`, `Cost`, `Agents`
  - Rows:
    - `Customer Support AI` | `5847` | `96.2%` | `$18,234` | `12`
    - `Data Pipeline Automation` | `4293` | `91.5%` | `$12,847` | `8`
    - `Code Review Assistant` | `2847` | `98.1%` | `$9,234` | `5`
    - `Sales Intelligence` | `1923` | `89.7%` | `$5,123` | `7`
    - `Content Generator` | `1547` | `93.4%` | `$3,847` | `4`

Responsive behavior:
- Web: full multi-section dashboard with charts + table visible on same page.
- Mobile: stack sections in order, convert large charts to compact cards, keep table as tappable list rows.

Build notes for coding assistant:
- Prioritize fast scanability and clear metric hierarchy.
- Use accent `#30a8dc` for primary chart line and active controls.
- Keep cross-links from cards/charts to filtered detail screens (runs, costs, governance).

## Projects
Route target:
- `/(dashboard)/projects`

Screen intent:
- Help admins compare project activity, quality, and spend at a glance.

Header and controls:
- Sidebar label: `Projects`
- Subtitle text: `All active projects in your organization`
- Search placeholder: `Search...`
- Time selector: `Last 7 days`
- Action button: `Filters`

Required sections and content:
- KPI row:
  - `Total Projects` = `5`
  - `Total Runs` = `16,457`
  - `Total Agents` = `36`
- Visualization cards:
  - `Projects by Run Volume` (bar chart)
  - `Success Rate Distribution` (line chart)
- Table title: `All Projects`
- Table columns:
  - `Project Name`, `Total Runs`, `Success Rate`, `Total Cost`, `Agents`, `Actions`
- Seed table rows:
  - `Customer Support AI` | `5847` | `96.2%` | `$18,234` | `12`
  - `Data Pipeline Automation` | `4293` | `91.5%` | `$12,847` | `8`
  - `Code Review Assistant` | `2847` | `98.1%` | `$9,234` | `5`
  - `Sales Intelligence` | `1923` | `89.7%` | `$5,123` | `7`
  - `Content Generator` | `1547` | `93.4%` | `$3,847` | `4`

Responsive behavior:
- Web: keep chart pair above table.
- Mobile: show KPI cards first, then one chart per row, then project list with drill-in action.

Build notes for coding assistant:
- `Actions` column should include view details/navigation CTA.
- Project row click should preserve global filters and navigate to project-scoped runs/cost views.

## Agents
Route target:
- `/(dashboard)/agents`

Screen intent:
- Let admins evaluate deployed agent performance and reliability by agent and project.

Header and controls:
- Sidebar label: `Agents`
- Subtitle text: `All deployed agents across your organization`
- Search placeholder: `Search...`
- Time selector: `Last 7 days`
- Action button: `Filters`

Required sections and content:
- KPI row:
  - `Total Agents` = `6`
  - `Avg Success Rate` = `93.8%`
  - `Total Runs` = `10,584`
  - `Avg Duration` = `3.7s`
- Visualization cards:
  - `Agent Performance by Success Rate` (bar chart)
  - `Agents by Average Duration` (distribution chart)
- Table title: `All Agents`
- Table columns:
  - `Agent Name`, `Project`, `Success Rate`, `Runs`, `Avg Duration`
- Seed rows:
  - `Ticket Classifier` | `Customer Support AI` | `97.8%` | `2341` | `1.2s`
  - `Response Generator` | `Customer Support AI` | `95.4%` | `2103` | `3.4s`
  - `ETL Orchestrator` | `Data Pipeline Automation` | `92.1%` | `1847` | `8.7s`
  - `Data Validator` | `Data Pipeline Automation` | `90.3%` | `1523` | `2.1s`
  - `PR Reviewer` | `Code Review Assistant` | `98.9%` | `867` | `5.2s`
  - `Lead Scorer` | `Sales Intelligence` | `88.4%` | `923` | `1.8s`

Responsive behavior:
- Web: full table with sortable columns.
- Mobile: condensed cards/list items with expandable performance details.

Build notes for coding assistant:
- Highlight low-performing agents (`<90%` success rate) with warning state token.
- Enable one-tap drilldown from agent row to filtered runs explorer.

## Runs
Route target:
- `/(dashboard)/runs`

Screen intent:
- Provide real-time operational visibility into run volume, outcomes, and recent executions.

Header and controls:
- Sidebar label: `Runs`
- Subtitle text: `Real-time view of all agent executions`
- Search placeholder: `Search agents, projects, runs...`
- Action button: `Filters`

Required sections and content:
- KPI row:
  - `Total Runs` = `8`
  - `Successful` = `6`
  - `Failed` = `2`
  - `Avg Duration` = `4.7s`
- Visualization cards:
  - `Runs Over Time (24h)` (line/area)
  - `Duration Distribution` (histogram)
- Table title: `Recent Runs`
- Table columns:
  - `Run ID`, `Agent`, `Project`, `Status`, `Duration`, `Cost`, `Time`
- Seed rows:
  - `r1` | `Ticket Classifier` | `Customer Support AI` | `Success` | `1.2s` | `$0.34` | `9:23:45 AM`
  - `r2` | `Response Generator` | `Customer Support AI` | `Success` | `3.8s` | `$1.23` | `9:21:12 AM`
  - `r3` | `ETL Orchestrator` | `Data Pipeline Automation` | `Failed` | `12.4s` | `$2.45` | `9:18:34 AM`
  - `r4` | `PR Reviewer` | `Code Review Assistant` | `Success` | `6.1s` | `$1.89` | `9:15:23 AM`
  - `r5` | `Data Validator` | `Data Pipeline Automation` | `Success` | `1.9s` | `$0.67` | `9:12:56 AM`
  - `r6` | `Lead Scorer` | `Sales Intelligence` | `Failed` | `8.3s` | `$1.12` | `9:09:18 AM`
  - `r7` | `Ticket Classifier` | `Customer Support AI` | `Success` | `0.9s` | `$0.28` | `9:05:42 AM`
  - `r8` | `Response Generator` | `Customer Support AI` | `Success` | `4.2s` | `$1.45` | `9:02:11 AM`

Responsive behavior:
- Web: sortable dense table with row status badges.
- Mobile: virtualized list, each run row opens run detail screen/sheet.

Build notes for coding assistant:
- Status badges: success/failed tokens with icon + text.
- Runs table must support pagination/sorting/filter chips per technical spec.

## Costs
Route target:
- `/(dashboard)/costs`

Screen intent:
- Show spend, token economics, and practical optimization opportunities for finance and engineering leads.

Header and controls:
- Sidebar label: `Costs`
- Subtitle text: `Cost analysis and optimization insights`
- Search placeholder: `Search...`
- Time selector: `Last 7 days`
- Action button: `Filters`

Required sections and content:
- KPI row:
  - `Total Cost` = `$47,823` (delta `15.2%`)
  - `Cost Per Run` = `$3.06` (delta `2.3%`, caption `Average`)
  - `Total Tokens` = `2.8M` (delta `18.5%`, caption `In + Out`)
  - `Cache Hit Rate` = `67.4%` (delta `5.2%`, caption `Saved cost`)
- Visualization cards:
  - `Daily Cost Trend` (area chart)
  - `Cost by Model Type` (pie chart)
  - `Token Usage by Agent` (bar chart)
  - `Cost per Project Over Time` (line chart)
- Cost efficiency panel:
  - `Avg Token Cost` = `$0.0234` (`Per 1K tokens`)
  - `Cache Savings` = `$12,847`
  - `Tool Call Cost` = `$8,234` (`17% of total`)
- Table title: `Cost Breakdown by Project`
- Columns:
  - `Project`, `Total Cost`, `Runs`, `Cost/Run`, `% of Total`
- Rows:
  - `Customer Support AI` | `$18,234` | `5847` | `$3.12` | `38.1%`
  - `Data Pipeline Automation` | `$12,847` | `4293` | `$2.99` | `26.9%`
  - `Code Review Assistant` | `$9,234` | `2847` | `$3.24` | `19.3%`
  - `Sales Intelligence` | `$5,123` | `1923` | `$2.66` | `10.7%`
  - `Content Generator` | `$3,847` | `1547` | `$2.49` | `8.0%`
- Recommendation callout title: `Cost Optimization Recommendations`
- Recommendation bullets:
  - `Increase cache hit rate by 10% to save approximately $1,847/week`
  - `Consider switching ETL Orchestrator to a smaller model for 23% cost reduction`
  - `Optimize token usage in Response Generator (currently 15% above average)`

Responsive behavior:
- Web: show efficiency panel and recommendations with chart/table grid.
- Mobile: prioritize KPI + recommendations, collapse deep charts into swipeable cards.

Build notes for coding assistant:
- Recommendations should render in highlighted neutral panel with subtle accent border.
- All currency formatting must be consistent and locale-safe.

## Governance
Route target:
- `/(dashboard)/governance`

Screen intent:
- Provide security/compliance oversight and actionable governance monitoring.

Header and controls:
- Sidebar label: `Governance`
- Subtitle text: `Security, compliance, and policy enforcement`
- Search placeholder: `Search...`
- Time selector: `Last 7 days`
- Action button: `Filters`

Required sections and content:
- KPI row:
  - `Policy Blocks` = `147` (delta `12.4%`)
  - `Secrets Detected` = `23` (delta `8.7%`, caption `Scanned & blocked`)
  - `Data Egress` = `847 GB` (delta `22.1%`, caption `Total transfer`)
  - `Compliance Score` = `94.2%` (caption `Above threshold`)
  - `Active Alerts` = `7` (caption `Requires attention`)
  - `Audit Events` = `1,247`
- Visualization cards:
  - `Policy Blocks Over Time` (line chart)
  - `Blocks by Policy Type` (pie chart)
- Table title: `Recent Policy Blocks`
- Columns:
  - `Timestamp`, `Agent`, `Reason`, `Severity`
- Rows:
  - `9:23:45 AM` | `Response Generator` | `PII Detection` | `HIGH`
  - `9:18:12 AM` | `Lead Scorer` | `Rate Limit Exceeded` | `MEDIUM`
  - `8:45:23 AM` | `Data Validator` | `Unauthorized API Access` | `HIGH`
  - `7:32:11 AM` | `Ticket Classifier` | `Content Policy Violation` | `LOW`
- Table title: `Security Events`
- Columns:
  - `Type`, `Description`, `Timestamp`
- Rows:
  - `Secret Detected` | `API key found in prompt` | `9:12:34 AM`
  - `Data Egress Alert` | `Large file download: 124 MB` | `8:45:12 AM`
  - `Anomalous Behavior` | `Unusual token usage pattern` | `7:23:45 AM`
- Checklist title: `Compliance Status`
- Checklist items:
  - `Data Retention Policy` = `Compliant`
  - `Access Controls` = `Compliant`
  - `Audit Logging` = `Compliant`
  - `Encryption at Rest` = `Compliant`
  - `PII Protection` = `Warning`
  - `Rate Limiting` = `Warning`
- Recommendation callout title: `Governance Recommendations`
- Recommendation bullets:
  - `Review and update PII detection rules for Response Generator agent`
  - `Implement additional rate limiting for Lead Scorer to prevent policy violations`
  - `Schedule quarterly access review for all agents with elevated permissions`

Responsive behavior:
- Web: stacked security tables with visible severity badges.
- Mobile: KPI + charts first, then expandable security/policy lists.

Build notes for coding assistant:
- Severity badges use semantic colors and text labels, never color-only cues.
- Governance recommendations panel should stay visible near bottom with warning styling.

## Settings
Route target:
- `/(dashboard)/settings`

Screen intent:
- Allow admins to configure org defaults, notifications, API access, and team membership.

Header and controls:
- Sidebar label: `Settings`
- Subtitle text: `Configure your organization preferences`

Required sections and content:
- `Organization Settings`
  - `Organization Name`: `Acme Corp`
  - `Organization ID`: `org_abc123xyz`
- `Dashboard Preferences`
  - `Default Time Range` (select control, helper text: `Default view for analytics`)
  - `Auto Refresh` toggle with helper text `Automatically update dashboard`, value `ON`
- `Notification Settings` toggles:
  - `Policy Violations` with helper `Notify when policy blocks occur`
  - `High Failure Rates` with helper `Alert when failure rate exceeds 10%`
  - `Cost Alerts` with helper `Notify when daily costs exceed threshold`
  - `Security Events` with helper `Alert on suspicious activity`
- `API Access`
  - `API Key`: `sk_live_abc123xyz789...`
  - Actions: `Copy`, `Regenerate API Key`
- `Team Members`
  - CTA: `+ Invite`
  - Members:
    - `admin@acme.com` (`Admin - You`)
    - `john@acme.com` (`Member`)
    - `sarah@acme.com` (`Member`)

Responsive behavior:
- Web: form-like two-column layout where appropriate.
- Mobile: single-column stacked form sections with sticky save/apply action area.

Build notes for coding assistant:
- Use secure masking for API key display and explicit confirmation before regeneration.
- Settings controls should persist through stubbed service interfaces, not local component state only.
