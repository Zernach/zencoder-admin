# 0042 — Entity Detail Services, Hooks & Shared Screen Models

> Add typed stub-backed detail contracts and hooks for `agent`, `project`, `team`, `human`, and `run` screens that search navigation will open.

---

## User Story

As a user opening a search result, I want each entity page to load useful, typed detail data with consistent loading/error behavior.

## Prior State

- No dedicated detail contracts/hooks for search entity pages.
- Existing analytics data is screen-specific and not modeled for entity detail views.

## Target State

Introduce shared detail contracts and service methods, backed by stubbed APIs, plus hook/view-model abstractions for each entity screen type.

## Files to Update

### `src/features/analytics/types/contracts.ts`

Add detail contracts:

- `AgentDetailResponse`
- `ProjectDetailResponse`
- `TeamDetailResponse`
- `HumanDetailResponse`
- `RunDetailResponse` (search version aligned with current run domain model)

### `src/features/analytics/api/IAnalyticsApi.ts`

Add:

- `getAgentDetail(orgId: string, agentId: string): Promise<AgentDetailResponse>`
- `getProjectDetail(orgId: string, projectId: string): Promise<ProjectDetailResponse>`
- `getTeamDetail(orgId: string, teamId: string): Promise<TeamDetailResponse>`
- `getHumanDetail(orgId: string, humanId: string): Promise<HumanDetailResponse>`
- `getRunDetail(orgId: string, runId: string): Promise<RunDetailResponse>`

### `src/features/analytics/services/IAnalyticsService.ts`

- Add matching methods for all detail endpoints.

### `src/features/analytics/services/AnalyticsService.ts`

- Implement typed pass-through methods.

### `src/features/analytics/api/stub/StubAnalyticsApi.ts`

- Implement all detail methods using deterministic seed data and realistic derived metrics.

### `src/features/search/hooks/` (new)

- `useAgentDetailScreen.ts`
- `useProjectDetailScreen.ts`
- `useTeamDetailScreen.ts`
- `useHumanDetailScreen.ts`
- `useRunDetailScreen.ts`

Each returns a normalized state shape:

- `{ data, loading, error, refetch }`

## Acceptance Criteria

- Every entity detail endpoint exists in shared contracts, API interface, service interface, and stub implementation.
- Hooks for all five entities return consistent state shape and consume service abstractions only.
- Stub data is realistic and references existing seed entities/runs.
- TypeScript catches mismatches between frontend expectations and stub responses.

## Test Plan

1. API stub tests for each new detail endpoint.
2. Service tests verifying delegation and response typing.
3. Hook tests for loading, success, error, and refetch behavior.
4. Typecheck gate to validate shared contract usage.

## Depends On

- **PR 0003** — shared type contracts
- **PR 0005 / 0006** — API + service architecture
- **PR 0041** — routing destinations for entity pages
