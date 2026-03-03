# 0030 — Governance Seat User Oversight

> Extend `/(dashboard)/governance` so admins can see the full names of account seat users actively using AI and quickly identify the most- and least-active users.

---

## Prior State

The Governance & Compliance screen showed policy, security, and compliance data, but did not include a seat-user list with full names or a direct most/least AI usage view.

## Target State

Governance now includes a dedicated seat oversight section with:

- Full-name list of active seat users
- Team, run volume, token volume, and cost per user
- Explicit "Most AI usage" and "Least AI usage" callouts

Data is sourced from the shared typed contract through `getGovernance(filters)` in the stub API path.

---

## Files Updated

- `src/features/analytics/types/contracts.ts`
  - Added shared `SeatUserUsageRow` contract
  - Extended `GovernanceResponse` with `seatUserUsage`
- `src/features/analytics/api/stub/StubAnalyticsApi.ts`
  - Added per-user seat usage aggregation in `getGovernance`
  - Returns full name, team name, runs, tokens, and cost sorted by usage
- `src/app/(dashboard)/governance.tsx`
  - Added "Seat User Oversight" section
  - Added explicit most/least AI usage summary lines
  - Added seat usage data table with full names and usage metrics
- `src/features/analytics/api/stub/__tests__/StubAnalyticsApi.test.ts`
  - Added governance seat-usage contract and sorting assertions
- `src/features/analytics/services/__tests__/AnalyticsService.test.ts`
  - Added service-level assertion for returned seat usage with full names
- `src/features/analytics/hooks/__tests__/useGovernanceDashboard.test.ts`
  - Added hook-shape assertion for `seatUserUsage`

---

## Done When

- Governance shows a full-name list of users actively consuming account seats
- Admin can immediately identify who uses the most AI and least AI
- Seat oversight data is part of shared TypeScript contracts and returned by stubbed governance API
- Type-check and governance-related tests pass
