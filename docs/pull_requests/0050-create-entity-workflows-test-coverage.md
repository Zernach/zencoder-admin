# 0050 — Create Entity Workflows Test Coverage

> Add layered test coverage for create-rule, create-seat/human, create-project, and create-team workflows from contracts through UI integration.

---

## User Story

As a team, we need high confidence that all new create workflows are reliable and do not regress existing analytics behavior.

## Prior State

- Current tests focus on read dashboards, navigation, and search.
- No dedicated coverage for create-entity workflows.

## Target State

Add full test strategy across layers:

- Unit: validation + hook behavior
- Contract/service: interface typing and delegation
- Stub API: create behavior and deterministic data mutation
- Integration: form submit, error handling, and list refresh
- E2E: core happy path and duplicate validation path for each entity type

## Files to Create / Update

### Unit + hook tests

- `src/hooks/__tests__/useFormFields.test.ts`
- `src/features/analytics/hooks/__tests__/useCreateComplianceViolationRule.test.ts`
- `src/features/analytics/hooks/__tests__/useCreateHuman.test.ts`
- `src/features/analytics/hooks/__tests__/useCreateProject.test.ts`
- `src/features/analytics/hooks/__tests__/useCreateTeam.test.ts`

### API + service tests

- `src/features/analytics/api/stub/__tests__/StubAnalyticsApi.createEntities.test.ts`
- `src/features/analytics/services/__tests__/AnalyticsService.createEntities.test.ts`

### UI integration tests

- `src/components/forms/__tests__/InputForm.test.tsx`
- `src/__tests__/integration/createComplianceRuleFlow.test.tsx`
- `src/__tests__/integration/createHumanFlow.test.tsx`
- `src/__tests__/integration/createProjectFlow.test.tsx`
- `src/__tests__/integration/createTeamFlow.test.tsx`

### E2E

- `e2e/tests/create-entity-workflows.spec.ts`

## Acceptance Criteria

- Every create flow has success + failure path coverage.
- Duplicate/validation failures are verified for human, project, and team creation.
- Compliance rule creation test verifies generated violations appear in governance violations list when rule is broken.
- CI quality gates stay green:
  - `npm run typecheck`
  - `npm run test`
  - `npm run test:e2e`

## Test Execution Plan

1. Write unit and contract tests first for fast feedback loops.
2. Add integration tests for form submission and screen-state transitions.
3. Add e2e smoke coverage for one happy path per create flow.
4. Add regression checks to ensure existing dashboard read flows still pass.

## Depends On

- **PR 0045**, **PR 0046**, **PR 0047**, **PR 0048**, **PR 0049**
- Existing testing baseline from **PR 0020**, **PR 0021**, **PR 0022**, **PR 0023**

