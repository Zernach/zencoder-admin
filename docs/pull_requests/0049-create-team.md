# 0049 — Create Team Flow

> Allow users to create a new team through shared typed contracts, service abstractions, and stubbed API implementations.

---

## User Story

As an admin, I want to create new teams so I can structure users/projects and segment analytics by organization groups.

## Prior State

- Teams are fixed in seeded data.
- No create-team API/service contract exists.
- No UI create-team form.

## Target State

Implement a create-team flow using the standardized form stack:

- Form fields:
  - team name (required)
  - description (optional)
  - default environment tag (optional)
- Submit via `IAnalyticsService.createTeam`.
- Stub API stores new team and exposes it to all typed consumers.
- New team appears in:
  - team filters
  - team-based charts and tables
  - search suggestions (team group)

## Files to Create / Update

### Contracts + API/service

- `src/features/analytics/types/contracts.ts`
  - Add `CreateTeamRequest`, `CreateTeamResponse`.
- `src/features/analytics/api/IAnalyticsApi.ts`
  - Add `createTeam(...)`.
- `src/features/analytics/services/IAnalyticsService.ts`
  - Add matching method.
- `src/features/analytics/services/AnalyticsService.ts`
  - Add implementation.
- `src/features/analytics/api/stub/StubAnalyticsApi.ts`
  - Add create-team logic with deterministic ID generation.

### Hooks + UI

- `src/features/analytics/hooks/useCreateTeam.ts`
- `src/features/analytics/components/CreateTeamForm.tsx`
- `src/app/(dashboard)/settings.tsx` (or governance) for create entry point.

## Acceptance Criteria

- User can create a team with required validation and inline field errors.
- Duplicate team names are rejected with actionable feedback.
- Created teams are visible across filters and analytics breakdowns without app restart.
- Code remains strict TypeScript with shared contracts across frontend + stub API.

## Test Plan

1. Stub API tests:
   - create team success and deterministic ID
   - duplicate team validation
2. Service tests:
   - typed delegation coverage
3. Hook tests:
   - `data/loading/error/refetch` behavior
4. Integration tests:
   - create team from UI and verify downstream visibility in team filters

## Depends On

- **PR 0045** — shared create-form and contract foundation
- **PR 0008** — dashboard filter infrastructure
- **PR 0039** / **PR 0040** — search grouping and suggestion rendering

