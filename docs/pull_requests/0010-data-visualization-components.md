# 0010 — Data Visualization Components

> Build the chart library using Victory Native + d3: `TrendChart` (line/area), `BreakdownChart` (bar), `DonutChart` (pie), `DistributionChart` (histogram), `SparkLine` (inline), and `ChartCard` (wrapper with loading/error states).

---

## Prior State

Victory Native, d3-scale, d3-shape, d3-array are installed (PR 0001). Theme tokens available (PR 0002). Type contracts define `TimeSeriesPoint` and `KeyValueMetric` (PR 0003). No chart components exist.

## Target State

Screens compose `<ChartCard title="Runs Over Time"><TrendChart data={runsTrend} variant="area" /></ChartCard>` for consistent, theme-aware, responsive charts with built-in loading/error fallbacks.

---

## Files to Create

### `src/components/charts/TrendChart.tsx`

```tsx
interface TrendChartProps {
  data: TimeSeriesPoint[];
  variant: "line" | "area";
  color?: string;           // default: accent #30a8dc
  fillOpacity?: number;     // area fill, default: 0.15
  height?: number;          // default: 200
  xLabel?: string;
  yLabel?: string;
  showGrid?: boolean;       // default: true
}
```

Implementation:
- `VictoryChart` + `VictoryLine` or `VictoryArea` + `VictoryAxis`.
- X-axis: `d3-scale` `scaleTime` for tick generation. Format: `HH:mm` for ≤24h ranges, `MMM dd` for longer.
- Y-axis: `d3-scale` `scaleLinear`, tick format uses `formatCompactNumber`.
- Grid lines: `stroke: theme.border.subtle`, `strokeDasharray: "4,4"`.
- Responsive: fills container width via `VictoryChart` `containerComponent={<VictoryResponsiveContainer />}` or manual `onLayout`.
- Theme-aware: axis labels `text.tertiary`, grid `border.subtle`, data line `accent` or custom color.

### `src/components/charts/BreakdownChart.tsx`

```tsx
interface BreakdownChartProps {
  data: KeyValueMetric[];
  variant: "bar" | "horizontal-bar";
  color?: string;           // default: accent
  height?: number;          // default: 200
  showValues?: boolean;     // show value annotations, default: true
}
```

- `VictoryBar` with category axis.
- Sorted by value descending.
- Value annotations on or beside each bar.
- Data palette: up to 8 colors from `theme.data.*` tokens for multi-color mode, or single accent.
- Horizontal variant for ranking charts (agent performance, token usage by agent).

### `src/components/charts/DonutChart.tsx`

```tsx
interface DonutChartProps {
  data: KeyValueMetric[];
  centerLabel?: string;     // "Total"
  centerValue?: string;     // "$47,823"
  height?: number;          // default: 220
}
```

- `VictoryPie` with `innerRadius` for donut hole.
- Center text overlay (label + value).
- Segment colors from data palette (up to 8 distinct).
- Percentage labels on segments > 5%.
- Legend below: color swatch + label + percentage per segment.

### `src/components/charts/DistributionChart.tsx`

```tsx
interface DistributionChartProps {
  data: number[];           // raw values to bin
  bins?: number;            // default: 10
  xLabel?: string;
  height?: number;          // default: 200
  color?: string;
}
```

- `d3-array` `bin()` to compute histogram buckets.
- `VictoryBar` rendering the bin counts.
- X-axis: bin range labels. Y-axis: count.
- Use case: run duration distribution, token usage distribution.

### `src/components/charts/SparkLine.tsx`

```tsx
interface SparkLineProps {
  data: number[];
  color?: string;           // default: accent
  width?: number;           // default: 80
  height?: number;          // default: 24
}
```

- Minimal SVG path (react-native-svg `Path`).
- No axes, no labels, no grid.
- For embedding in table cells or KPI card corners.
- `d3-scale` `scaleLinear` for x/y mapping, `d3-shape` `line()` for path generation.

### `src/components/charts/ChartCard.tsx`

```tsx
interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  children: React.ReactNode;  // the chart
}
```

- Surface card styling: `theme.surface` background, `border.subtle`, `radius.md`.
- Title: `typography.cardTitle`.
- When `loading`: renders `<LoadingSkeleton variant="chart" />` instead of children.
- When `error`: renders `<ErrorState message={error} onRetry={onRetry} />`.
- Padding: `space.4` (16).

### Data Palette (constant)

```ts
export const DATA_PALETTE = [
  "#30a8dc", // accent blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
] as const;
```

### `src/components/charts/index.ts`

Barrel export of all chart components + `DATA_PALETTE`.

---

## Depends On

- **PR 0001** — Victory Native, d3, react-native-svg.
- **PR 0002** — theme tokens.
- **PR 0003** — `TimeSeriesPoint`, `KeyValueMetric`.
- **PR 0006** — `formatCompactNumber` (axis labels).
- **PR 0009** — `LoadingSkeleton`, `ErrorState` (used in `ChartCard`).

## Done When

- `TrendChart` renders a line or area chart from `TimeSeriesPoint[]` data.
- `BreakdownChart` renders sorted bars with category labels.
- `DonutChart` renders pie segments with legend and center label.
- `DistributionChart` bins raw numbers into a histogram.
- `SparkLine` renders minimal inline trend (no axes).
- All charts use theme-aware colors (dark background, light text, accent data).
- Charts fill container width and respect configured height.
- `ChartCard` shows loading skeleton when `loading` is true.
- `ChartCard` shows error state with retry when `error` is set.
- Charts render on web, iOS, and Android.
- Labels remain legible on mobile.
