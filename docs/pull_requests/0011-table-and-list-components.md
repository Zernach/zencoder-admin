# 0011 — Table & List Components

> Build sortable, paginated `DataTable` (web/tablet), virtualized `DataList` (mobile via FlashList), `PaginationControls`, `SortableHeader`, `FilterChips`, and a `ResponsiveTable` wrapper that auto-switches at the mobile breakpoint.

---

## Prior State

`@shopify/flash-list` and `react-native-gesture-handler` are installed (PR 0001). `StatusBadge` and `LoadingSkeleton` exist (PR 0009). No table components exist.

## Target State

Screens compose `<ResponsiveTable columns={cols} data={rows} />` and get a dense sortable table on web, a virtualized card list on mobile, with pagination, sort indicators, and filter chips.

---

## Files to Create

### `src/components/tables/DataTable.tsx`

```tsx
interface ColumnDef<T> {
  key: string;
  header: string;
  width?: number | string;     // fixed or flex
  sortable?: boolean;          // default: false
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;  // custom cell renderer
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowPress?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
}
```

Visual spec:
- Header row: `theme.elevated` background, `text.secondary`, font-weight 600.
- Body rows: alternating `transparent` / `theme.surface` subtle stripe.
- Row hover (web): 120ms `theme.elevated` background shift.
- Sortable headers: clickable, arrow indicator (▲/▼) on active column.
- `aria-sort` attribute on sorted header (web a11y).
- Custom cell renderers for `StatusBadge`, formatted currency, percentages.
- When `loading`: render `<LoadingSkeleton variant="table" rows={5} />`.
- When `data.length === 0`: render `<EmptyState message={emptyMessage} />`.

### `src/components/tables/DataList.tsx`

```tsx
interface DataListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  onItemPress?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
  estimatedItemSize?: number;  // default: 72
}
```

- Built on `@shopify/flash-list` for virtualized performance.
- Each item: pressable card with progressive disclosure pattern.
- Tappable → fires `onItemPress`.

### `src/components/tables/PaginationControls.tsx`

```tsx
interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];  // default: [10, 25, 50, 100]
}
```

- Display: "Showing 1–25 of 1,247".
- Previous/Next buttons (disabled at boundaries).
- Optional page size selector.

### `src/components/tables/SortableHeader.tsx`

```tsx
interface SortableHeaderProps {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onPress: () => void;
}
```

- Arrow icon: `ChevronUp` (asc) or `ChevronDown` (desc), only when `active`.
- `aria-sort="ascending" | "descending"` when active, `aria-sort="none"` otherwise.

### `src/components/tables/FilterChips.tsx`

```tsx
interface FilterChip { key: string; label: string; onRemove: () => void; }

interface FilterChipsProps {
  chips: FilterChip[];
  onClearAll?: () => void;
}
```

- Horizontal scroll row of pill-shaped chips.
- Each chip: label + `X` dismiss button.
- "Clear All" link at end when `onClearAll` provided.

### `src/components/tables/ResponsiveTable.tsx`

```tsx
interface ResponsiveTableProps<T> extends DataTableProps<T> {
  renderListItem?: (row: T) => React.ReactNode;
  estimatedItemSize?: number;
}
```

- Desktop/Tablet (≥768): renders `<DataTable>`.
- Mobile (<768): renders `<DataList>` using `renderListItem` or a default card renderer.
- Breakpoint detection via `useBreakpoint()` (or `Dimensions` check).

### `src/components/tables/index.ts`

Barrel export.

---

## Depends On

- **PR 0001** — `@shopify/flash-list`, `react-native-gesture-handler`.
- **PR 0002** — theme tokens.
- **PR 0009** — `StatusBadge`, `LoadingSkeleton`, `EmptyState`.

## Done When

- `DataTable` renders column headers and data rows correctly.
- Clicking a sortable header calls `onSort(key)`.
- Sort indicator arrows display on the active column.
- `DataList` renders with FlashList virtualization.
- `PaginationControls` shows correct range and disables buttons at boundaries.
- `FilterChips` renders removable chips + "Clear All".
- `ResponsiveTable` renders table on desktop, list on mobile.
- Row/item press fires `onRowPress` / `onItemPress`.
- Loading and empty states work.
