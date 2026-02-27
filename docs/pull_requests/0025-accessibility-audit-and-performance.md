# 0025 — Accessibility Audit & Performance Optimization

> Final quality pass: WCAG AA color contrast, keyboard navigation, screen reader support, touch target audit, performance optimization (memoization, virtualization, bundle), cross-platform verification, and quality gate documentation.

---

## Prior State

All features, tests, and animations are complete. Accessibility attributes may be inconsistent. Memoization may be missing on expensive derived computations.

## Target State

The dashboard passes a WCAG AA audit, keyboard navigation works end-to-end on web, all touch targets are >=44×44 on mobile, initial load <2.5s, filter change <1s perceived, and `docs/quality-gates.md` documents all results.

---

## Audit & Fix Checklist

### Color Contrast (WCAG AA)

| Surface | Text | Required Ratio | Action |
|---------|------|---------------|--------|
| `#0a0a0a` canvas | `#e5e5e5` primary | 4.5:1 ✓ (16.5:1) | Verify |
| `#1a1a1a` surface | `#e5e5e5` primary | 4.5:1 ✓ (13.2:1) | Verify |
| `#1a1a1a` surface | `#a3a3a3` secondary | 4.5:1 ✓ (7.3:1) | Verify |
| `#1a1a1a` surface | `#7a7a7a` tertiary | 4.5:1 — borderline | Verify; bump to `#8a8a8a` if needed |
| `#262626` elevated | `#a3a3a3` secondary | 4.5:1 ✓ (5.8:1) | Verify |
| Status badge backgrounds | White text | 3:1 minimum | Verify each color |

Fix any that fail by adjusting the lighter/darker value.

### Keyboard Navigation (web)

Full tab order:

```
1. Sidebar toggle → sidebar nav items (arrow keys between items)
2. Top bar: search → time range → filter button → theme toggle
3. Content: KPI cards (Tab between, Enter to drill-down)
4. Charts (Tab to card, not into chart internals)
5. Table: headers (Enter to sort), rows (Enter to open detail)
6. Pagination controls
```

Required keyboard support:
- `Tab` / `Shift+Tab`: navigate between interactive elements.
- `Enter` / `Space`: activate buttons, links, pressable cards.
- `ArrowUp` / `ArrowDown`: navigate sidebar items.
- `Escape`: close filter popovers, modals, sheets.
- `[` / `]`: sidebar toggle.

### Screen Reader Support

Add/verify on each component:

| Component | Attribute |
|-----------|-----------|
| `KpiCard` | `accessibilityLabel="Active Users: 1,247, up 12.3 percent"` |
| `StatusBadge` | `accessibilityLabel="Status: Failed"` |
| `SortableHeader` | `aria-sort="ascending"` / `"descending"` / `"none"` |
| `ChartCard` | `accessibilityLabel="Runs Over Time chart showing 24 hour trend"` |
| Sidebar icon-only | `accessibilityLabel={label}` on every nav item |
| `DeltaIndicator` | `accessibilityLabel="up 12.3 percent"` |
| Toggle switches | `accessibilityRole="switch"`, `accessibilityState={{ checked }}` |

### Touch Targets (mobile)

Verify >=44×44 on:
- Sidebar nav items (expanded + collapsed)
- Bottom tab icons
- KPI cards (pressable)
- Table rows (pressable)
- Pagination buttons
- Filter chips (dismiss button)
- Toggle switches
- All buttons

Fix any undersized targets by adding padding or minHeight/minWidth.

### Performance Optimization

**Memoization:**
- Wrap all view model mappers in `useMemo` with correct dependency arrays.
- Memoize sidebar nav items list.
- Memoize table column definitions.

**Virtualization:**
- Verify `@shopify/flash-list` `estimatedItemSize` is set correctly in runs explorer.
- Verify scroll performance on 1000+ rows.

**Chart performance:**
- Verify charts don't fully remount on filter changes (check Victory `animate` prop behavior).
- Avoid re-creating chart data arrays on every render.

**Bundle:**
- Verify no duplicate library versions (`npm ls`).
- Verify tree-shaking of unused d3 modules.

**Benchmarks:**
- Initial load (web, production build): target <2.5s.
- Filter change re-render: target <1s perceived update.

### Cross-Platform Verification

Test on these viewports:

| Platform | Dimensions |
|----------|-----------|
| Web desktop | 1440×900 |
| iPhone (mobile) | 375×812 |
| Android (mobile) | 412×915 |

Per viewport:
- Navigation is usable (sidebar/bottom tabs).
- KPI cards readable.
- Charts legible (labels not truncated).
- Tables degrade to list pattern on mobile.
- Touch targets meet minimum.

### Documentation

Create `docs/quality-gates.md`:

```markdown
# Quality Gate Results

## Coverage
- Metrics utilities: XX% (target >=95%)
- Services/hooks: XX% (target >=90%)
- UI/components: XX% (target >=80%)

## E2E
- 5/5 Playwright specs pass

## Accessibility
- WCAG AA contrast: PASS/FAIL (list any fixes)
- Keyboard navigation: PASS/FAIL
- Screen reader: PASS/FAIL
- Touch targets: PASS/FAIL

## Performance
- Initial load: X.Xs (target <2.5s)
- Filter change: X.Xs (target <1s)

## TypeScript
- Strict mode: PASS
- Undocumented `any`: 0

## Cross-Platform
- Web 1440×900: PASS
- iPhone 375×812: PASS
- Android 412×915: PASS
```

---

## Depends On

All previous PRs (0001–0024).

## Done When

- All text passes WCAG AA contrast (4.5:1 normal, 3:1 large).
- Tab order: sidebar → top bar → content → tables works logically.
- Escape closes popovers/sheets.
- All icon-only controls have accessible labels.
- KPI cards announce value + delta to screen readers.
- All mobile touch targets >=44×44.
- View model mappers are memoized.
- Charts don't remount on minor filter changes.
- Initial load <2.5s, filter change <1s.
- Verified on web 1440×900, iPhone 375×812, Android 412×915.
- `docs/quality-gates.md` documents all results.
- `npx tsc --noEmit` passes with zero undocumented `any`.
- `npm test` passes with all coverage gates met.
- `npx playwright test` passes.
