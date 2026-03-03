# 0032 — Governance Default Time Sort for All Tables

> Ensure Governance tables mount in newest-first order by `timestampIso` for violations, security events, and policy changes.

---

## User Story

As a compliance analyst, I need Recent Violations, Security Events, and Policy Changes to open sorted by newest records first so I can triage current risk immediately.

## Prior State

Governance renders three time-based tables:

- Recent Violations
- Security Events
- Policy Changes

The stub currently returns descending slices, but mount-time ordering is not explicitly hardened in the screen data pipeline.

## Target State

All three Governance table datasets are explicitly sorted by time descending before render, with deterministic tie behavior.

Sort contract:

- Primary key: `timestampIso` descending
- Tie-breaker: `id` ascending (stable deterministic order)

## Files to Update

### `src/features/analytics/hooks/useGovernanceDashboard.ts`

- Normalize and sort table arrays by the defined sort contract before returning `data`.

### `src/app/(dashboard)/governance.tsx`

- Consume sorted arrays from hook output for all three tables.
- Keep table mount order deterministic regardless of source ordering.

### `src/features/analytics/api/stub/StubAnalyticsApi.ts`

- Keep/confirm descending timestamp order and deterministic tie handling in governance response payload.

### `src/features/analytics/hooks/__tests__/useGovernanceDashboard.test.ts`

- Add timestamp-order assertions for all three arrays.

### `src/features/analytics/api/stub/__tests__/StubAnalyticsApi.test.ts`

- Extend governance tests to assert descending order and tie determinism for:
  - `recentViolations`
  - `securityEvents`
  - `policyChanges`

### `src/app/(dashboard)/__tests__/governanceScreen.test.tsx` (new or update)

- Assert first row timestamp is newer than or equal to second row per table on initial render.

## Acceptance Criteria

- Recent Violations mounts newest-first.
- Security Events mounts newest-first.
- Policy Changes mounts newest-first.
- Ordering remains deterministic when two rows share identical timestamps.

## Test Plan

1. Hook tests for sorted arrays across all three datasets.
2. Stub contract tests for descending timestamps with deterministic ties.
3. Governance screen test asserting top-row recency for each table.

## Depends On

- **PR 0018** — Governance screen baseline
- **PR 0005** — stub analytics API
- **PR 0008** — filter-driven refetch behavior
