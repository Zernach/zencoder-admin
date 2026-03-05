# 0037 — TypeScript Type DRYness Cleanup

## Goal

Consolidate repeated inline type literals into shared type aliases and re-export existing interfaces to eliminate duplication across the codebase.

## Changes

### 1. New shared types in `contracts.ts`

| Type | Definition | Replaces |
|------|-----------|----------|
| `DeltaPolarity` | `"positive-good" \| "negative-good"` | Inline literals in KpiCard, DeltaIndicator, overviewMappers |
| `Severity` | `"HIGH" \| "MEDIUM" \| "LOW"` | Inline literals in PolicyViolationRow, StatusBadge |
| `SortDirection` | `"asc" \| "desc"` | Local type in DataTable, inline in SortableHeader |
| `Option<T>` | `{ label: string; value: T }` | Inline object types in FilterBar |
| `FilterChip` | `{ key: string; label: string; onRemove: () => void }` | Duplicate definitions in FilterChips.tsx and FilterBar.tsx |

### 2. Consumer updates

- `DeltaIndicator.tsx` — import `DeltaPolarity`
- `KpiCard.tsx` — import `DeltaPolarity`
- `overviewMappers.ts` — import `DeltaPolarity`
- `DataTable.tsx` — import `SortDirection`, remove local definition
- `SortableHeader.tsx` — import `SortDirection`
- `StatusBadge.tsx` — import `Severity`
- `FilterBar.tsx` — import `Option`, `FilterChip`
- `FilterChips.tsx` — import `FilterChip` from contracts, remove local definition
- `CardGrid.tsx` — extract inline props to named `StaggerChildProps` interface

### 3. Non-goals

- No logic changes
- No new features
- No component behavior changes
