# 0035 — Sticky Top Search + Filter Bar Across All Screens

> Render the search/filter controls at the top of every dashboard route and keep them visible while content scrolls.

---

## User Story

As a dashboard user, I want the search/filter bar fixed at the top so controls remain available at all times during scrolling.

## Prior State

- `TopBar` (search + time preset) is fixed above scroll content.
- `FilterBar` is rendered inside each screen content tree and scrolls away.
- Multiple screens manually render `<FilterBar />`, creating duplication.

## Target State

`ScreenWrapper` owns a shared sticky controls area:

- Top row: `TopBar`
- Second row: `FilterBar`

This controls block remains outside the scroll viewport so it does not move with content on any dashboard route.

## Files to Update

### `src/components/screen/ScreenWrapper.tsx`

- Add fixed controls container above `ContentViewport`.
- Move shared `FilterBar` rendering into wrapper.
- Extend `ScreenWrapperProps` if needed (for example `showFilterBar?: boolean` for route-specific control).

### `src/components/screen/ScreenHeader.tsx` (if spacing/layout adjustments needed)

- Keep header layout compatible with sticky controls stack.

### Dashboard screens (remove in-scroll `FilterBar`)

- `src/app/(dashboard)/dashboard.tsx`
- `src/app/(dashboard)/agents.tsx`
- `src/app/(dashboard)/costs.tsx`
- `src/app/(dashboard)/governance.tsx`

Optional: apply to Settings route as well if `showFilterBar` remains enabled globally.

### `src/components/screen/__tests__/ScreenWrapper.test.tsx` (new)

- Assert `FilterBar` is outside scrollable content.
- Assert a single filter bar instance is rendered.

### `src/__tests__/integration/filterBarSticky.test.tsx` (new)

- Verify filter state interactions still work from sticky location.

### E2E updates

- Update at least:
  - `e2e/tests/01-overview-smoke.spec.ts`
  - `e2e/tests/04-governance-flow.spec.ts`
- Add assertions that filter controls remain visible during page scroll.

## Acceptance Criteria

- Search/filter controls are visible at top on all dashboard routes.
- Controls do not move when user scrolls main content.
- Exactly one filter bar is rendered per route.
- Existing filter interactions still update shared Redux filter state and trigger refetch.
- TopBar typing behavior is isolated from active-screen filtering; filtering by search text does not happen until explicit suggestion selection in the search PR sequence.

## Test Plan

1. ScreenWrapper structural unit test for non-scroll placement.
2. Integration test for sticky placement + interactive filter behavior.
3. E2E assertions for persistent visibility on Home and Governance while scrolling.

## Depends On

- **PR 0008** — global filter state
- **PR 0012** — shell/top bar/content viewport
- **PR 0026** — FilterBar adoption across screens
