# 0048 — Create Project Flow

> Allow users to create a new project through a typed form workflow wired through service interfaces and stubbed API implementations.

---

## User Story

As an admin or manager, I want to create a new project so teams can be organized and future runs can be associated with that project.

## Prior State

- Projects are static from seed data only.
- No create-project contract or stub API endpoint.
- No reusable project create form.

## Target State

Introduce a create-project workflow:

- Form fields:
  - project name (required)
  - team assignment (required)
  - description (optional)
- Submit through typed service abstraction.
- Stub API creates project with deterministic ID and timestamp metadata.
- New project appears in:
  - projects-related tables/breakdowns
  - filter options
  - search suggestion groups (project group)

## Files to Create / Update

### Contracts + API/service

- `src/features/analytics/types/contracts.ts`
  - Add `CreateProjectRequest`, `CreateProjectResponse`.
- `src/features/analytics/api/IAnalyticsApi.ts`
  - Add `createProject(...)`.
- `src/features/analytics/services/IAnalyticsService.ts`
  - Add matching method.
- `src/features/analytics/services/AnalyticsService.ts`
  - Add implementation.
- `src/features/analytics/api/stub/StubAnalyticsApi.ts`
  - Add create-project logic and uniqueness validation.

### Hooks + UI

- `src/features/analytics/hooks/useCreateProject.ts`
- `src/features/analytics/components/CreateProjectForm.tsx`
- `src/app/(dashboard)/agents.tsx` and/or `src/app/(dashboard)/costs.tsx`
  - Add entry point and post-create refresh behavior.

## Acceptance Criteria

- User can create a project with required validation and clear error states.
- Duplicate project names within the same team are rejected with a clear message.
- Created projects become visible in typed dashboard data sources immediately.
- UI depends only on abstraction layers, not direct stub imports.

## Test Plan

1. Stub API tests:
   - success create path
   - duplicate validation path
2. Service tests:
   - contract and delegation assertions
3. Hook tests:
   - loading/success/error/refetch
4. Integration tests:
   - create project from UI and verify table/filter/search updates

## Depends On

- **PR 0045** — shared create form + hook/contracts foundation
- **PR 0014** / **PR 0029** — project-focused screen baselines
- **PR 0039** / **PR 0040** — grouped search experience

