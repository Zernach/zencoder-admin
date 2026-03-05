# 0046 — Create Compliance Violation Rule Flow

> Allow admins to create a new compliance violation rule and automatically append violations to the governance list when matching runs break that rule.

---

## User Story

As an admin, I want to create compliance rules directly in the Governance screen so new policy requirements can immediately flag violating runs.

## Prior State

- Governance shows existing violations but has no rule authoring flow.
- No create-rule API/service/hook contract exists.
- Violations list is static to seeded policy violations only.

## Target State

Add a create-rule workflow with typed stub-backed persistence:

- UI action to create a new rule from Governance.
- Rule create form uses shared `InputForm` and `useFormFields`.
- On save, stub API stores rule and evaluates existing in-range runs.
- If rule criteria matches runs, generated rule-break violations are appended to `recentViolations`.

## Files to Create / Update

### Contracts + API/service

- `src/features/analytics/types/contracts.ts`
  - Add `ComplianceViolationRule`, `CreateComplianceViolationRuleRequest`, `CreateComplianceViolationRuleResponse`.
- `src/features/analytics/api/IAnalyticsApi.ts`
  - Add `createComplianceViolationRule(...)`.
- `src/features/analytics/services/IAnalyticsService.ts`
  - Add matching method.
- `src/features/analytics/services/AnalyticsService.ts`
  - Add implementation.
- `src/features/analytics/api/stub/StubAnalyticsApi.ts`
  - Store created rules and create synthetic violations when rules are broken.

### Hooks + UI

- `src/features/analytics/hooks/useCreateComplianceViolationRule.ts`
- `src/app/(dashboard)/governance.tsx`
  - Add create-rule entry point and list refresh behavior.
- `src/features/analytics/components/CreateComplianceRuleForm.tsx` (new)

## Acceptance Criteria

- Admin can create a rule with required fields (name, severity, trigger condition, reason template).
- Rule is added through typed service and stub API abstraction.
- When created rule matches existing runs, new violations appear in Governance recent violations.
- New violations include deterministic IDs and timestamps for reliable sorting and testability.
- Errors and loading states are surfaced in the form.

## Test Plan

1. Stub API tests:
   - rule creation stores rule data
   - broken-rule matching generates new violations
2. Service tests:
   - create-rule delegation and typed response mapping
3. Hook tests:
   - loading/success/error/refetch behavior
4. Integration test:
   - create rule from Governance and verify violation list updates

## Depends On

- **PR 0045** — shared form/hooks/contracts foundation
- **PR 0018** / **PR 0033** — governance screen and recent violation sorting hardening

