# 0043 — Entity Screens in Every Tab Stack (Route Wrappers + Shared Views)

> Implement `.../agent`, `.../project`, `.../team`, `.../human`, and `.../run` screens inside each of the 5 tab stacks using shared screen components and thin route wrappers.

---

## User Story

As a user, I want search results to open entity screens from any tab without losing context, and I want those screens to look and behave consistently. Typing in TopBar should not filter my current screen; only selecting a suggestion should open these routes.

## Prior State

- No per-tab entity routes exist.
- No shared entity detail screen components exist for reuse across tabs.

## Target State

Build shared screen components once, then expose them through route wrappers in every tab stack.

### Shared screen components (single implementation per entity)

- `AgentDetailScreen`
- `ProjectDetailScreen`
- `TeamDetailScreen`
- `HumanDetailScreen`
- `RunDetailScreen`

### Route wrappers (25 routes total)

For each tab (`dashboard`, `agents`, `costs`, `governance`, `settings`), add:

- `agent/[agentId].tsx`
- `project/[projectId].tsx`
- `team/[teamId].tsx`
- `human/[humanId].tsx`
- `run/[runId].tsx`

Each wrapper:

- Reads route params.
- Renders shared entity screen component.
- Passes `originTab` for breadcrumbs and back behavior.

## Files to Create / Update

### Shared screens

- `src/features/search/screens/AgentDetailScreen.tsx`
- `src/features/search/screens/ProjectDetailScreen.tsx`
- `src/features/search/screens/TeamDetailScreen.tsx`
- `src/features/search/screens/HumanDetailScreen.tsx`
- `src/features/search/screens/RunDetailScreen.tsx`
- `src/features/search/screens/index.ts`

### Per-tab route wrappers

- `src/app/(dashboard)/dashboard/agent/[agentId].tsx`
- `src/app/(dashboard)/dashboard/project/[projectId].tsx`
- `src/app/(dashboard)/dashboard/team/[teamId].tsx`
- `src/app/(dashboard)/dashboard/human/[humanId].tsx`
- `src/app/(dashboard)/dashboard/run/[runId].tsx`
- Repeat same 5 files under:
  - `src/app/(dashboard)/agents/`
  - `src/app/(dashboard)/costs/`
  - `src/app/(dashboard)/governance/`
  - `src/app/(dashboard)/settings/`

### UI primitives (if needed)

- `src/components/states/` for reusable loading/empty/error entity blocks.

## Acceptance Criteria

- All 25 stack-local entity routes render successfully.
- Routes are entered from explicit suggestion selection, not on raw search keystrokes.
- Each route uses shared screen components (no duplicated business logic).
- Breadcrumb/title indicates current entity and preserves originating tab context.
- Deep links to each route type work with valid params.
- Loading, empty, and error states are consistent across entities.

## Test Plan

1. Add shared screen component tests for each entity screen.
2. Add route wrapper smoke tests (parameterized) confirming params are passed through.
3. Add navigation integration tests from autocomplete selection to rendered entity screen.
4. Add snapshot/smoke coverage for mobile and desktop breakpoints.

## Depends On

- **PR 0041** — stack-aware route contract
- **PR 0042** — entity detail hooks + data contracts
