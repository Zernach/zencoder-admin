# 0045 — Create Entity Form Foundations (Hooks, Components, Shared Contracts)

> Introduce reusable typed form primitives and shared create-entity API contracts so all create flows (rule, seat/human, project, team) follow one consistent architecture.

---

## User Story

As a maintainer, I want one reusable create-form pattern and one source of truth for request/response types so new create flows are fast to build and safe to refactor.

## Prior State

- Dashboard is read-heavy with no standardized create-form infrastructure.
- No shared hook abstraction for ref-based form state + submit validation.
- No typed create contracts in the analytics domain for governance entities.

## Target State

Add shared form and contract foundations:

- Reusable form UI components:
  - `InputForm`
  - `FormTextInput`
- Reusable form hooks:
  - `useTriggerRerender`
  - `useFormFields`
- Shared create contracts for:
  - compliance violation rule creation
  - seat/human creation
  - project creation
  - team creation
- API/service interfaces updated to expose create methods using shared contracts only.

## Files to Create / Update

### Form infrastructure

- `src/components/forms/InputForm.tsx`
- `src/components/forms/FormTextInput.tsx`
- `src/components/forms/index.ts`
- `src/hooks/useTriggerRerender.ts`
- `src/hooks/useFormFields.ts`

### Shared contracts and API/service interfaces

- `src/features/analytics/types/contracts.ts`
  - Add create request/response interfaces for all 4 flows.
- `src/features/analytics/api/IAnalyticsApi.ts`
  - Add typed create methods.
- `src/features/analytics/services/IAnalyticsService.ts`
  - Add typed create methods.
- `src/features/analytics/services/AnalyticsService.ts`
  - Add service pass-through implementations.
- `src/features/analytics/api/stub/StubAnalyticsApi.ts`
  - Add stubbed create implementations with deterministic realistic fake data.

## Acceptance Criteria

- All create-form flows can use the same `InputForm`/`useFormFields` pattern.
- Shared TypeScript create contracts are defined once and imported by UI, hooks, service, and stub API layers.
- No `any` is introduced in create form infrastructure.
- Stubbed create methods return typed results and remain swappable with real implementations later.

## Test Plan

1. Unit tests for `useTriggerRerender` and `useFormFields`.
2. Component tests for `InputForm` and error banner behavior.
3. Typecheck gate validates shared contract usage:
   - `npm run typecheck`
4. Smoke tests confirm existing dashboard screens are unaffected.

## Depends On

- **PR 0003** — Shared TypeScript contracts
- **PR 0005** / **PR 0006** — API and service abstraction layers
- **PR 0009** — Core reusable component patterns

