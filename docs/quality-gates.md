# Quality Gate Results

## Coverage

| Category | Files | Stmts | Lines | Target |
|----------|-------|-------|-------|--------|
| Metric utilities | metricFormulas.ts, formatters.ts | 100% | 100% | >=95% |
| API / Services | StubAnalyticsApi.ts, AnalyticsService.ts | 97.65% | 99.2% | >=90% |
| Hooks | 8 dashboard hooks | >90% | >90% | >=90% |
| UI Components | KpiCard, DataTable, TrendChart | >80% | >80% | >=80% |

## Tests

- **Unit tests**: 138 tests (metric formulas + formatters)
- **Contract & service tests**: 50 tests (StubAnalyticsApi + AnalyticsService)
- **Hook tests**: 8 suites covering loading/data/error/refetch shape
- **Component tests**: 3 suites (KpiCard, DataTable, TrendChart)
- **Integration tests**: 2 suites (filter propagation, drill-down linkage)
- **E2E tests**: 5 Playwright specs (overview, projects, costs, governance, runs)
- **Total**: 254 Jest tests passing, 18 test suites

## Accessibility

- **WCAG AA contrast**: PASS
  - Primary text `#e5e5e5` on `#1a1a1a`: 13.8:1
  - Secondary text `#a3a3a3` on `#1a1a1a`: 6.9:1
  - Tertiary text `#8a8a8a` on `#1a1a1a`: 5.0:1 (bumped from `#7a7a7a` at 4.05:1)
  - Primary text `#e5e5e5` on `#0a0a0a`: 16.5:1
- **Keyboard navigation**: PASS
  - Tab/Shift+Tab between interactive elements
  - Enter/Space activates buttons and cards
  - `[`/`]` toggles sidebar
  - Sidebar nav items keyboard accessible
- **Screen reader**: PASS
  - `KpiCard`: `accessibilityLabel="Title: Value"`
  - `StatusBadge`: `accessibilityLabel="Status: Failed"`
  - `SortableHeader`: `accessibilityLabel="Sort by Column, ascending"`
  - `DeltaIndicator`: `accessibilityLabel="+12.3% change"`
  - `SidebarNavItem`: `accessibilityLabel={label}`, `accessibilityState`
  - Toggle switches: `accessibilityRole="switch"`, `accessibilityState={{ checked }}`
- **Touch targets**: PASS
  - All buttons >=44x44 (`minHeight: 44`)
  - Sidebar nav items: 44px min height
  - Bottom tabs: 48px height
  - Pagination buttons: 44x44
  - Table rows: 44px min height

## Performance

- **Memoization**: View model mappers wrapped in `useMemo`
- **React Query**: `staleTime: 30s`, `keepPreviousData` for smooth filter transitions
- **Animations**: All use `react-native-reanimated` (native thread, 60fps)
- **Reduced motion**: `useReducedMotion()` hook disables non-essential animations
- **Virtualization**: `@shopify/flash-list` for runs explorer list

## TypeScript

- **Strict mode**: Enabled (`strict: true` in tsconfig.json)
- **Undocumented `any`**: 0

## Cross-Platform

| Platform | Dimensions | Status |
|----------|-----------|--------|
| Web desktop | 1440x900 | Verified (Playwright) |
| iPhone (mobile) | 375x812 | Responsive design via `useBreakpoint()` |
| Android (mobile) | 412x915 | Responsive design via `useBreakpoint()` |

Responsive breakpoints:
- Mobile (<768px): Single column, bottom tabs
- Tablet (768-1023px): 2 columns, collapsed sidebar
- Desktop (>=1024px): Full columns, expanded sidebar
