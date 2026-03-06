# PR 0057 — Migrate All Data Hooks to RTK Query

## Goal
Replace all React Query-based data hooks with RTK Query generated hooks, making Redux the single source of truth for all server state.

## Changes

### 1. Migrate Dashboard Hooks
- `useCostDashboard` -> wraps `useGetCostQuery`
- `useGovernanceDashboard` -> wraps `useGetGovernanceQuery`
- `useAgentsHub` -> wraps `useGetAgentsHubQuery`
- `useLiveAgentSessions` -> wraps `useGetLiveAgentSessionsQuery` with polling options
- `useOverviewDashboard` -> wraps 3 RTK Query hooks (overview, usage, outcomes)

### 2. Migrate Entity Detail Hooks
- `useAgentDetailScreen` -> wraps `useGetAgentDetailQuery`
- `useProjectDetailScreen` -> wraps `useGetProjectDetailQuery`
- `useTeamDetailScreen` -> wraps `useGetTeamDetailQuery`
- `useHumanDetailScreen` -> wraps `useGetHumanDetailQuery`
- `useRunDetailScreen` -> wraps `useGetRunDetailQuery`

### 3. Migrate Mutation Hooks
- `useCreateProject` -> wraps `useCreateProjectMutation`
- `useCreateTeam` -> wraps `useCreateTeamMutation`
- `useCreateHuman` -> wraps `useCreateSeatMutation`
- `useCreateComplianceViolationRule` -> wraps `useCreateComplianceRuleMutation`

### 4. Migrate Search Hook
- `useSearchAutocomplete` -> wraps `useGetSearchSuggestionsQuery` with skip logic

### 5. Remove Old Infrastructure
- Delete `useDashboardQuery.ts`
- Delete `useQueryKeyFactory.ts`

## Files Changed
- Modify: all hooks in `src/features/analytics/hooks/`
- Modify: `src/features/search/hooks/useEntityDetail.ts`
- Delete: `src/features/analytics/hooks/useDashboardQuery.ts`
- Delete: `src/features/analytics/hooks/useQueryKeyFactory.ts`
