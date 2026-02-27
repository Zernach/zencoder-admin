# 0024 — Motion, Animation & Micro-interactions

> Add 60fps animations using `react-native-reanimated` and `moti`: KPI number cross-fade, chart reveal animations, filter change data transitions, page transitions, skeleton pulse, card hover, stagger entrances, and reduced-motion support.

---

## Prior State

All screens render with correct data. Motion tokens exist in `src/theme/motion.ts` (PR 0002). Reanimated and moti are installed (PR 0001). Sidebar basic animation exists (PR 0012). No polished micro-interactions.

## Target State

The dashboard feels alive. Numbers cross-fade on filter change. Charts reveal on mount. Skeletons pulse. Cards respond to hover. Pages transition smoothly. Users who prefer reduced motion get a stripped-down experience.

---

## Files to Create / Modify

### `src/hooks/useReducedMotion.ts` (create)

```ts
import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

export function useReducedMotion(): boolean {
  // iOS/Android: AccessibilityInfo.isReduceMotionEnabled()
  // Web: matchMedia("(prefers-reduced-motion: reduce)")
  // Returns true if user prefers reduced motion.
}
```

### `src/components/dashboard/KpiCard.tsx` (modify)

Add number transition:
- On value change: previous value fades out (opacity 1→0) + translateY(0→-8px), new value fades in (opacity 0→1) + translateY(8px→0).
- Duration: `motion.base` (180ms).
- Use `moti`'s `AnimatePresence` + `MotiView`.
- Reduced motion: instant swap, no animation.

### `src/components/charts/TrendChart.tsx` (modify)

Chart reveal on mount:
- Line/area draws from left to right using `VictoryAnimation` or Reanimated `withTiming`.
- Duration: `motion.slow` (260ms).
- Only on initial mount (not on filter-change data updates).
- Reduced motion: render immediately.

### `src/components/charts/BreakdownChart.tsx` (modify)

Bar grow animation:
- Bars grow from zero height to final, staggered 80ms per bar.
- Duration per bar: `motion.fast` (120ms).
- Reduced motion: render at full height immediately.

### `src/components/charts/DonutChart.tsx` (modify)

Segment animation:
- Segments animate from 0° to final angle.
- Duration: `motion.slow` (260ms).
- Reduced motion: render immediately.

### `src/components/dashboard/LoadingSkeleton.tsx` (modify)

Pulse animation:
- Opacity: 0.4 → 1.0 → 0.4 repeating.
- Cycle: 1.5s.
- Reanimated: `withRepeat(withTiming(1, { duration: 750 }), -1, true)`.
- Reduced motion: static 0.6 opacity, no animation.

### `src/components/dashboard/CardGrid.tsx` (modify)

Stagger entrance:
- Children enter with `moti` stagger: 50ms delay between cards.
- Each card: fade in (opacity 0→1) + translateY(12→0).
- Duration: `motion.base` (180ms).
- Reduced motion: render all immediately.

### `src/components/shell/Sidebar.tsx` (modify)

Refine label animation:
- Label opacity: 0 → 1 (expanding), 1 → 0 (collapsing), synchronized with width.
- Label translateX: -8 → 0 (expanding).
- Use Reanimated `interpolate` on the shared width value.

### `src/app/(dashboard)/_layout.tsx` (modify)

Page transitions:
- Desktop: 180ms content opacity (0.8→1) + translateY(8→0).
- Mobile: rely on native stack transition (no custom animation).
- Reduced motion: instant swap.

### Filter Change Data Transition (hooks + components)

Strategy:
- `keepPreviousData: true` in React Query keeps old data visible.
- If refetch latency > 150ms, fade a skeleton overlay at 120ms opacity transition.
- New data arrival: cross-fade previous → new content at `motion.base` (180ms).
- Implementation: wrapper component `<DataTransition loading={isRefetching}>` around data sections.

### Card Hover State (web only)

- `KpiCard`, `ChartCard`: on hover, background shifts from `surface` to `elevated` at 120ms.
- Subtle border color shift to accent at 10% opacity.
- Use `onHoverIn` / `onHoverOut` (React Native Web).

---

## Depends On

- **PR 0001** — `react-native-reanimated`, `moti`. **PR 0002** — motion tokens.
- **PR 0009** — KpiCard, LoadingSkeleton. **PR 0010** — charts. **PR 0012** — Sidebar.

## Done When

- KPI numbers cross-fade on value change (180ms).
- TrendChart line draws left→right on mount (260ms).
- BreakdownChart bars grow with stagger (120ms per bar).
- DonutChart segments animate 0°→final (260ms).
- Skeleton pulses at 1.5s cycle.
- Cards stagger entrance at 50ms intervals.
- Sidebar labels fade/slide synchronized with width.
- Page transitions: 180ms fade + translateY on desktop.
- Card hover: 120ms background shift on web.
- `useReducedMotion()` returns true when preference set.
- Reduced motion disables all non-essential transforms.
- All animations run at 60fps (no main-thread jank).
