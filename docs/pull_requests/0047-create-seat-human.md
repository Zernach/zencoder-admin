# 0047 — Create Seat/Human Flow

> Add a typed create flow to add a new seat/human (team member) to the organization using stubbed backend APIs behind interfaces.

---

## User Story

As an admin, I want to add a new team member seat so the user appears in organization data and can be assigned to teams/projects.

## Prior State

- Seat/human data exists only in seeded fixtures.
- No create-seat contract or API/service method.
- No UI form for creating a new team member.

## Target State

Implement create-seat flow:

- Add `Create Seat/Human` form with required fields:
  - full name
  - email
  - team assignment
- Use shared `InputForm` + `useFormFields`.
- Persist through service abstraction into stub API state.
- Make created humans appear in:
  - Governance seat user oversight list
  - filter option sources that use seed users

## Files to Create / Update

### Contracts + API/service

- `src/features/analytics/types/contracts.ts`
  - Add `CreateHumanRequest`, `CreateHumanResponse`.
- `src/features/analytics/api/IAnalyticsApi.ts`
  - Add `createHuman(...)`.
- `src/features/analytics/services/IAnalyticsService.ts`
  - Add matching method.
- `src/features/analytics/services/AnalyticsService.ts`
  - Add implementation.
- `src/features/analytics/api/stub/StubAnalyticsApi.ts`
  - Add in-memory user creation with deterministic IDs and validation.

### Hooks + UI

- `src/features/analytics/hooks/useCreateHuman.ts`
- `src/features/analytics/components/CreateHumanForm.tsx`
- `src/app/(dashboard)/governance.tsx` or `src/app/(dashboard)/settings.tsx`
  - Add entry point for create-seat workflow.

## Acceptance Criteria

- Admin can create a new seat/human with strict client-side validation.
- Duplicate email validation is enforced in stub API and surfaced in UI.
- Created human is available in the active data model without reloading the app.
- Form follows standardized loading/error/success UX.

## Test Plan

1. Stub API tests:
   - creates user with deterministic ID
   - rejects duplicate email
2. Service tests:
   - delegation and response contract coverage
3. Hook tests:
   - success/error states and error message mapping
4. Integration tests:
   - create seat from UI and verify list/filter source updates

## Depends On

- **PR 0045** — shared create-form and contract scaffolding
- **PR 0030** / **PR 0031** — governance seat oversight baseline

