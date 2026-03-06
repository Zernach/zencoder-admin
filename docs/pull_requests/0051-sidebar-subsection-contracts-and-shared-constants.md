# 0051 — Sidebar Subsection Contracts and Shared Constants

> Create a single source of truth for top-level navigation and sidebar subsection metadata so Agents, Costs, and Governance subsection behavior stays DRY and type-safe.

---

## User Story

As a user, I want sidebar navigation and subsection labels to stay consistent across screens so navigation is predictable and does not regress when labels or routes change.

## Prior State

- `Sidebar` and `BottomTabs` each define their own nav arrays.
- No shared typed config exists for sidebar subsections.
- Section labels are hardcoded in screen components and cannot be reused for sidebar navigation behavior.

## Target State

Introduce shared constants + types for navigation:

- Centralized top-level nav config reused by shell navigation components.
- Centralized subsection config for:
  - Agents
  - Costs
  - Governance
- Governance subsection list must be:
  - Overview
  - Compliance Status
  - Seat User Oversight
  - Recent Violations
  - Policy Changes
- Config exports route-safe and ID-safe helpers for UI rendering and tests.

### Proposed subsection constants

- Agents:
  - Reliability
  - Agent Performance
  - Project Breakdown
  - Recent Runs
- Costs:
  - Cost Summary
  - Cost by Provider
  - Budget Forecast
  - Project Breakdown
- Governance:
  - Overview
  - Compliance Status
  - Seat User Oversight
  - Recent Violations
  - Policy Changes

## Files to Create / Update

- `src/constants/navigation.ts`
  - Add typed top-level navigation config.
  - Add typed subsection config keyed by route.
  - Export subsection ID/label helpers for UI + tests.
- `src/constants/routes.ts`
  - Ensure route type exports support subsection config keys.
- `src/components/shell/Sidebar.tsx`
  - Consume shared nav constants instead of local `NAV_ITEMS`.
- `src/components/shell/BottomTabs.tsx`
  - Consume same shared top-level nav constants (filtered for mobile UX as needed).
- `src/constants/index.ts` (if present/needed)
  - Export shared navigation constants.

## Acceptance Criteria

- Navigation labels/routes are not duplicated in `Sidebar` and `BottomTabs`.
- Subsection metadata for Agents/Costs/Governance exists in one shared typed module.
- Subsection IDs are stable constants (for anchor links, test IDs, and routing params).
- TypeScript prevents invalid route or subsection references at compile time.

## Test Plan

1. Add constants contract test verifying each configured subsection includes stable `id` + `label`.
2. Add unit coverage for helper selectors (route to subsection mapping).
3. Update existing shell nav tests to assert they consume shared constants behavior.
4. Run:
   - `npm run typecheck`
   - `npm run test`

## Depends On

- **PR 0012** — shell/navigation baseline
- **PR 0037** — TypeScript DRY cleanup precedent
