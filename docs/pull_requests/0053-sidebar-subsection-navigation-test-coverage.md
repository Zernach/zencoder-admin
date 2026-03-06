# 0053 — Sidebar Subsection Navigation Test Coverage

> Add focused tests for sidebar subsection constants, rendering, and section-jump behavior across Agents, Costs, and Governance.

---

## User Story

As a team, we need reliable automated coverage for sidebar subsection navigation so future layout and navigation refactors do not break section-level UX.

## Prior State

- Existing shell tests cover bottom tabs but not sidebar subsection behavior.
- No contract tests ensure subsection constants stay aligned with screen anchor IDs.
- No integration tests verify subsection presses jump to the intended section.

## Target State

Implement layered test coverage:

- Constants contract tests for subsection metadata integrity.
- Sidebar component tests for active-tab subsection rendering.
- Integration tests for subsection press -> section navigation behavior.
- Governance-specific assertions for required subsection list and order.

## Files to Create / Update

### Unit / contract tests

- `src/constants/__tests__/navigation.test.ts`
  - Validate route -> subsection mappings.
  - Validate stable IDs and labels for Agents/Costs/Governance.

### Component tests

- `src/components/shell/__tests__/Sidebar.test.tsx`
  - Active tab displays subsection list.
  - Inactive tabs do not display subsection list.
  - Collapsed sidebar hides subsection list.
- `src/components/shell/__tests__/SidebarNavItem.test.tsx`
  - Selected/active subsection state and accessibility semantics.

### Integration tests

- `src/__tests__/integration/sidebarSubsectionNavigation.test.tsx`
  - Agents subsection press scrolls to target section.
  - Costs subsection press scrolls to target section.
  - Governance subsection list exactly matches required five entries and target anchors.

### E2E (optional but recommended)

- `e2e/tests/06-sidebar-subsection-navigation.spec.ts`
  - Web flow: navigate tabs and use sidebar subsection links to jump within page.

## Acceptance Criteria

- Tests fail if subsection labels/order diverge from required config.
- Tests fail if subsection IDs are removed or changed without contract updates.
- Tests fail if subsection lists render while sidebar is collapsed.
- Tests fail if subsection presses no longer trigger section-jump behavior.
- CI remains green:
  - `npm run typecheck`
  - `npm run test`
  - `npm run test:e2e` (if E2E spec is included)

## Test Execution Plan

1. Add constants contract tests first to lock route/section schema.
2. Add sidebar component tests for rendering and collapsed state.
3. Add integration tests for jump behavior and governance subsection requirements.
4. Add/update E2E web spec for end-to-end navigation confidence.

## Depends On

- **PR 0051** — shared constants/contracts
- **PR 0052** — subsection UI and section-anchor behavior
- Existing test harness from **PR 0022** and **PR 0023**
