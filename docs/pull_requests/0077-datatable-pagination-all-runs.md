# 0077 — DataTable Pagination Toggle + Agents All Runs

> Add opt-in DataTable pagination (25 rows/page) and apply it to the Agents runs table, while renaming that section from "Recent Runs" to "All Runs".

---

## User Stories

1. As an analytics user, I want long run tables to paginate after 25 rows so I can scan data without an overly long section.
2. As a product user, I want the Agents runs section to be labeled "All Runs" so the section name matches the table scope.
3. As an engineer, I want pagination to be a simple boolean DataTable prop so pagination can be enabled table-by-table without extra complexity.

## Prior State

- `DataTable` did not support pagination.
- The Agents runs section was titled "Recent Runs".
- Long tables always rendered all rows at once.

## Target State

1. `DataTable` supports optional pagination:
- Add a simple boolean prop (`paginate`) with default `false`.
- When enabled and row count exceeds 25, render rows page-by-page.
- Render pagination controls below the table.

2. Agents runs table behavior:
- Keep existing run rows and sorting behavior.
- Enable pagination for the runs table only.
- Rename section copy to "All Runs" (with total count subtitle semantics).

3. Non-goal / guardrail:
- Other tables remain unpaginated by default.
- No API contract changes and no backend behavior changes.

## Files Created

- `docs/pull_requests/0077-datatable-pagination-all-runs.md`

## Files Updated

- `docs/pull_requests/0000-task-manager.md`
- `src/components/tables/DataTable.tsx`
- `src/components/tables/__tests__/DataTable.test.tsx`
- `src/app/(dashboard)/agents/index.tsx`
- `src/i18n/locales/en.json`

## Acceptance Criteria

- `DataTable` exposes a boolean pagination prop that defaults to disabled.
- When pagination is enabled and data length is over 25, only 25 rows are shown per page and pagination controls are visible.
- When pagination is disabled, all rows render and no pagination controls appear.
- Agents runs section is labeled "All Runs".
- Agents runs table paginates at 25 rows/page.
- Other existing DataTable usages continue rendering without pagination unless explicitly enabled.
- TypeScript remains strict with no new `any`.

## Test Plan (Write + Run)

1. Update table component tests:
- Extend `src/components/tables/__tests__/DataTable.test.tsx` with:
  - pagination disabled by default (no controls, all rows visible)
  - pagination enabled behavior (page 1/2 slices and navigation)

2. Verify screen wiring:
- Ensure Agents screen passes `paginate` only to the runs table.
- Verify section copy uses "All Runs" semantics.

3. Run focused validation:
- `npx jest src/components/tables/__tests__/DataTable.test.tsx`
- `npx jest 'src/app/(dashboard)/__tests__/agentsScreen.test.tsx'`
- `npx tsc --noEmit`

## Depends On

- **PR 0011** — Table & List Components
- **PR 0016** — Runs Explorer & Run Detail Screens
- **PR 0061** — DataTable Entity Links Navigation
