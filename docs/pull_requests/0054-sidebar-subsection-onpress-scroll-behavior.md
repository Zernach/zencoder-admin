# 0054 — Sidebar Subsection onPress Scroll Behavior

> Ensure every sidebar subsection item is pressable and scrolls the active screen to the matching subsection when pressed.

---

## User Story

As an analytics user, I want each sidebar subsection to be pressable so I can jump directly to that subsection on the current screen instead of manually scrolling.

## Prior State

- Subsection labels exist in sidebar navigation, but press behavior is not consistently enforced as a required contract.
- Screen subsection anchors and sidebar subsection IDs can drift without explicit acceptance criteria.
- Test coverage does not fully lock press-to-scroll behavior as a must-have UX contract across supported tabs.

## Target State

For sidebar-supported layouts, subsection navigation has a strict interaction contract:

- Every rendered subsection row is pressable.
- Pressing a subsection triggers `onPress` behavior that scrolls the current screen viewport to that subsection anchor.
- Subsection anchor IDs are sourced from shared typed constants (no duplicated inline IDs).
- Applies to sidebar subsection-enabled routes:
  - Agents
  - Costs
  - Governance
- Existing sidebar collapse behavior remains unchanged:
  - Expanded sidebar: show and allow subsection presses.
  - Collapsed sidebar: subsection list remains hidden.
- Mobile bottom-tab behavior remains unchanged.

## Files to Create / Update

- `src/components/shell/Sidebar.tsx`
  - Wire subsection `onPress` handlers to section-scroll orchestration.
- `src/components/shell/SidebarSubsectionItem.tsx`
  - Ensure subsection rows are consistently pressable and accessible.
- `src/components/shell/ContentViewport.tsx`
  - Provide/consume a typed scroll-to-section contract for sidebar presses.
- `src/components/screen/ScreenWrapper.tsx`
  - Register subsection anchors with stable IDs used by sidebar navigation.
- `src/constants/navigation.ts`
  - Keep subsection metadata (id/label/order) as the single source of truth.
- `src/app/(dashboard)/agents/index.tsx`
  - Ensure required subsection anchors are present and aligned with constants.
- `src/app/(dashboard)/costs/index.tsx`
  - Ensure required subsection anchors are present and aligned with constants.
- `src/app/(dashboard)/governance/index.tsx`
  - Ensure required subsection anchors are present and aligned with constants.

## Acceptance Criteria

- On supported sidebar routes, every visible subsection renders as a pressable control.
- Pressing a subsection scrolls the screen to the matching subsection anchor in the active page.
- Subsection press behavior works for Agents, Costs, and Governance.
- Governance subsection order and labels remain:
  - Overview
  - Compliance Status
  - Seat User Oversight
  - Recent Violations
  - Policy Changes
- Collapsed sidebar does not render subsection rows.
- No regressions to top-level sidebar navigation.

## Test Plan

1. Extend constants contract tests to enforce subsection ID/label/order stability.
2. Add or update sidebar component tests to assert subsection rows are pressable and dispatch the expected section target on press.
3. Add integration tests that verify subsection press triggers scroll-to-anchor behavior for Agents, Costs, and Governance.
4. Add governance-specific assertions to guarantee the five required subsection labels and order.
5. Run:
   - `npm run typecheck`
   - `npm run test`
   - `npm run test -- sidebarSubsectionNavigation`

## Depends On

- **PR 0051** — Sidebar subsection contracts and shared constants
- **PR 0052** — Sidebar subsections rendering and base anchor wiring
- **PR 0053** — Sidebar subsection navigation test coverage baseline
