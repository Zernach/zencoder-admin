# 0040 — TopBar Search Autocomplete UX & Grouped Suggestions

> Upgrade the TopBar search field to show grouped autocomplete suggestions while typing, with clear keyboard/touch behavior and accessibility support.

---

## User Story

As a user, when I type in search, I want immediate grouped suggestions (Agents, Projects, Teams, Humans, Runs) so I can select a result without navigating manually.

## Prior State

- `TopBar` only stores and debounces plain text input.
- No autocomplete panel exists.
- No loading/empty/error search suggestion UI state exists.

## Target State

Typing in search opens an anchored autocomplete panel with 5 labeled groups:

- Agents
- Projects
- Teams
- Humans (Seats)
- Runs

Panel supports touch and keyboard navigation, closes on blur/escape/outside press, and does **not** filter active-screen content while typing.

## Files to Update

### `src/components/shell/TopBar.tsx`

- Integrate autocomplete state and panel rendering.
- Keep debounce behavior and clear-search behavior.
- Ensure typing in TopBar does not dispatch active-screen filtering state updates.
- Handle focus, blur, escape, and selection events.

### `src/components/search/SearchAutocompletePanel.tsx` (new)

- Render grouped sections and suggestion rows.
- Handle loading, empty, and error states.
- Expose callbacks for row select and dismiss.

### `src/components/search/SearchSuggestionSection.tsx` (new)

- Reusable section component with title + rows.

### `src/features/analytics/hooks/useSearchAutocomplete.ts` (new)

- Consume `IAnalyticsService.getSearchSuggestions`.
- Manage request lifecycle, cancellation/ignore stale results, and debounced query state.

### `src/components/search/__tests__/...` (new)

- Add component tests for grouped rendering and interaction behavior.

## Acceptance Criteria

- Typing 2+ characters into TopBar opens autocomplete panel.
- Typing into TopBar does not filter the currently visible screen data.
- Suggestions are visually grouped and labeled exactly as:
  - Agents
  - Projects
  - Teams
  - Humans (Seats)
  - Runs
- Selecting a suggestion triggers selection callback with typed entity payload and starts navigation to entity detail route.
- Escape key and outside-press close the panel.
- Search input clear button closes panel and clears suggestions.
- Mobile and web behavior remain usable and accessible.

## Test Plan

1. Unit test `useSearchAutocomplete` for:
   - Debounced fetching
   - Stale response handling
   - Empty query short-circuit
2. Component tests for:
   - Group labels and item rendering
   - Loading/empty/error states
   - Keyboard highlight and enter-to-select
3. `TopBar` tests for:
   - Open/close panel interactions
   - Clear behavior
   - Selection callback invocation
   - No active-screen filter dispatch/refetch while typing before selection

## Depends On

- **PR 0039** — shared contracts + stub API method
- **PR 0035** — sticky top search bar foundations
