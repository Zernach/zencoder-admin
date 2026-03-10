# 0061 — DataTable Entity Links: Human/Team/Project/Run Navigation + Unified Link Style

> Audit every `DataTable` in the app and make supported entity labels pressable with consistent link styling and correct entity-route navigation.

---

## User Stories

1. As a dashboard user, I want human, team, project, and run labels in tables to be pressable so I can drill into entity detail screens quickly.
2. As a user navigating from different tabs, I want table links to keep me in the current tab stack so navigation feels consistent with search and sidebar behavior.
3. As a product/design stakeholder, I want all pressable table links to use the same primary orange + underlined style so linked text is consistently recognizable.
4. As an engineer, I want shared TypeScript contracts to include all required IDs for linkable names so navigation stays type-safe across frontend and stubbed backend data.

## Prior State

- `DataTable` supports custom cell rendering, but relevant entity-name cells are currently rendered as plain text (non-pressable).
- One table cell (`Run ID` in Agents Recent Runs) uses brand color but is still not pressable and is not underlined.
- Not all name rows include the needed ID fields in shared contracts:
  - `AgentBreakdownRow` has `projectName` but no `projectId`.
  - `ProjectBreakdownRow` has `teamName` but no `teamId`.
  - `SeatUserUsageRow` has `teamName` but no `teamId`.

## Target State

All `DataTable` usages are audited and link behavior is applied for supported entities only.

1. Unified link visual style:
- Add a shared table link text style using the primary orange token and underline.
- Apply the same style to every newly pressable table label (human, team, project, run).

2. Entity navigation from table cells:
- Pressing a supported label navigates to the correct entity route with the matching ID.
- Navigation should resolve against the active tab context (same tab stack behavior used by search entity routing).

3. Table-by-table behavior:
- `src/app/(dashboard)/agents/index.tsx`
  - `Agent Performance`: `projectName` is pressable to `/[tab]/project/[projectId]`.
  - `Project Breakdown`: `projectName` is pressable to `/[tab]/project/[projectId]`.
  - `Project Breakdown`: `teamName` is pressable to `/[tab]/team/[teamId]`.
  - `Recent Runs`: run label (`id`) is pressable to `/[tab]/run/[runId]`.
- `src/app/(dashboard)/governance/index.tsx`
  - `Seat User Oversight`: `fullName` is pressable to `/[tab]/human/[humanId]` via `userId`.
  - `Seat User Oversight`: `teamName` is pressable to `/[tab]/team/[teamId]`.
  - `Policy Changes`: `actorName` is pressable to `/[tab]/human/[actorUserId]`.

4. Shared type + stub alignment for missing IDs:
- Extend shared contracts to carry IDs needed by linkable labels.
- Update stub builders/response assembly so frontend and stub use the same contract without duplicate type definitions.

## Files to Create / Update

### `src/features/analytics/types/contracts.ts`

- Add required ID fields for linkable text rows:
  - `AgentBreakdownRow.projectId`
  - `ProjectBreakdownRow.teamId`
  - `SeatUserUsageRow.teamId`

### `src/features/analytics/api/stub/builders.ts`

- Populate `projectId` in `buildAgentBreakdown`.
- Populate `teamId` in `buildProjectBreakdown`.

### `src/features/analytics/api/stub/StubAnalyticsApi.ts`

- Populate `teamId` in `seatUserUsage` row mapping (including created-user fallback rows).

### `src/components/tables/cellStyles.ts`

- Add/export shared link text style (primary orange + underline) for consistent usage in table cell renderers.

### `src/app/(dashboard)/agents/index.tsx`

- Replace plain text entity cells with pressable link renderers for project/team/run targets.
- Wire link presses to entity routes using shared route builder utilities.

### `src/app/(dashboard)/governance/index.tsx`

- Replace plain text entity cells with pressable link renderers for human/team targets.
- Wire link presses to entity routes using shared route builder utilities.

### `src/app/(dashboard)/__tests__/agentsScreen.test.tsx`

- Add/extend tests for pressable entity cells and navigation route correctness in Agents tables.

### `src/app/(dashboard)/__tests__/governanceScreen.test.tsx`

- Add/extend tests for pressable entity cells and navigation route correctness in Governance tables.

### `src/features/analytics/api/stub/__tests__/StubAnalyticsApi.test.ts` (and related service tests if needed)

- Add assertions for new ID fields in response rows used by linked table cells.

## Acceptance Criteria

- Every `DataTable` usage in the app has been audited and link behavior is applied only to supported entity label types (human/team/project/run).
- Pressing a linked human name navigates to the human route with the correct `humanId`.
- Pressing a linked team name navigates to the team route with the correct `teamId`.
- Pressing a linked project name navigates to the project route with the correct `projectId`.
- Pressing a linked run label navigates to the run route with the correct `runId`.
- All linked table labels share one consistent style: primary orange + underlined text.
- Shared contracts are the single source of truth for linkable row shapes, and stub responses compile against those updated contracts.
- Existing non-target table behavior (sorting, loading, empty states, non-link columns) remains unchanged.
- TypeScript build passes with no `any` introduced for this change.

## Test Plan (Write + Run)

1. Contract + stub data coverage:
- Add/extend stub tests to verify:
  - `agentBreakdown[*].projectId` is present and valid.
  - `projectBreakdown[*].teamId` is present and valid.
  - `seatUserUsage[*].teamId` is present and valid.

2. Agents screen behavior tests:
- Render Agents screen with fixture data containing project/team/run IDs.
- Assert project/team/run labels are pressable.
- Simulate presses and assert generated routes use correct entity + ID.
- Assert linked text uses shared style semantics (orange + underline).

3. Governance screen behavior tests:
- Render Governance screen with fixture data containing human/team IDs.
- Assert `fullName`, `teamName`, and `actorName` are pressable where applicable.
- Simulate presses and assert generated routes use correct entity + ID.
- Assert linked text uses the same shared style semantics.

4. Regression checks:
- Existing non-link tables/columns still render.
- Existing table sort/empty/loading behavior unaffected.

5. Run focused validation:
- `npx jest 'src/app/(dashboard)/__tests__/agentsScreen.test.tsx'`
- `npx jest 'src/app/(dashboard)/__tests__/governanceScreen.test.tsx'`
- `npx jest 'src/features/analytics/api/stub/__tests__/StubAnalyticsApi.test.ts'`
- `npx tsc --noEmit`

## Depends On

- **PR 0011** — Table & List Components
- **PR 0039** — Search Autocomplete Shared Contracts & Stub API
- **PR 0041** — Stack-Aware Search Routing & Entity Route Contracts
- **PR 0043** — Entity Screens in Every Tab Stack (Route Wrappers + Shared Views)

