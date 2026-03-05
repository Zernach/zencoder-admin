# 0041 — Stack-Aware Search Routing & Entity Route Contracts

> Ensure autocomplete selection can navigate from any tab/stack to stack-local entity routes (`.../agent`, `.../project`, `.../team`, `.../human`, `.../run`).

---

## User Story

As a user, when I select a search suggestion from any tab, I want to stay in that tab context and open the matching entity screen path for that tab.

## Prior State

- Tabs are top-level routes only (`dashboard`, `agents`, `costs`, `governance`, `settings`).
- No shared route contract exists for search-driven entity navigation.
- No stack-aware route builder exists.

## Target State

Introduce a route contract + resolver that maps current tab context and selected entity type to the correct destination path.
Route changes are triggered only by explicit autocomplete selection, not by raw typing.

Example matrix (for each tab):

- `/(dashboard)/<tab>/agent/[agentId]`
- `/(dashboard)/<tab>/project/[projectId]`
- `/(dashboard)/<tab>/team/[teamId]`
- `/(dashboard)/<tab>/human/[humanId]`
- `/(dashboard)/<tab>/run/[runId]`

Where `<tab>` is one of: `dashboard`, `agents`, `costs`, `governance`, `settings`.

## Files to Update

### Route structure migration

- Convert tab screens to directory indexes to support nested routes:
  - `src/app/(dashboard)/dashboard.tsx` -> `src/app/(dashboard)/dashboard/index.tsx`
  - `src/app/(dashboard)/agents.tsx` -> `src/app/(dashboard)/agents/index.tsx`
  - `src/app/(dashboard)/costs.tsx` -> `src/app/(dashboard)/costs/index.tsx`
  - `src/app/(dashboard)/governance.tsx` -> `src/app/(dashboard)/governance/index.tsx`
  - `src/app/(dashboard)/settings.tsx` -> `src/app/(dashboard)/settings/index.tsx`

### `src/features/search/navigation/searchRoutes.ts` (new)

- Define:
  - `SearchTabContext`
  - `buildEntityRoute(tabContext, suggestion)`
  - `resolveTabContextFromPath(pathname)`

### `src/components/shell/TopBar.tsx`

- On autocomplete selection, call route builder and navigate with `router.push`.

### `src/features/search/navigation/__tests__/searchRoutes.test.ts` (new)

- Validate tab-context resolution and route output for all entity types.

## Acceptance Criteria

- Selecting an autocomplete item from any tab navigates to that tab’s entity route namespace.
- Typing in search alone does not change route and does not filter current screen data.
- Route builder supports all 5 entities and all 5 tabs.
- Back navigation returns users to the originating tab screen.
- No hardcoded string routes remain in TopBar selection handling.

## Test Plan

1. Unit tests covering full route matrix (`5 tabs x 5 entity types`).
2. TopBar integration test verifying current pathname influences destination route.
3. Regression test confirming typing without selection does not navigate.
4. Regression tests ensuring base tab routes still navigate correctly from sidebar/bottom tabs.

## Depends On

- **PR 0040** — selection callbacks from autocomplete UI
- **PR 0012** — shell + navigation framework
