# 0052 — Sidebar Subsections for Agents, Costs, and Governance

> Add active-tab subsection navigation in the web/sidebar experience so users can jump directly to key sections inside Agents, Costs, and Governance screens.

---

## User Story

As a user browsing analytics pages, I want pressable sidebar subsections under the active tab so I can jump directly to the section I need without long scrolling.

## Prior State

- Sidebar only shows top-level nav items.
- No subsection UI appears under active nav items.
- No section-anchor jump behavior exists for Agents/Costs/Governance content sections.

## Target State

When a user is on desktop/tablet sidebar layout:

- Active top-level tab remains highlighted.
- Active tab shows subsection list directly underneath.
- Subsection items are pressable and jump to matching section anchors.
- Applies to:
  - Agents
  - Costs
  - Governance
- Governance subsection list is exactly:
  - Overview
  - Compliance Status
  - Seat User Oversight
  - Recent Violations
  - Policy Changes
- Sidebar collapse behavior remains unchanged:
  - Expanded: show subsection labels.
  - Collapsed: hide subsection list.
- Mobile bottom tabs are unchanged.

## Files to Create / Update

### Sidebar rendering + interaction

- `src/components/shell/Sidebar.tsx`
  - Render subsection list for active supported route.
  - Handle subsection press behavior.
- `src/components/shell/SidebarNavItem.tsx`
  - Support rendering subsection content beneath active items.
- `src/components/shell/SidebarSubsectionItem.tsx` (new)
  - Reusable subsection row with active styles and accessibility.

### Section anchor support

- `src/components/screen/ScreenWrapper.tsx`
  - Expose or integrate section jump handling with content scroll container.
- `src/components/shell/ContentViewport.tsx`
  - Support programmatic scroll-to-section behavior.
- `src/app/(dashboard)/agents.tsx`
  - Add subsection anchor IDs for key sections.
- `src/app/(dashboard)/costs.tsx`
  - Add subsection anchor IDs for key sections.
- `src/app/(dashboard)/governance.tsx`
  - Add subsection anchor IDs for key sections used in sidebar list.

### Shared constants usage

- `src/constants/navigation.ts`
  - Consume subsection constants from PR 0051 for rendering and anchor mapping.

## Acceptance Criteria

- On `/agents`, sidebar shows active `Agents` item and its 4 pressable subsections.
- On `/costs`, sidebar shows active `Costs` item and its 4 pressable subsections.
- On `/governance`, sidebar shows active `Governance` item and exactly 5 pressable subsections listed above.
- Pressing a subsection scrolls to the matching section in the current screen.
- Subsection list does not render for inactive top-level tabs.
- Subsection list is hidden when sidebar is collapsed.
- Existing top-level navigation behavior and highlights continue working.

## Test Plan

1. Implement subsection rendering first with mocked callbacks.
2. Add section-anchor plumbing and verify jump offsets in integration tests.
3. Validate accessibility labels and selected state behavior for subsection rows.
4. Run:
   - `npm run typecheck`
   - `npm run test`

## Depends On

- **PR 0051** — shared navigation/subsection constants
- **PR 0012** — baseline shell/sidebar behavior
