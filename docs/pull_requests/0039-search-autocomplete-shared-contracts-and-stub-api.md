# 0039 — Search Autocomplete Shared Contracts & Stub API

> Add strict shared TypeScript contracts and stubbed API/service methods for grouped search autocomplete across Agents, Projects, Teams, Humans (Seats), and Runs.

---

## User Story

As a dashboard user, when I type into search I want relevant suggestions grouped by entity type so I can jump directly to the thing I need.

## Prior State

- Global search query is stored as a plain string in Redux.
- No typed autocomplete contract exists in shared analytics types.
- No API/service method exists to fetch grouped search suggestions.
- Search typing is coupled to active-screen filtering behavior.

## Target State

Create one source of truth for search suggestion contracts and expose a stubbed autocomplete method through existing abstractions:

- `IAnalyticsApi` interface
- `IAnalyticsService` interface
- `AnalyticsService` implementation
- `StubAnalyticsApi` fake backend

Autocomplete query handling becomes isolated from screen filtering:

- Typing only requests and renders suggestions.
- Active screen tables/charts are not filtered by raw search text.
- Filtering/navigation happens only after suggestion selection in later PRs.

## Files to Update

### `src/features/analytics/types/contracts.ts`

Add shared contracts:

- `SearchEntityType = "agent" | "project" | "team" | "human" | "run"`
- `SearchSuggestion`
- `SearchSuggestionGroup`
- `SearchSuggestionsRequest`
- `SearchSuggestionsResponse`

### `src/features/analytics/api/IAnalyticsApi.ts`

- Add `getSearchSuggestions(request: SearchSuggestionsRequest): Promise<SearchSuggestionsResponse>`

### `src/features/analytics/services/IAnalyticsService.ts`

- Add `getSearchSuggestions(request: SearchSuggestionsRequest): Promise<SearchSuggestionsResponse>`

### `src/features/analytics/services/AnalyticsService.ts`

- Pass-through implementation from service to API interface.

### `src/features/analytics/api/stub/StubAnalyticsApi.ts`

- Implement grouped stubbed autocomplete with realistic ranking, limits, and artificial latency.

### `src/features/analytics/api/stub/builders.ts` (if needed)

- Add helper builders for suggestion items from seed entities.

## Acceptance Criteria

- Shared search autocomplete contracts are defined once and imported by API, service, and UI layers.
- Stub API returns grouped suggestions for all 5 entities: Agents, Projects, Teams, Humans (Seats), Runs.
- Response shape is fully typed and no `any` is introduced.
- Existing analytics API/service behavior remains unchanged.
- Querying suggestions does not mutate active-screen filter state.

## Test Plan

1. Add contract-level type usage checks via existing TypeScript compile.
2. Add `StubAnalyticsApi` tests for:
   - Group presence and ordering
   - Query matching behavior
   - Group limits and empty query behavior
3. Add `AnalyticsService` tests confirming delegation to `getSearchSuggestions`.

## Depends On

- **PR 0003** — shared TypeScript contracts
- **PR 0005** — API interface + stub pattern
- **PR 0006** — service layer pattern
