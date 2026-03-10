# 0075 — Rule Detail Screen & Entity Routing

> Add a full Rule detail screen with inline editing, agent/project assignment management, and navigable rule links across the governance screen — including route wrappers in every tab stack.

---

## User Stories

1. As a compliance officer, I want to click on a rule title in the governance screen to see its full details (description, creation date, runs checked) so I can audit rule configuration.
2. As a platform admin, I want to edit a rule's title, description, and assigned agents/projects inline so I can update guardrails without leaving the dashboard.
3. As a team lead, I want to see recent violations and runs associated with a specific rule so I can assess its impact and enforcement coverage.
4. As a developer, I want rule links in the violations table to navigate to the rule detail screen so I can quickly understand why a violation was triggered.

## Prior State

- `SearchEntityType` did not include `"rule"` — rules were not navigable entities.
- The governance screen's violations table showed agent and reason but not which rule triggered the violation.
- `PolicyViolationRow` lacked `ruleId` and `ruleTitle` fields.
- No `RuleDetailResponse`, `UpdateRuleRequest`, or `UpdateRuleResponse` contracts existed.
- No rule detail API methods on `IAnalyticsApi` or `IAnalyticsService`.
- No RTK Query endpoints for rule detail or rule mutation.
- DataTable `align` prop only affected header text, not custom `render` content.

## Target State

### 1. Type Contracts (`src/features/analytics/types/contracts.ts`)

- `SearchEntityType` expanded: `"agent" | "project" | "team" | "human" | "run" | "rule"`.
- `PolicyViolationRow` gains `ruleId: string` and `ruleTitle: string` fields.
- New `RuleDetailResponse` interface: rule details, assigned agent/project IDs, all agents/projects for assignment, recent violations, and recent runs.
- New `UpdateRuleRequest` and `UpdateRuleResponse` contracts for inline editing.

### 2. API Layer

- `IAnalyticsApi` gains `getRuleDetail(orgId, ruleId)` and `updateRule(request)` methods.
- `IAnalyticsService` gains matching service methods.
- `AnalyticsService` implements both, delegating to the API layer.
- `StubAnalyticsApi` generates realistic rule detail data: looks up the rule, computes assigned agents/projects, filters violations by rule, and returns recent runs.
- `StubAnalyticsApi.updateRule()` mutates the in-memory rule and re-assigns agents/projects.

### 3. RTK Query Endpoints (`src/store/api/analyticsApi.ts`)

- `getRuleDetail` query with `"RuleDetail"` tag, keyed by `entityId`.
- `updateRule` mutation that invalidates `"RuleDetail"` and `"Governance"` tags.
- Exported hooks: `useGetRuleDetailQuery`, `useUpdateRuleMutation`.

### 4. Hook (`src/features/search/hooks/useEntityDetail.ts`)

- `useRuleDetailScreen(ruleId)` follows the same `DetailResult<T>` pattern as other entity hooks.

### 5. Rule Detail Screen (`src/features/search/screens/RuleDetailScreen.tsx`)

- **Rule Details section**: read-only fields (title, description, created, last edited, runs checked) with an Edit button that toggles to inline form inputs.
- **Assigned Agents section**: read-only shows linked agent chips; edit mode shows filterable checklist of all agents with selection toggles.
- **Assigned Projects section**: same pattern as agents with project chips and filterable checklist.
- **Save/Cancel bar**: appears in edit mode with save (calls `updateRule` mutation) and cancel actions.
- **Recent Violations table**: DataTable with time, agent link, reason, severity badge.
- **Recent Runs table**: DataTable with run ID link, status badge, created, provider, duration, cost.
- Uses `ScreenWrapper`, `SectionHeader`, `DataTable`, `CustomButton`, `CustomTextInput`, `StatusBadge`, `CustomSpinner`.
- Full i18n support via `useTranslation`.

### 6. Route Wrappers

- `src/components/routes/RuleDetailRoute.tsx`: extracts `ruleId` from URL params, renders `RuleDetailScreen`.
- `src/app/(dashboard)/*/rule/[ruleId].tsx`: route files in all 5 tab stacks (dashboard, agents, costs, governance, settings).
- `src/constants/routes.ts`: `ENTITY_SEGMENTS` includes `rule: "rule"` for URL building.

### 7. Governance Screen Updates (`src/app/(dashboard)/governance/index.tsx`)

- Violations table gains a **Rule** column linking to the rule detail screen.
- Rules table title column now navigable — clicking a rule title navigates to its detail screen.
- `navigateTo` callback updated to accept `"rule"` entity type.
- Violation search keys include `"ruleTitle"`.

### 8. DataTable Alignment Fix (`src/components/tables/DataTable.tsx`)

- New `alignRenderedContent()` utility ensures custom `render` content respects column `align` prop (right/center).
- Handles Text elements (merges textAlign style), string/number primitives, and arbitrary ReactNode wrappers.
- Non-render (default) cells also get proper textAlign styles.

