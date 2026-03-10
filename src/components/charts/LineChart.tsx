import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { scaleLinear, scaleTime } from "d3-scale";
import { area, curveMonotoneX, line } from "d3-shape";
import type { TimeSeriesPoint } from "@/features/analytics/types";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { fontFamilies, radius, spacing } from "@/theme/tokens";
import { ChartCardHeaderActionContext } from "./ChartCardHeaderActionContext";

export type LineChartMode = "line" | "candlestick";
export type LineChartVariant = "line" | "area" | "percentages";

export interface LineChartProps {
  data: TimeSeriesPoint[];
  variant?: LineChartVariant;
  areaFillOpacity?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  showGrid?: boolean;
  xTickCount?: number;
  yTickCount?: number;
  defaultMode?: LineChartMode;
  showModeToggle?: boolean;
}

const MARGIN = { top: 8, right: 8, bottom: 24, left: 44 };
const MIN_CANDLE_WIDTH = 4;
const MAX_CANDLE_WIDTH = 14;
const MIN_CANDLE_BODY_HEIGHT = 1;
const TOOLTIP_WIDTH = 178;
const TOOLTIP_HEIGHT = 58;
const TOOLTIP_OFFSET = 10;
const TOOLTIP_HORIZONTAL_PADDING = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatDetailedValue(value: number, variant: LineChartVariant): string {
  if (variant === "percentages") {
    return `${value.toFixed(3)} (${(value * 100).toFixed(1)}%)`;
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString("en-US");
  }

  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const LineChart = React.memo(function LineChart({
  data,
  variant = "line",
  areaFillOpacity = 0.16,
  height = 200,
  showGrid = true,
  xTickCount = 6,
  yTickCount = 5,
  defaultMode = "line",
  showModeToggle = true,
}: LineChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const chartCardHeaderActionContext = useContext(ChartCardHeaderActionContext);
  const lineStrokeColor = theme.state.success;
  const isPercentagesVariant = variant === "percentages";
  const shouldRenderArea = variant === "area";
  const isInsideChartCard = chartCardHeaderActionContext !== null;
  const [containerWidth, setContainerWidth] = useState(300);
  const [chartMode, setChartMode] = useState<LineChartMode>(defaultMode);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const handleLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) =>
      setContainerWidth(event.nativeEvent.layout.width),
    [],
  );

  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const width = containerWidth;
    const innerW = Math.max(1, width - MARGIN.left - MARGIN.right);
    const innerH = Math.max(1, height - MARGIN.top - MARGIN.bottom);

    const dates = data.map((point) => new Date(point.tsIso));
    const values = data.map((point) => point.value);
    const xScale = scaleTime()
      .domain([dates[0]!, dates[dates.length - 1]!])
      .range([0, innerW]);
    const yMax = Math.max(...values, 1);
    const yDomain: [number, number] = isPercentagesVariant ? [0, 1] : [0, yMax];
    const yScale = scaleLinear().domain(yDomain).range([innerH, 0]);

    if (isPercentagesVariant) {
      yScale.clamp(true);
    } else {
      yScale.nice();
    }

    const lineGenerator = line<TimeSeriesPoint>()
      .x((point) => xScale(new Date(point.tsIso)))
      .y((point) => yScale(point.value))
      .curve(curveMonotoneX);

    const areaGenerator = area<TimeSeriesPoint>()
      .x((point) => xScale(new Date(point.tsIso)))
      .y0(innerH)
      .y1((point) => yScale(point.value))
      .curve(curveMonotoneX);

    const candles = data.map((point, index) => {
      const open = index === 0 ? point.value : data[index - 1]!.value;
      const close = point.value;
      return {
        ts: new Date(point.tsIso),
        open,
        close,
        high: Math.max(open, close),
        low: Math.min(open, close),
      };
    });

    const candleBodyWidth = Math.max(
      MIN_CANDLE_WIDTH,
      Math.min(MAX_CANDLE_WIDTH, innerW / Math.max(candles.length * 1.8, 1)),
    );

    const linePoints = data.map((point, index) => {
      const ts = new Date(point.tsIso);
      return {
        index,
        ts,
        value: point.value,
        x: xScale(ts),
        y: yScale(point.value),
      };
    });

    return {
      width,
      innerW,
      innerH,
      linePath: lineGenerator(data) ?? "",
      areaPath: areaGenerator(data) ?? "",
      yTicks: isPercentagesVariant ? [0, 0.5, 1] : yScale.ticks(yTickCount),
      xTicks: xScale.ticks(Math.min(data.length, Math.max(2, xTickCount))),
      xScale,
      yScale,
      candles,
      candleBodyWidth,
      linePoints,
    };
  }, [containerWidth, data, height, isPercentagesVariant, xTickCount, yTickCount]);

  const linePoints = chartData?.linePoints ?? [];
  const innerW = chartData?.innerW ?? 0;
  const chartWidth = chartData?.width ?? containerWidth;

  const formatYTickLabel = useCallback(
    (tick: number): string => {
      if (isPercentagesVariant) {
        return `${Math.round(tick * 100)}%`;
      }
      return formatCompactNumber(tick);
    },
    [isPercentagesVariant],
  );

  const pointDetailLabel = useMemo(() => {
    if (isPercentagesVariant) {
      return "Normalized value";
    }
    if (shouldRenderArea) {
      return "Area value";
    }
    return "Value";
  }, [isPercentagesVariant, shouldRenderArea]);

  const activePoint = useMemo(
    () => (activePointIndex == null ? null : linePoints[activePointIndex] ?? null),
    [activePointIndex, linePoints],
  );

  const activePointDateLabel = useMemo(
    () =>
      activePoint
        ? activePoint.ts.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "",
    [activePoint],
  );

  const activePointValueLabel = useMemo(
    () => (activePoint ? formatDetailedValue(activePoint.value, variant) : ""),
    [activePoint, variant],
  );

  const tooltipPosition = useMemo(() => {
    if (!activePoint) return null;

    const maxLeft = Math.max(
      TOOLTIP_HORIZONTAL_PADDING,
      chartWidth - TOOLTIP_WIDTH - TOOLTIP_HORIZONTAL_PADDING,
    );
    const left = clamp(
      MARGIN.left + activePoint.x - TOOLTIP_WIDTH / 2,
      TOOLTIP_HORIZONTAL_PADDING,
      maxLeft,
    );
    const topCandidate = MARGIN.top + activePoint.y - TOOLTIP_HEIGHT - TOOLTIP_OFFSET;
    const top = topCandidate >= 0 ? topCandidate : MARGIN.top + activePoint.y + TOOLTIP_OFFSET;

    return { left, top };
  }, [activePoint, chartWidth]);

  const setActivePointFromLocation = useCallback(
    (locationX: number): void => {
      if (chartMode !== "line" || linePoints.length === 0) {
        return;
      }

      const clampedLocationX = clamp(locationX, 0, innerW);
      let closestPointIndex = 0;
      let smallestDistance = Math.abs(linePoints[0]!.x - clampedLocationX);

      for (let index = 1; index < linePoints.length; index += 1) {
        const distance = Math.abs(linePoints[index]!.x - clampedLocationX);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestPointIndex = index;
        }
      }

      setActivePointIndex((currentIndex) =>
        currentIndex === closestPointIndex ? currentIndex : closestPointIndex,
      );
    },
    [chartMode, innerW, linePoints],
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

  const isWeb = Platform.OS === "web";

  const modeToggle = useMemo(
    () =>
      showModeToggle ? (
        <View
          testID={isInsideChartCard ? "trend-chart-header-mode-toggle" : "trend-chart-inline-mode-toggle"}
          style={[
            styles.modeToggleContainer,
            !isInsideChartCard && styles.modeToggleInlinePosition,
            {
              borderColor: theme.border.default,
              backgroundColor: theme.bg.surfaceElevated,
            },
          ]}
        >
          <Pressable
            testID="trend-chart-mode-line"
            accessibilityRole="button"
            accessibilityLabel="Show line chart"
            onPress={() => setChartMode("line")}
            style={[
              styles.modeToggleButton,
              chartMode === "line" && {
                borderColor: theme.border.brand,
                backgroundColor: theme.bg.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.modeToggleText,
                { color: chartMode === "line" ? theme.text.primary : theme.text.secondary },
              ]}
            >
              Line
            </Text>
          </Pressable>
          <Pressable
            testID="trend-chart-mode-candlestick"
            accessibilityRole="button"
            accessibilityLabel="Show diffs chart"
            onPress={() => setChartMode("candlestick")}
            style={[
              styles.modeToggleButton,
              chartMode === "candlestick" && {
                borderColor: theme.border.brand,
                backgroundColor: theme.bg.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.modeToggleText,
                { color: chartMode === "candlestick" ? theme.text.primary : theme.text.secondary },
              ]}
            >
              Diffs
            </Text>
          </Pressable>
        </View>
      ) : null,
    [
      chartMode,
      isInsideChartCard,
      showModeToggle,
      theme.bg.surface,
      theme.bg.surfaceElevated,
      theme.border.brand,
      theme.border.default,
      theme.text.primary,
      theme.text.secondary,
    ],
  );

  useEffect(() => {
    if (!chartCardHeaderActionContext) {
      return;
    }

    chartCardHeaderActionContext.setHeaderAction(modeToggle);

    return () => {
      chartCardHeaderActionContext.setHeaderAction(null);
    };
  }, [chartCardHeaderActionContext, modeToggle]);

  useEffect(() => {
    if (chartMode !== "line") {
      setActivePointIndex(null);
    }
  }, [chartMode]);

  useEffect(() => {
    setActivePointIndex((currentIndex) => {
      if (currentIndex == null) return currentIndex;
      return currentIndex < linePoints.length ? currentIndex : null;
    });
  }, [linePoints.length]);

  if (!chartData) return null;

  const {
    width,
    innerH,
    linePath,
    areaPath,
    yTicks,
    xTicks,
    xScale,
    yScale,
    candles,
    candleBodyWidth,
  } = chartData;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {!isInsideChartCard ? modeToggle : null}
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
          {chartMode === "line" ? (
            <>
              {shouldRenderArea ? (
                <Path
                  d={areaPath}
                  fill={lineStrokeColor}
                  fillOpacity={areaFillOpacity}
                  transform={`translate(${MARGIN.left},${MARGIN.top})`}
                />
              ) : null}
              <Path
                d={linePath}
                fill="none"
                stroke={lineStrokeColor}
                strokeWidth={2}
                transform={`translate(${MARGIN.left},${MARGIN.top})`}
              />
              {activePoint ? (
                <>
                  <Line
                    testID="trend-chart-active-guide"
                    x1={MARGIN.left + activePoint.x}
                    x2={MARGIN.left + activePoint.x}
                    y1={MARGIN.top}
                    y2={MARGIN.top + innerH}
                    stroke={theme.border.default}
                    strokeWidth={1}
                    strokeDasharray="2,3"
                  />
                  <Circle
                    testID="trend-chart-active-point"
                    cx={MARGIN.left + activePoint.x}
                    cy={MARGIN.top + activePoint.y}
                    r={4}
                    fill={theme.bg.surface}
                    stroke={lineStrokeColor}
                    strokeWidth={2}
                  />
                </>
              ) : null}
            </>
          ) : (
            <G
              testID="trend-chart-candlestick-series"
              transform={`translate(${MARGIN.left},${MARGIN.top})`}
            >
              {candles.map((candle, index) => {
                const x = xScale(candle.ts);
                const openY = yScale(candle.open);
                const closeY = yScale(candle.close);
                const highY = yScale(candle.high);
                const lowY = yScale(candle.low);
                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(Math.abs(openY - closeY), MIN_CANDLE_BODY_HEIGHT);
                const candleColor =
                  candle.close > candle.open
                    ? theme.state.success
                    : candle.close < candle.open
                      ? theme.state.error
                      : theme.state.success;
                const bodyX = Math.min(
                  Math.max(x - candleBodyWidth / 2, 0),
                  Math.max(innerW - candleBodyWidth, 0),
                );

                return (
                  <G key={`candle-${candle.ts.getTime()}-${index}`}>
                    <Line x1={x} x2={x} y1={highY} y2={lowY} stroke={theme.text.tertiary} strokeWidth={1} />
                    <Rect
                      testID={`trend-chart-candle-${index}`}
                      x={bodyX}
                      y={bodyTop}
                      width={candleBodyWidth}
                      height={bodyHeight}
                      rx={1}
                      fill={candleColor}
                    />
                  </G>
                );
              })}
            </G>
          )}
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
        <View
          testID="trend-chart-interaction-layer"
          pointerEvents={chartMode === "line" ? "auto" : "none"}
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
                onStartShouldSetResponder: () => chartMode === "line",
                onMoveShouldSetResponder: () => chartMode === "line",
                onResponderGrant: handleChartInteractionStart,
                onResponderMove: handleChartInteractionMove,
                onResponderRelease: handleChartInteractionEnd,
                onResponderTerminate: handleChartInteractionEnd,
              })}
        />
        {activePoint && tooltipPosition ? (
          <View
            testID="trend-chart-hover-tooltip"
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
            <Text style={[styles.tooltipDate, { color: theme.text.tertiary }]}>{activePointDateLabel}</Text>
            <View style={styles.tooltipValueRow}>
              <Text style={[styles.tooltipLabel, { color: theme.text.tertiary }]}>{pointDetailLabel}</Text>
              <Text style={[styles.tooltipValue, { color: theme.text.primary }]}>{activePointValueLabel}</Text>
            </View>
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
  chartSurface: {
    width: "100%",
    position: "relative",
  },
  modeToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[2],
    borderWidth: 1,
    borderRadius: radius.full,
    gap: spacing[4],
  },
  modeToggleInlinePosition: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
  modeToggleButton: {
    minHeight: 24,
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  modeToggleText: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "600",
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
