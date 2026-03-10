# 0062 — Governance Team Performance Table + Create Team Relocation

> Relocate the `Create Team` entry point from Settings to Governance and add a typed team-performance comparison table on Governance.

---

## User Stories

1. As an admin, I want to create teams from the Governance screen so team setup and governance actions live in one place.
2. As a governance user, I want a table that compares team performance metrics so I can contrast team outcomes at a glance.
3. As an engineer, I want governance response types shared between the frontend and stub API so UI and fake backend stay type-safe and aligned.
4. As a user creating a new team, I want that team to appear in Governance comparison data immediately so I can verify it was created.

## Prior State

- `+ Create Team` exists on Settings in the Organization section.
- Governance has no dedicated team comparison table.
- `GovernanceResponse` does not include a typed per-team comparison dataset.

## Target State

1. Move the `+ Create Team` button from Settings to Governance:
- Remove it from Settings.
- Add it to a Governance section header.
- Mount `CreateTeamModal` on Governance so create flow remains available there.

2. Add Governance team comparison table:
- New section: `Team Performance Comparison`.
- New table compares teams with metrics:
  - runs
  - success rate
  - policy violations
  - violation rate
  - cost

3. Extend shared contracts and stub data:
- Add `TeamPerformanceComparisonRow` to shared types.
- Add `teamPerformanceComparison` to `GovernanceResponse`.
- Stub `getGovernance` computes team rows from filtered runs + violations.
- Created teams are included with zero metrics so post-create visibility is immediate.

4. Keep architecture constraints intact:
- Screen remains composition-only.
- Data continues flowing through existing hook/service/interface chain.
- No inline duplicate type contracts.

## Files to Create / Update

### Docs

- `docs/pull_requests/0000-task-manager.md`
- `docs/pull_requests/0062-governance-team-performance-and-create-team-relocation.md`

### Shared Types + Data Layer

- `src/features/analytics/types/contracts.ts`
  - Add `TeamPerformanceComparisonRow`.
  - Extend `GovernanceResponse` with `teamPerformanceComparison`.
- `src/features/analytics/api/stub/StubAnalyticsApi.ts`
  - Build team comparison rows in `getGovernance`.
  - Include created teams in comparison output.
- `src/features/analytics/services/AnalyticsService.ts`
  - Normalize new governance row numeric fields.

### Screens + Navigation

- `src/app/(dashboard)/governance/index.tsx`
  - Add team comparison section + `DataTable`.
  - Add `+ Create Team` button that opens team modal.
  - Mount `CreateTeamModal`.
- `src/app/(dashboard)/settings/index.tsx`
  - Remove `+ Create Team` button and modal mount.
- `src/constants/navigation.ts`
  - Add Governance subsection entry for team performance.
- `src/constants/keyExtractors.ts`
  - Add `byTeamId` extractor for typed row keys.

### Tests

- `src/app/(dashboard)/__tests__/governanceScreen.test.tsx`
  - Add coverage for Governance create-team entry point and new response shape.
- `src/app/(dashboard)/__tests__/settingsScreen.test.tsx`
  - Assert Settings no longer renders `+ Create Team`.
- `src/features/analytics/hooks/__tests__/useGovernanceDashboard.test.ts`
  - Assert new governance table field is present.
- `src/features/analytics/api/stub/__tests__/StubAnalyticsApi.test.ts`
  - Validate new team comparison response rows.
- `src/features/analytics/api/stub/__tests__/StubAnalyticsApi.createEntities.test.ts`
  - Validate created teams show up in governance comparison.
- `src/constants/__tests__/navigation.test.ts`
- `src/__tests__/integration/sidebarSubsectionNavigation.test.tsx`
  - Update Governance subsection expectations.

## Acceptance Criteria

- `+ Create Team` is not rendered on Settings.
- `+ Create Team` is rendered on Governance and opens existing create-team flow.
- Governance renders a `Team Performance Comparison` table with typed rows.
- Governance API response includes `teamPerformanceComparison` from shared contracts.
- Stub governance computation includes created teams with zeroed metrics when no runs exist.
- Subsection contracts/tests reflect the new Governance section anchor.
- TypeScript strict checks pass with no `any` introduced.

## Test Plan (Write + Run)

1. Screen tests:
- Update Settings test to assert `+ Create Team` is absent.
- Update Governance test to assert `Team Performance Comparison` and `+ Create Team` are rendered.

2. Stub/API tests:
- Assert `teamPerformanceComparison` exists and row fields are typed.
- Assert newly created team appears in governance comparison with zeros.

3. Hook/contract tests:
- Assert governance hook data exposes `teamPerformanceComparison`.

4. Navigation subsection tests:
- Update strict Governance subsection arrays to include `team-performance`.

5. Run focused validation:
- `npx jest 'src/app/(dashboard)/__tests__/settingsScreen.test.tsx'`
- `npx jest 'src/app/(dashboard)/__tests__/governanceScreen.test.tsx'`
- `npx jest 'src/features/analytics/api/stub/__tests__/StubAnalyticsApi.test.ts'`
- `npx jest 'src/features/analytics/api/stub/__tests__/StubAnalyticsApi.createEntities.test.ts'`
- `npx jest 'src/features/analytics/hooks/__tests__/useGovernanceDashboard.test.ts'`
- `npx jest 'src/constants/__tests__/navigation.test.ts'`
- `npx jest 'src/__tests__/integration/sidebarSubsectionNavigation.test.tsx'`
- `npx tsc --noEmit`

## Depends On

- **PR 0045** — Create Entity Form Foundations
- **PR 0049** — Create Team Flow
- **PR 0052** / **PR 0053** — Governance sidebar subsection contracts
- **PR 0056** / **PR 0057** — RTK Query API slice and hook migration
