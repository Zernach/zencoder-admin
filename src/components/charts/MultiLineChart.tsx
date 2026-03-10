import React, { useCallback, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { scaleLinear, scaleTime } from "d3-scale";
import { curveMonotoneX, line } from "d3-shape";
import type { TimeSeriesPoint } from "@/features/analytics/types";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { fontFamilies, radius, spacing } from "@/theme/tokens";

export interface MultiLineChartSeries {
  label: string;
  data: TimeSeriesPoint[];
  color?: string;
}

export interface MultiLineChartProps {
  series: MultiLineChartSeries[];
  height?: number;
  showGrid?: boolean;
  xTickCount?: number;
  yTickCount?: number;
}

const MARGIN = { top: 8, right: 8, bottom: 24, left: 44 };
const TOOLTIP_WIDTH = 200;
const TOOLTIP_OFFSET = 10;
const TOOLTIP_HORIZONTAL_PADDING = 8;
const LEGEND_DOT_SIZE = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const MultiLineChart = React.memo(function MultiLineChart({
  series,
  height = 200,
  showGrid = true,
  xTickCount = 6,
  yTickCount = 5,
}: MultiLineChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const defaultColors = [theme.data.seriesPrimary, theme.data.seriesSecondary, theme.data.seriesTertiary];
  const [containerWidth, setContainerWidth] = useState(300);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const handleLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) =>
      setContainerWidth(event.nativeEvent.layout.width),
    [],
  );

  const chartData = useMemo(() => {
    const nonEmpty = series.filter((s) => s.data.length > 0);
    if (nonEmpty.length === 0) return null;

    const width = containerWidth;
    const innerW = Math.max(1, width - MARGIN.left - MARGIN.right);
    const innerH = Math.max(1, height - MARGIN.top - MARGIN.bottom);

    const allDates = nonEmpty.flatMap((s) => s.data.map((p) => new Date(p.tsIso)));
    const allValues = nonEmpty.flatMap((s) => s.data.map((p) => p.value));

    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const yMax = Math.max(...allValues, 1);

    const xScale = scaleTime().domain([minDate, maxDate]).range([0, innerW]);
    const yScale = scaleLinear().domain([0, yMax]).range([innerH, 0]).nice();

    const lineGenerator = line<TimeSeriesPoint>()
      .x((point) => xScale(new Date(point.tsIso)))
      .y((point) => yScale(point.value))
      .curve(curveMonotoneX);

    const seriesData = nonEmpty.map((s, index) => {
      const color = s.color ?? defaultColors[index % defaultColors.length]!;
      const points = s.data.map((point, pointIndex) => {
        const ts = new Date(point.tsIso);
        return {
          index: pointIndex,
          ts,
          value: point.value,
          x: xScale(ts),
          y: yScale(point.value),
        };
      });

      return {
        label: s.label,
        color,
        path: lineGenerator(s.data) ?? "",
        points,
      };
    });

    const maxPoints = Math.max(...nonEmpty.map((s) => s.data.length));

    return {
      width,
      innerW,
      innerH,
      yTicks: yScale.ticks(yTickCount),
      xTicks: xScale.ticks(Math.min(maxPoints, Math.max(2, xTickCount))),
      xScale,
      yScale,
      seriesData,
    };
  }, [containerWidth, series, height, xTickCount, yTickCount, defaultColors]);

  const formatYTickLabel = useCallback(
    (tick: number): string => formatCompactNumber(tick),
    [],
  );

  const activePointData = useMemo(() => {
    if (activePointIndex == null || !chartData) return null;

    const values = chartData.seriesData.map((s) => {
      const point = s.points[activePointIndex];
      return {
        label: s.label,
        color: s.color,
        value: point?.value ?? 0,
        x: point?.x ?? 0,
        y: point?.y ?? 0,
      };
    });

    const firstPoint = chartData.seriesData[0]?.points[activePointIndex];
    if (!firstPoint) return null;

    const dateLabel = firstPoint.ts.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return { dateLabel, values, x: firstPoint.x };
  }, [activePointIndex, chartData]);

  const tooltipHeight = useMemo(() => {
    if (!activePointData) return 0;
    return 22 + activePointData.values.length * 20 + 12;
  }, [activePointData]);

  const tooltipPosition = useMemo(() => {
    if (!activePointData || !chartData) return null;

    const maxLeft = Math.max(
      TOOLTIP_HORIZONTAL_PADDING,
      chartData.width - TOOLTIP_WIDTH - TOOLTIP_HORIZONTAL_PADDING,
    );
    const left = clamp(
      MARGIN.left + activePointData.x - TOOLTIP_WIDTH / 2,
      TOOLTIP_HORIZONTAL_PADDING,
      maxLeft,
    );
    const topCandidate = MARGIN.top - TOOLTIP_OFFSET - tooltipHeight;
    const top = topCandidate >= 0 ? topCandidate : MARGIN.top + TOOLTIP_OFFSET;

    return { left, top };
  }, [activePointData, chartData, tooltipHeight]);

  const setActivePointFromLocation = useCallback(
    (locationX: number): void => {
      if (!chartData || chartData.seriesData.length === 0) return;

      const referencePoints = chartData.seriesData[0]!.points;
      if (referencePoints.length === 0) return;

      const clampedLocationX = clamp(locationX, 0, chartData.innerW);
      let closestPointIndex = 0;
      let smallestDistance = Math.abs(referencePoints[0]!.x - clampedLocationX);

      for (let index = 1; index < referencePoints.length; index += 1) {
        const distance = Math.abs(referencePoints[index]!.x - clampedLocationX);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestPointIndex = index;
        }
      }

      setActivePointIndex((currentIndex) =>
        currentIndex === closestPointIndex ? currentIndex : closestPointIndex,
      );
    },
    [chartData],
  );

  const handleChartInteractionStart = useCallback(
    (event: GestureResponderEvent): void => {
      setActivePointFromLocation(event.nativeEvent.locationX);
    },
    [setActivePointFromLocation],
  );

  const handleChartInteractionMove = useCallback(
    (event: GestureResponderEvent): void => {
      setActivePointFromLocation(event.nativeEvent.locationX);
    },
    [setActivePointFromLocation],
  );

  const handleChartInteractionEnd = useCallback((): void => {
    setActivePointIndex(null);
  }, []);

  const handleMouseMove = useCallback(
    (event: { nativeEvent: { offsetX: number } }): void => {
      setActivePointFromLocation(event.nativeEvent.offsetX);
    },
    [setActivePointFromLocation],
  );

  const handleMouseLeave = useCallback((): void => {
    setActivePointIndex(null);
  }, []);

  if (!chartData) return null;

  const {
    width,
    innerW,
    innerH,
    yTicks,
    xTicks,
    xScale,
    yScale,
    seriesData,
  } = chartData;

  const isWeb = Platform.OS === "web";

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Legend */}
      <View style={styles.legend}>
        {seriesData.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.chartSurface, { height }]}>
        <Svg width={width} height={height}>
          {showGrid &&
            yTicks.map((tick) => (
              <Line
                key={`grid-${tick}`}
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={MARGIN.top + yScale(tick)}
                y2={MARGIN.top + yScale(tick)}
                stroke={theme.border.subtle}
                strokeDasharray="4,4"
              />
            ))}

          {/* Lines */}
          {seriesData.map((s) => (
            <Path
              key={s.label}
              d={s.path}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              transform={`translate(${MARGIN.left},${MARGIN.top})`}
            />
          ))}

          {/* Active point indicators */}
          {activePointData ? (
            <>
              <Line
                testID="multi-line-chart-active-guide"
                x1={MARGIN.left + activePointData.x}
                x2={MARGIN.left + activePointData.x}
                y1={MARGIN.top}
                y2={MARGIN.top + innerH}
                stroke={theme.border.default}
                strokeWidth={1}
                strokeDasharray="2,3"
              />
              {activePointData.values.map((v) => (
                <Circle
                  key={v.label}
                  cx={MARGIN.left + v.x}
                  cy={MARGIN.top + v.y}
                  r={4}
                  fill={theme.bg.surface}
                  stroke={v.color}
                  strokeWidth={2}
                />
              ))}
            </>
          ) : null}

          {/* Y-axis labels */}
          {yTicks.map((tick) => (
            <SvgText
              key={`y-${tick}`}
              x={MARGIN.left - 6}
              y={MARGIN.top + yScale(tick) + 4}
              fontFamily={fontFamilies.sans}
              fontSize={10}
              fontWeight="600"
              fill={theme.text.tertiary}
              textAnchor="end"
            >
              {formatYTickLabel(tick)}
            </SvgText>
          ))}

          {/* X-axis labels */}
          {xTicks.map((tick) => (
            <SvgText
              key={`x-${tick.getTime()}`}
              x={MARGIN.left + xScale(tick)}
              y={height - 4}
              fontFamily={fontFamilies.sans}
              fontSize={10}
              fontWeight="600"
              fill={theme.text.tertiary}
              textAnchor="middle"
            >
              {tick.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </SvgText>
          ))}
        </Svg>

        {/* Interaction layer */}
        <View
          testID="multi-line-chart-interaction-layer"
          pointerEvents="auto"
          style={[
            styles.interactionLayer,
            {
              top: MARGIN.top,
              left: MARGIN.left,
              width: innerW,
              height: innerH,
            },
          ]}
          {...(isWeb
            ? {
                onMouseMove: handleMouseMove,
                onMouseLeave: handleMouseLeave,
              }
            : {
                onStartShouldSetResponder: () => true,
                onMoveShouldSetResponder: () => true,
                onResponderGrant: handleChartInteractionStart,
                onResponderMove: handleChartInteractionMove,
                onResponderRelease: handleChartInteractionEnd,
                onResponderTerminate: handleChartInteractionEnd,
              })}
        />

        {/* Tooltip */}
        {activePointData && tooltipPosition ? (
          <View
            testID="multi-line-chart-hover-tooltip"
            pointerEvents="none"
            style={[
              styles.tooltip,
              {
                left: tooltipPosition.left,
                top: tooltipPosition.top,
                width: TOOLTIP_WIDTH,
                backgroundColor: theme.bg.surface,
                borderColor: theme.border.default,
              },
            ]}
          >
            <Text style={[styles.tooltipDate, { color: theme.text.tertiary }]}>
              {activePointData.dateLabel}
            </Text>
            {activePointData.values.map((v) => (
              <View key={v.label} style={styles.tooltipValueRow}>
                <View style={styles.tooltipLabelRow}>
                  <View style={[styles.tooltipDot, { backgroundColor: v.color }]} />
                  <Text style={[styles.tooltipLabel, { color: theme.text.tertiary }]}>{v.label}</Text>
                </View>
                <Text style={[styles.tooltipValue, { color: theme.text.primary }]}>
                  {Number.isInteger(v.value)
                    ? v.value.toLocaleString("en-US")
                    : v.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[12],
    marginBottom: spacing[8],
    paddingHorizontal: spacing[4],
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  legendDot: {
    width: LEGEND_DOT_SIZE,
    height: LEGEND_DOT_SIZE,
    borderRadius: LEGEND_DOT_SIZE / 2,
  },
  legendLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    fontWeight: "600",
  },
  chartSurface: {
    width: "100%",
    position: "relative",
  },
  interactionLayer: {
    position: "absolute",
  },
  tooltip: {
    position: "absolute",
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[6],
    borderRadius: radius.md,
    borderWidth: 1,
    zIndex: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  tooltipDate: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "600",
  },
  tooltipValueRow: {
    marginTop: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[8],
  },
  tooltipLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  tooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tooltipLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "500",
  },
  tooltipValue: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    fontWeight: "600",
  },
});
