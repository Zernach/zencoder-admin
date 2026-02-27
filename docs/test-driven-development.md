# Zencoder Organizational Analytics Dashboard TDD Specification

## Purpose
This document defines the required test strategy and quality gates so an LLM agent can deliver a one-shot implementation with reliable behavior across web, iOS, and Android.

## Testing Principles
- Test outcomes, not implementation details.
- Keep metrics logic deterministic and independently unit-testable.
- Validate shared type contracts between UI and stubbed API.
- Guarantee screen behavior across loading, empty, error, and success states.
- Prioritize business-critical analytics flows and drill-down paths.

## Required Tooling
- Jest.
- React Native Testing Library.
- `@testing-library/jest-native`.
- MSW for API mocking in tests where needed.
- Playwright for web end-to-end tests.

## TDD Implementation Order
1. Write failing unit tests for metric formulas and data transforms.
2. Write failing contract tests for `IAnalyticsApi` and stub responses.
3. Implement stub fixtures + `StubAnalyticsApi` to satisfy contracts.
4. Write failing service tests for aggregation, sorting, pagination, and filter behavior.
5. Implement service layer and utility modules.
6. Write failing hook tests for query keys and state transitions.
7. Implement hooks and dependency injection wiring.
8. Write failing component/screen tests for each route.
9. Implement UI composition and interactions.
10. Add Playwright end-to-end coverage for critical web journeys.

## Unit Test Requirements
Metric utilities must include formula and edge-case coverage for:
- `providerShareCodex`.
- `providerShareClaude`.
- `seatAdoptionRate`.
- `wauMauRatio`.
- `runCompletionRate`.
- `runSuccessRate`.
- `errorRate`.
- `averageTokensPerRun`.
- `averageCostPerRunUsd`.
- `costPerSuccessfulRunUsd`.
- `prMergeRate`.
- `testsPassRate`.
- `codeAcceptanceRate`.
- `reworkRate`.
- `policyViolationRate`.

Edge cases that must be tested:
- Zero-denominator handling returns `0` not `NaN`/`Infinity`.
- Negative or malformed numeric values are sanitized or rejected.
- Rounding and currency formatting are consistent.
- Percentages remain in `0..100` when source data is valid.

## Contract and Stub API Tests
For `StubAnalyticsApi`:
- Every method returns the exact shared response type.
- Filtering by team/user/project/provider/model/environment/status is correct.
- Time-range boundaries are inclusive and deterministic.
- Pagination is stable and deterministic for identical inputs.
- Sorting works for `startedAtIso`, `costUsd`, `durationMs`, `totalTokens`.
- Failure injection mode produces typed error responses/messages.

## Service Layer Tests
`AnalyticsService` must be tested for:
- Correct pass-through and mapping of API responses.
- Correct derived metric computation when required.
- Correct behavior with partial data and missing optional fields.
- Correct drill-down linkage (overview anomaly item links to run detail ID).

## Hook Tests
Each screen hook must validate:
- Exposes predictable shape `{ data, loading, error, refetch }`.
- Query keys include active filters and pagination/sort params.
- Filter changes trigger refetch with correct parameters.
- Loading -> success transition preserves type-safe data access.
- Loading -> empty transition renders empty state-ready view models.
- Error state provides user-safe message and retry callback.

## Component and Screen Tests
Test all major screens:
- `overview`, `usage`, `outcomes`, `cost`, `reliability`, `governance`, `runs`, `runs/[runId]`.

Per-screen minimum assertions:
- Required KPI cards are visible and correctly formatted.
- Charts receive correct series/breakdown inputs.
- Tables/lists show expected columns and values.
- Loading skeleton renders before data arrival.
- Empty state renders when no rows match filters.
- Error state renders with retry action.

## Integration Test Requirements
Cross-screen integration tests must verify:
- Global filter changes propagate to all open dashboard data hooks.
- Provider filter updates `% Codex`/`% Claude` and run explorer rows together.
- Team filter changes update cost, reliability, and governance breakdowns consistently.
- Clicking an anomaly from overview opens matching run detail.
- Runs explorer row click opens `runs/[runId]` with correct payload.

## End-to-End (Web) Scenarios
Playwright tests must include:
1. Overview smoke: KPI cards render, filter change updates trend values.
2. Usage to Runs flow: click breakdown entity and verify runs explorer is filtered.
3. Cost flow: verify total cost and breakdown table alignment for selected period.
4. Governance flow: verify policy violation chart and recent policy changes load.
5. Run detail flow: open run detail and verify timeline, artifacts, and policy context.

## Acceptance Tests (Business Outcomes)
1. Enterprise admin can identify `% Codex` vs `% Claude` for last 30 days in under 10 seconds.
2. Enterprise admin can identify total spend, average cost per run, and highest-cost run from dashboard UI.
3. Engineering manager can compare team-level run success and PR merge rates.
4. FinOps stakeholder can inspect cost by team, project, and provider.
5. Security stakeholder can identify top policy violations and blocked network attempts.
6. User can drill down from overview anomaly to run detail without losing active filters.

## Cross-Platform Verification
Must verify at least once on:
- Web viewport `1440x900`.
- iPhone-sized mobile viewport (or simulator equivalent).
- Android-sized mobile viewport (or simulator equivalent).

Validation points:
- Navigation is usable.
- KPI cards remain readable.
- Charts remain legible.
- Tables degrade to list patterns on narrow screens.
- Touch targets meet minimum size.

## Quality Gates
- `npm test` or equivalent test command passes.
- Playwright suite passes.
- No skipped tests for critical metric logic.
- Coverage thresholds:
  - Metrics utilities: `>=95%` line coverage.
  - Services/hooks: `>=90%` line coverage.
  - UI/components in dashboard scope: `>=80%` line coverage.
- No undocumented `any` types in source or tests.
- TypeScript compile passes with strict mode.

## Regression Checklist for Every PR
- Metric formulas unchanged or intentionally updated with test updates.
- Shared contracts updated in one module only.
- Stub API and UI compile against the same types.
- Filters still synchronize across all screens.
- Run detail still reachable from overview and runs explorer.
