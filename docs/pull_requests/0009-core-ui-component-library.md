# 0009 — Core UI Component Library

> Build the foundational reusable components every screen composes: `KpiCard`, `StatusBadge`, `DeltaIndicator`, `LoadingSkeleton`, `ErrorState`, `EmptyState`, `SectionHeader`, and `CardGrid`. Dark-theme-first, responsive, accessible.

---

## Prior State

Theme provider (PR 0002) and formatters (PR 0006) exist. No shared UI components.

## Target State

Every screen composes these primitives for consistent KPI display, state handling, and responsive layout.

---

## Files to Create

### `src/components/dashboard/KpiCard.tsx`

```tsx
interface KpiCardProps {
  title: string;                 // "Active Users"
  value: string;                 // pre-formatted: "$47,823" or "94.2%"
  delta?: number;                // raw number: 12.3 or -5.2
  deltaPolarity?: "positive-good" | "negative-good";  // default: "positive-good"
  caption?: string;              // "Daily active"
  period?: string;               // "Last 7 days"
  icon?: React.ReactNode;        // lucide icon
  onPress?: () => void;          // drill-down navigation
}
```

Visual spec:
- Background: theme `surface` (`#1a1a1a`).
- Border: 1px `border.subtle`.
- Border radius: `md` (10).
- Padding: `space.4` (16).
- Title: `typography.label`, `text.secondary`.
- Value: `typography.kpiValue`, `text.primary`, font-weight 700.
- Delta: `DeltaIndicator` sub-component.
- Caption: `typography.caption`, `text.tertiary`.
- `expo-linear-gradient` subtle top-border accent on hover/press (web).
- Pressable with `onPress` — accessible `role="button"` when pressable.

### `src/components/dashboard/DeltaIndicator.tsx`

```tsx
interface DeltaIndicatorProps {
  value: number;         // 12.3 or -5.2
  polarity?: "positive-good" | "negative-good";
}
```

- Positive + "positive-good" → green `#22c55e` + `ArrowUp` icon.
- Negative + "positive-good" → red `#ef4444` + `ArrowDown` icon.
- Inverted for "negative-good" polarity (e.g., error rate going down is good).
- Text: `formatDelta(value)` → `"+12.3%"` or `"−5.2%"`.

### `src/components/dashboard/StatusBadge.tsx`

```tsx
interface StatusBadgeProps {
  variant: "run-status" | "severity";
  status?: RunStatus;
  severity?: "HIGH" | "MEDIUM" | "LOW";
}
```

| Value | Color | Icon | Label |
|-------|-------|------|-------|
| `succeeded` | `#22c55e` success | `CheckCircle` | Success |
| `failed` | `#ef4444` error | `XCircle` | Failed |
| `running` | `#38bdf8` info | `Play` | Running |
| `queued` | `#a3a3a3` tertiary | `Clock` | Queued |
| `canceled` | `#7a7a7a` | `Slash` | Canceled |
| `HIGH` | `#ef4444` error | `AlertTriangle` | HIGH |
| `MEDIUM` | `#f59e0b` warning | `AlertCircle` | MEDIUM |
| `LOW` | `#a3a3a3` tertiary | `Info` | LOW |

Always renders **icon + text label** (never color-only — per a11y spec).

### `src/components/dashboard/LoadingSkeleton.tsx`

```tsx
interface LoadingSkeletonProps {
  variant: "kpi" | "chart" | "table" | "text";
  rows?: number;    // for table variant
  columns?: number; // for table variant
}
```

- `kpi`: rounded rect matching KpiCard dimensions.
- `chart`: larger rounded rect matching ChartCard dimensions.
- `table`: header row + N body rows.
- `text`: 2–3 lines of varying width.
- Pulse animation: opacity 0.4 → 1.0 → 0.4, 1.5s cycle (Reanimated `withRepeat`).
- Background: theme `elevated` (`#262626`).

### `src/components/dashboard/ErrorState.tsx`

```tsx
interface ErrorStateProps {
  message?: string;   // default: "Something went wrong. Please try again."
  onRetry: () => void;
}
```

- Centered layout with `AlertTriangle` icon (error color).
- Message text: neutral language, no stack traces.
- "Retry" button: accent color, accessible label.
- Preserves parent container dimensions (no layout shift).

### `src/components/dashboard/EmptyState.tsx`

```tsx
interface EmptyStateProps {
  message?: string;  // default: "No data matches your current filters."
  activeFilters?: string[];   // ["Team: Platform", "Provider: codex"]
  onClearFilters?: () => void;
}
```

- Centered with `Inbox` icon (tertiary color).
- Lists active filter names as chips/tags.
- "Clear Filters" button when `onClearFilters` provided.

### `src/components/dashboard/SectionHeader.tsx`

```tsx
interface SectionHeaderProps {
  title: string;       // "Adoption & Throughput"
  subtitle?: string;
  action?: React.ReactNode;  // e.g., "View All" link
}
```

- Title: `typography.sectionTitle`.
- Subtitle: `typography.body`, `text.secondary`.
- Action rendered at far right.
- Bottom margin: `space.4` (16).

### `src/components/dashboard/CardGrid.tsx`

```tsx
interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6;   // default: 4
  gap?: number;                // default: 16
}
```

Responsive behavior:
- **Desktop** (≥1024): requested columns.
- **Tablet** (768–1023): `Math.min(columns, 2)`.
- **Mobile** (<768): single column stack.
- Uses `useBreakpoint()` from PR 0012 (or inline `Dimensions` check for now).

### `src/components/dashboard/index.ts`

Barrel export of all components.

---

## Depends On

- **PR 0002** — theme tokens (colors, typography, spacing, radius).
- **PR 0006** — `formatDelta`, `formatCurrency`, etc.

## Done When

- `KpiCard` renders title, formatted value, delta with correct arrow + color, and caption.
- Positive delta → green arrow-up. Negative delta → red arrow-down.
- `StatusBadge` renders icon + text for every `RunStatus` and severity value.
- `LoadingSkeleton` pulse animation is visible.
- `ErrorState` shows retry button that calls `onRetry`.
- `EmptyState` shows active filter list and "Clear Filters" action.
- `CardGrid` renders 4 columns on desktop, 2 on tablet, 1 on mobile.
- All components respect dark theme tokens.
- Minimum 44×44 touch targets on pressable elements.
