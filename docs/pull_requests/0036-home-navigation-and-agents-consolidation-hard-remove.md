# 0036 — Home Navigation + Agents Consolidation (Hard Remove)

> Rename Dashboard to Home, make Home the `/` endpoint, remove `/dashboard`, and hard-consolidate Projects/Runs into a single expanded Agents experience.

---

## User Story

As a platform user, I want a simpler navigation model with Home and one unified Agents screen so I can find operational data without switching between Projects and Runs pages.

## Prior State

- Root route redirects to `/dashboard`.
- Separate screens/routes exist for:
  - Dashboard
  - Projects
  - Agents
  - Runs Explorer + Run Detail
- Sidebar and bottom tabs include `Dashboard`, `Projects`, `Runs`, and `More`.
- API/service contracts still expose `getProjects`, `getRunsPage`, `getRunDetail`.

## Target State

- `/` is the Home endpoint and main overview screen.
- `/dashboard` route is removed.
- Navigation labels and entries become:
  - Home
  - Agents
  - Costs
  - Governance
  - Settings
- Projects and Runs routes are deleted.
- Run detail route is deleted.
- Former Projects and Runs content/data are migrated into the Agents screen.

## Files to Update

### Routing and entrypoints

- `src/app/index.tsx`
  - Remove redirect behavior.
  - Render Home directly at `/`.
- `src/app/(dashboard)/dashboard.tsx`
  - Remove legacy dashboard route file after Home migration.

### Navigation UI

- `src/components/shell/Sidebar.tsx`
  - Rename `Dashboard` -> `Home`.
  - Remove `Projects` and `Runs` entries.
  - Keep `Agents`, `Costs`, `Governance`, `Settings`.
- `src/components/shell/BottomTabs.tsx`
  - Rename `Dashboard` -> `Home`.
  - Remove `Projects`, `Runs`, and `More`.
  - Ensure five-tab model matches new IA.

### Screen consolidation

- Delete:
  - `src/app/(dashboard)/projects.tsx`
  - `src/app/(dashboard)/runs/index.tsx`
  - `src/app/(dashboard)/runs/[runId].tsx`
  - `src/app/(dashboard)/runs/__tests__/runDetailScreen.test.tsx`
- Expand:
  - `src/app/(dashboard)/agents.tsx`
    - Add relocated project breakdown section.
    - Add relocated recent runs section (embedded table/list) as part of Agents hub.

### Hooks/API/services/contracts

- Add consolidated contract:
  - `AgentsHubResponse` in `src/features/analytics/types/contracts.ts`
- Add consolidated API surface:
  - `getAgentsHub(filters)` in:
    - `src/features/analytics/api/IAnalyticsApi.ts`
    - `src/features/analytics/services/IAnalyticsService.ts`
    - `src/features/analytics/services/AnalyticsService.ts`
    - `src/features/analytics/api/stub/StubAnalyticsApi.ts`
- Remove obsolete Projects/Runs contracts and methods:
  - `ProjectsResponse`
  - `RunsPageRequest`, `RunsPageResponse`
  - `RunDetailResponse` and run-detail-only supporting types
  - `getProjects`, `getRunsPage`, `getRunDetail`
- Remove obsolete hooks and tests:
  - `src/features/analytics/hooks/useProjectsDashboard.ts`
  - `src/features/analytics/hooks/useRunsExplorer.ts`
  - `src/features/analytics/hooks/useRunDetail.ts`
  - Matching `__tests__` files

### Mapper and test cleanup

- Remove run-detail-only mapper:
  - `src/features/analytics/mappers/runDetailMappers.ts`
- Update integration tests that rely on deleted Runs flows:
  - `src/__tests__/integration/drillDown.test.ts`

### E2E suite updates

- Update navigation tests to Home + Agents flow.
- Remove Projects/Runs/Run Detail flow specs or replace with Agents-hub scenarios.

## Public API / Type Changes

Added:

- `AgentsHubResponse`
- `getAgentsHub(filters)`

Removed:

- `ProjectsResponse`
- `RunsPageRequest`
- `RunsPageResponse`
- `RunDetailResponse` and run-detail-only types
- `getProjects(filters)`
- `getRunsPage(request)`
- `getRunDetail(orgId, runId)`

## Acceptance Criteria

- `/` renders Home; `/dashboard` endpoint is removed.
- Sidebar and bottom tabs show only: Home, Agents, Costs, Governance, Settings.
- Projects/Runs screens and run detail route no longer exist.
- Agents screen includes relocated Projects and Runs data/content.
- API/service/contracts no longer expose removed Projects/Runs/Run Detail surface.
- No UI links navigate to deleted routes.

## Test Plan

1. Remove obsolete unit/integration tests for deleted hooks/routes.
2. Add tests for consolidated Agents hub hook and screen sections.
3. Add/adjust shell nav tests for new labels/routes and removed entries.
4. Update e2e tests to new IA and remove obsolete run-detail/project flows.
5. Validate end-to-end with:
   - `npm run typecheck`
   - `npm run test`
   - `npm run test:e2e`

## Depends On

- **PR 0012** — shell/navigation foundations
- **PR 0013** — overview baseline (to migrate as Home)
- **PR 0014** — projects baseline (to merge/remove)
- **PR 0015** — agents baseline (to expand)
- **PR 0016** — runs baseline (to merge/remove)
- **PR 0003/0005/0006** — shared contracts + API + service architecture
