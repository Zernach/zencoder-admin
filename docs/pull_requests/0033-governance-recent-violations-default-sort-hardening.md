# 0033 — Governance Recent Violations Sort Hardening

> Add explicit regression hardening so Recent Violations always stays newest-first on mount and after refetch cycles.

---

## User Story

As a security operator, I need Recent Violations to remain sorted newest-first across refetches so triage never starts from stale entries.

## Prior State

Recent Violations is expected to be descending by time, but this behavior is vulnerable to drift if source ordering changes during loading/error/retry transitions.

## Target State

Recent Violations ordering is guarded at the governance hook/view level and re-applied after every successful fetch.

Sort contract:

- Primary key: `timestampIso` descending
- Tie-breaker: `id` ascending

## Files to Update

### `src/features/analytics/hooks/useGovernanceDashboard.ts`

- Add explicit post-fetch sort guard for `recentViolations`.
- Ensure ordering is re-applied after refetch and filter/time-range changes.

### `src/app/(dashboard)/governance.tsx`

- Render Recent Violations from hardened sorted source only.

### `src/features/analytics/hooks/__tests__/useGovernanceDashboard.test.ts`

- Add test case for ordering stability after:
  - Initial load
  - Refetch
  - Time-range/filter updates

### `src/app/(dashboard)/__tests__/governanceScreen.test.tsx` (new or update)

- Simulate refresh/re-render and assert top row remains newest.

## Acceptance Criteria

- Recent Violations is newest-first on mount.
- Recent Violations remains newest-first after refetch.
- Recent Violations remains newest-first after filter/time-range changes.
- No ascending fallback during loading/error/retry transitions.

## Test Plan

1. Hook-level integration test for ordering stability across state transitions.
2. Screen-level test simulating refetch and asserting first-row recency.
3. Optional contract regression test to ensure tie-break determinism remains intact.

## Depends On

- **PR 0032** — all-table default time sort behavior
- **PR 0018** — Governance screen baseline
- **PR 0008** — filter/time-range state propagation
