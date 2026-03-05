# 0044 — Search Autocomplete + Entity Navigation Test Coverage

> Add full confidence coverage for grouped autocomplete, stack-aware navigation, and entity route rendering across web/mobile breakpoints.

---

## User Story

As a product team, we need confidence that search discovery and navigation work reliably before expanding search-driven workflows.

## Prior State

- Existing tests cover top bar and screen shells, but not grouped autocomplete or the new entity route matrix.
- No dedicated e2e coverage for cross-tab search to entity navigation.

## Target State

Add layered tests:

- Unit: contracts, route builders, hooks
- Integration: TopBar + autocomplete + router behavior
- E2E: user flows across all tabs and entity types
- Regression: typing-only behavior does not filter active screen data

## Files to Create / Update

### Unit & integration tests

- `src/features/analytics/api/stub/__tests__/StubAnalyticsApi.search.test.ts`
- `src/features/search/navigation/__tests__/searchRoutes.test.ts`
- `src/features/search/hooks/__tests__/useSearchAutocomplete.test.ts`
- `src/components/search/__tests__/SearchAutocompletePanel.test.tsx`
- `src/components/shell/__tests__/TopBar.searchAutocomplete.test.tsx`
- `src/__tests__/integration/searchEntityNavigation.test.tsx`

### Route/screen smoke tests

- `src/app/(dashboard)/__tests__/entityRouteWrappers.test.tsx`
- `src/features/search/screens/__tests__/entityScreens.test.tsx`

### E2E specs

- `e2e/tests/search-autocomplete-navigation.spec.ts`
- Update existing smoke specs to include quick search assertion on each tab.

## Acceptance Criteria

- Test suite validates grouped suggestions appear for all five groups.
- Route builder matrix (`5 tabs x 5 entities`) is covered and deterministic.
- Typing in search without selecting a suggestion does not filter active-screen tables/charts.
- Selecting a suggestion navigates to correct stack-local route.
- Entity screen loads with correct params and handles loading/error states.
- CI quality gates remain green:
  - `npm run typecheck`
  - `npm run test`
  - `npm run test:e2e`

## Test Execution Plan

1. Implement/refresh unit tests first for contracts and routing.
2. Add integration tests for UI behavior and router interactions.
3. Add e2e flows for:
   - Home tab search -> each entity type
   - At least one additional non-home tab per entity type
4. Add regression tests for:
   - Escape/close behavior
   - Empty result sets
   - No active-screen filtering/refetch while typing before suggestion selection
   - No broken back navigation

## Depends On

- **PR 0039** through **PR 0043**
- Existing test harness from **PR 0020**, **PR 0021**, **PR 0022**, **PR 0023**