### 9. Seed Data (`src/features/analytics/fixtures/seedData.ts`)

- Rule-agent and rule-project assignment maps added to support deterministic rule detail lookups.

### 10. i18n

- `governance.table.rule` translation key added across all 20 locale files.

## Files Created

| File | Purpose |
|------|---------|
| `src/components/routes/RuleDetailRoute.tsx` | Route wrapper extracting `ruleId` param |
| `src/features/search/screens/RuleDetailScreen.tsx` | Full rule detail screen with inline editing |
| `src/app/(dashboard)/agents/rule/[ruleId].tsx` | Agents tab route |
| `src/app/(dashboard)/costs/rule/[ruleId].tsx` | Costs tab route |
| `src/app/(dashboard)/dashboard/rule/[ruleId].tsx` | Dashboard tab route |
| `src/app/(dashboard)/governance/rule/[ruleId].tsx` | Governance tab route |
| `src/app/(dashboard)/settings/rule/[ruleId].tsx` | Settings tab route |

## Files Updated

| File | Change |
|------|--------|
| `src/features/analytics/types/contracts.ts` | Added `rule` to `SearchEntityType`, `ruleId`/`ruleTitle` to `PolicyViolationRow`, new `RuleDetailResponse`/`UpdateRuleRequest`/`UpdateRuleResponse` |
| `src/features/analytics/api/IAnalyticsApi.ts` | Added `getRuleDetail`, `updateRule` methods |
| `src/features/analytics/services/IAnalyticsService.ts` | Added `getRuleDetail`, `updateRule` methods |
| `src/features/analytics/services/AnalyticsService.ts` | Implemented `getRuleDetail`, `updateRule` |
| `src/features/analytics/api/stub/StubAnalyticsApi.ts` | Stub implementations for rule detail & update |
| `src/features/analytics/fixtures/seedData.ts` | Rule-agent/project assignment maps |
| `src/store/api/analyticsApi.ts` | `getRuleDetail` query, `updateRule` mutation, `"RuleDetail"` tag |
| `src/store/api/index.ts` | Re-exported new hooks |
| `src/features/search/hooks/useEntityDetail.ts` | `useRuleDetailScreen` hook |
| `src/features/search/hooks/index.ts` | Re-export |
| `src/features/search/screens/index.ts` | Re-export `RuleDetailScreen` |
| `src/components/routes/index.ts` | Re-export `RuleDetailRoute` |
| `src/constants/routes.ts` | `rule` in `ENTITY_SEGMENTS` |
| `src/app/(dashboard)/governance/index.tsx` | Rule column in violations table, navigable rule titles |
| `src/components/tables/DataTable.tsx` | `alignRenderedContent` for column alignment |
| `src/components/tables/__tests__/DataTable.test.tsx` | Tests for alignment behavior |
| `src/i18n/locales/*.json` (20 files) | `governance.table.rule` translation key |
| `src/features/search/screens/AgentDetailScreen.tsx` | Updated `navigateTo` type to include `"rule"` |
| `src/constants/__tests__/routes.test.ts` | Updated tests for rule entity routing |
| `src/features/analytics/services/__tests__/AnalyticsService.test.ts` | Tests for `getRuleDetail`, `updateRule` |
| `src/features/analytics/services/__tests__/AnalyticsService.createEntities.test.ts` | Updated for new contract fields |
| `src/features/analytics/hooks/__tests__/useCreateComplianceViolationRule.test.ts` | Updated mock for new fields |
| `src/__tests__/integration/searchEntityNavigation.test.tsx` | Updated for rule entity type |
| `src/app/(dashboard)/__tests__/governanceScreen.test.tsx` | Tests for rule column links |

## Acceptance Criteria

- Clicking a rule title in the governance Rules table navigates to `/governance/rule/{ruleId}`.
- Clicking a rule name in the violations table navigates to the rule detail screen.
- Rule detail screen displays rule metadata (title, description, created, last edited, runs checked).
- Edit mode allows changing title, description, assigned agents, and assigned projects.
- Save persists changes via `updateRule` mutation and invalidates caches.
- Assigned agents/projects show as navigable chips in read-only mode.
- Edit mode shows filterable checklists for agent/project assignment.
- Recent violations and recent runs tables render with proper links and formatting.
- Rule routes work from all 5 tab stacks.
- DataTable `align: "right"` works correctly for custom render functions.
- `npx tsc --noEmit` passes.
- All existing tests pass.

## Depends On

- **PR 0042** — Entity Detail Services, Hooks & Shared Screen Models
- **PR 0043** — Entity Screens in Every Tab Stack
- **PR 0046** — Create Compliance Violation Rule (governance rule contracts)
- **PR 0061** — DataTable Entity Links Navigation
