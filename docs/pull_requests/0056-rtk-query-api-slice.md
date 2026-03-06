# PR 0056 — RTK Query API Slice

## Goal
Create a comprehensive RTK Query API slice that defines all query and mutation endpoints, backed by a service registry pattern that preserves the existing DI architecture.

## Changes

### 1. Service Registry
- Create `src/store/api/serviceRegistry.ts` with module-level `IAnalyticsService` ref
- `initializeService(service)` called during app startup
- `getService()` used by RTK Query endpoints

### 2. RTK Query API Definition
- Create `src/store/api/analyticsApi.ts` using `createApi` + `fakeBaseQuery()`
- Define tag types for cache invalidation

#### Query Endpoints
- `getOverview(filters)` -> OverviewResponse
- `getUsage(filters)` -> UsageResponse
- `getOutcomes(filters)` -> OutcomesResponse
- `getCost(filters)` -> CostResponse
- `getReliability(filters)` -> ReliabilityResponse
- `getGovernance(filters)` -> GovernanceResponse
- `getAgentsHub(filters)` -> AgentsHubResponse
- `getLiveAgentSessions(filters)` -> LiveAgentSessionsResponse
- `getSearchSuggestions(request)` -> SearchSuggestionsResponse
- `getAgentDetail({ orgId, agentId })` -> AgentDetailResponse
- `getProjectDetail({ orgId, projectId })` -> ProjectDetailResponse
- `getTeamDetail({ orgId, teamId })` -> TeamDetailResponse
- `getHumanDetail({ orgId, humanId })` -> HumanDetailResponse
- `getRunDetail({ orgId, runId })` -> RunDetailResponse

#### Mutation Endpoints
- `createComplianceRule(request)` -> CreateComplianceRuleResponse
- `createSeat(request)` -> CreateSeatResponse
- `createProject(request)` -> CreateProjectResponse
- `createTeam(request)` -> CreateTeamResponse

### 3. Store Integration
- Add `analyticsApi.reducer` to store
- Add `analyticsApi.middleware` to middleware chain
- Export auto-generated typed hooks

### 4. Provider Integration
- Initialize service registry in `AppDependenciesProvider`

## Files Changed
- Create: `src/store/api/serviceRegistry.ts`
- Create: `src/store/api/analyticsApi.ts`
- Create: `src/store/api/index.ts`
- Modify: `src/store/store.ts`
- Modify: `src/store/index.ts`
- Modify: `src/core/di/AppDependencies.tsx`
