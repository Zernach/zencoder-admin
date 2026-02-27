# Dashboard Layout and Motion Spec

## Purpose
Defines responsive layout behavior and interaction motion for a professional analytics dashboard shell in Expo React Native Web + mobile.

## Shell structure
- `AppShell`
  - `Sidebar` (web/tablet)
  - `TopBar` (all platforms)
  - `ContentViewport`

Primary web layout:
- Left sidebar + top filter/action bar + scrollable content grid.

Primary mobile layout:
- Top bar + screen content + bottom tab navigation.

## Breakpoints
- `mobile`: `< 768`
- `tablet`: `768 - 1023`
- `desktop`: `>= 1024`

## Sidebar behavior (web/tablet)

### States
- `expanded`
  - Width: `264`
  - Shows logo, section labels, badges, and optional project switcher.
- `collapsed`
  - Width: `76`
  - Shows icons only, labels hidden, tooltips on hover/focus (web).

### Interactions
- Toggle button in sidebar header and in top bar.
- Keyboard shortcut on web: `[` to collapse, `]` to expand.
- Hover does not auto-expand; explicit user intent only.
- Persist state per user/org (local storage or persisted app preferences).

### Animation
- Duration: `220ms`
- Easing: standard ease-out (`cubic-bezier(0.22, 1, 0.36, 1)` equivalent)
- Animate:
  - Sidebar width
  - Nav label opacity and translateX (fade/slide)
  - Main content left offset

Reanimated guidance:
- Use shared value for sidebar width.
- Animate styles with `withTiming`.
- Keep nav list virtualization off unless list exceeds 30 entries.

## Content layout

### Desktop grid
- 12-column grid
- Column gap: `16`
- Row gap: `16`
- Standard card spans:
  - KPI card: span 3
  - Medium chart: span 6
  - Table/full-width detail: span 12

### Tablet
- 8-column grid
- KPI card: span 4
- Chart: span 8

### Mobile
- Single-column stack
- KPI cards in horizontal snap row on overview, vertical on detail screens.
- Tables become list rows with progressive disclosure.

## Top bar behavior
- Fixed top bar on web.
- Contains global filters, search, date range, and utility actions.
- Height: `56`.
- On mobile, move advanced filters into sheet modal.

## Motion system

### Global timing tokens
- `motion.fast`: `120ms`
- `motion.base`: `180ms`
- `motion.slow`: `260ms`

### Easing tokens
- `ease.standard`: ease-out for enter/expand
- `ease.emphasized`: sharper ease for modal/sheet
- `ease.linear`: progress indicators only

### Component motion rules
- Card hover (web): `120ms`, slight bg and border shift.
- KPI number update: cross-fade + subtle y translation, `180ms`.
- Filter change:
  - Keep previous data visible.
  - Fade skeleton overlay in `120ms` only if latency > `150ms`.
- Page transition:
  - Desktop: `180ms` content fade/translate.
  - Mobile: native stack/sheet transition, no custom heavy animation.

## Loading, empty, error states
- Loading skeleton must match final card/table structure.
- Empty states:
  - Include active filter summary.
  - Primary action: clear filters or adjust range.
- Error states:
  - Neutral language, retry action visible.
  - Preserve layout spacing to avoid visual jumps.

## Interaction quality rules
- No layout shift when toggling sidebar labels.
- Tooltips required for collapsed icon-only nav.
- Active nav item must be obvious in both themes.
- Touch targets minimum `44x44`.
- Focus order must remain logical when sidebar collapses/expands.

## Accessibility
- Respect reduced motion preference:
  - Disable non-essential transforms.
  - Keep opacity transitions <= `120ms`.
- Keyboard support (web):
  - Sidebar toggle reachable by tab.
  - Arrow-key navigation for sidebar items.
  - Escape closes open filter popovers/sheets.
- Ensure all icon-only controls have `aria-label`/accessible label.

## Performance constraints
- Sidebar toggle should feel immediate (< 16ms main-thread work per frame target).
- Avoid expensive re-renders by memoizing nav items and layout wrappers.
- Charts should not fully remount on minor filter changes.

## Implementation checklist for agent
- Implement `DashboardShell` with responsive state and breakpoint detection.
- Create `useSidebarState` hook with persisted preference.
- Add motion tokens under `src/theme/motion.ts`.
- Add reusable `SidebarNavItem` supporting icon-only and expanded variants.
- Verify behavior on web keyboard navigation and mobile narrow widths.
