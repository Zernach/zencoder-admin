import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, View, Text, StyleSheet, Platform } from "react-native";
import type { PointerEvent as RNPointerEvent } from "react-native";
import type { KeyValueMetric } from "@/features/analytics/types";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import { BarChart, type BarChartDatum } from "./BarChart";
import { getOrangeBarShade, getOrangeBarShadesStepped } from "./palette";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";
import { clampTooltipPosition } from "./tooltipUtils";

export interface BreakdownChartHoverRow {
  label: string;
  value: string;
}

export interface BreakdownChartDatum extends KeyValueMetric {
  hoverRows?: BreakdownChartHoverRow[];
}

interface BreakdownChartProps {
  data: BreakdownChartDatum[];
  variant: "bar" | "horizontal-bar";
  height?: number;
  showValues?: boolean;
  truncateLabels?: boolean;
  formatValue?: (value: number) => string;
  xLabel?: string;
  /** Color scale for bars. "stepped" (default) assigns equally-spaced distinct colors.
   *  "scaled" maps bar color continuously based on the numeric value. */
  colorScale?: "stepped" | "scaled";
}

export const BreakdownChart = React.memo(function BreakdownChart({
  data,
  variant = "bar",
  height = 200,
  showValues = true,
  truncateLabels = true,
  formatValue = formatCompactNumber,
  xLabel,
  colorScale = "stepped",
}: BreakdownChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const [measuredLabelWidth, setMeasuredLabelWidth] = useState<number>(0);
  const [measuredRowHeight, setMeasuredRowHeight] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<View>(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });

  const handlePointerMove = useCallback((event: RNPointerEvent) => {
    const container = containerRef.current;
    if (!container || Platform.OS !== "web") return;
    (container as unknown as { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void })
      .measureInWindow((cx, cy, cw, ch) => {
        containerSizeRef.current = { width: cw, height: ch };
        setMousePos({
          x: (event.nativeEvent as unknown as { pageX: number }).pageX - cx,
          y: (event.nativeEvent as unknown as { pageY: number }).pageY - cy,
        });
      });
  }, []);

  const [measuredValueWidth, setMeasuredValueWidth] = useState<number>(0);

  const { sorted, minVal, maxVal, longestLabel, longestFormattedValue } = useMemo(() => {
    const s = [...data].sort((a, b) => b.value - a.value);
    const values = s.map((item) => item.value);
    const formatted = s.map((item) => formatValue(item.value));
    return {
      sorted: s,
      minVal: values.length > 0 ? Math.min(...values) : 0,
      maxVal: values.length > 0 ? Math.max(...values) : 0,
      longestLabel: s.reduce((longest, item) => (item.key.length > longest.length ? item.key : longest), ""),
      longestFormattedValue: formatted.reduce((longest, v) => (v.length > longest.length ? v : longest), ""),
    };
  }, [data, formatValue]);

  /** Estimated width for largest value (fontSize 11 ≈ 6–7px/char). Used as fallback before measurement. */
  const estimatedValueWidth = useMemo(
    () => (longestFormattedValue.length > 0 ? Math.max(24, longestFormattedValue.length * 8) : 24),
    [longestFormattedValue],
  );
  const effectiveLabelWidth = useMemo(() => {
    if (truncateLabels || measuredLabelWidth <= 0 || containerWidth <= 0) {
      return measuredLabelWidth > 0 ? measuredLabelWidth : undefined;
    }
    return measuredLabelWidth;
  }, [truncateLabels, measuredLabelWidth, containerWidth]);

  const effectiveSorted = useMemo(() => {
    return sorted.map((item) => ({
      ...item,
      hoverRows: item.hoverRows && item.hoverRows.length > 0
        ? item.hoverRows
        : [{ label: item.key, value: formatValue(item.value) }],
    }));
  }, [sorted, formatValue]);

  const handleLongestLabelLayout = useCallback((width: number): void => {
    if (width > measuredLabelWidth) {
      setMeasuredLabelWidth(width);
    }
  }, [measuredLabelWidth]);

  const handleLongestValueLayout = useCallback((event: { nativeEvent: { layout: { width: number } } }): void => {
    const w = event.nativeEvent.layout.width;
    if (w > measuredValueWidth) {
      setMeasuredValueWidth(w);
    }
  }, [measuredValueWidth]);

  const handleRowHeightLayout = useCallback((height: number): void => {
    if (height > measuredRowHeight) {
      setMeasuredRowHeight(height);
    }
  }, [measuredRowHeight]);

  useEffect(() => {
    if (activeTooltipIndex === null || variant !== "horizontal-bar") {
      tooltipOpacity.stopAnimation();
      tooltipOpacity.setValue(0);
      return;
    }

    tooltipOpacity.stopAnimation();
    tooltipOpacity.setValue(0);
    Animated.timing(tooltipOpacity, {
      toValue: 1,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeTooltipIndex, tooltipOpacity, variant]);

  useEffect(() => {
    if (activeTooltipIndex != null && activeTooltipIndex >= sorted.length) {
      setActiveTooltipIndex(null);
    }
  }, [activeTooltipIndex, sorted.length]);

  const tooltipAnimatedStyle = useMemo(
    () => ({
      opacity: tooltipOpacity,
      transform: [
        {
          translateY: tooltipOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [6, 0],
          }),
        },
        {
          scale: tooltipOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1],
          }),
        },
      ],
    }),
    [tooltipOpacity],
  );

  const handleTooltipShow = useCallback((index: number): void => {
    setActiveTooltipIndex(index);
  }, []);

  const handleTooltipHide = useCallback((index: number): void => {
    setActiveTooltipIndex((current) => (current === index ? null : current));
  }, []);

  const chartData = useMemo<BarChartDatum[]>(() => {
    const steppedShades = colorScale === "stepped" ? getOrangeBarShadesStepped(sorted.length) : null;
    return sorted.map((item, index) => ({
      id: `${item.key}-${index}`,
      label: item.key,
      value: item.value,
      valueLabel: formatValue(item.value),
      color: steppedShades ? steppedShades[index] ?? getOrangeBarShade(item.value, minVal, maxVal) : getOrangeBarShade(item.value, minVal, maxVal),
      barTestID:
        variant === "horizontal-bar"
          ? `breakdown-bar-fill-${index}`
          : `breakdown-vertical-bar-${index}`,
      tooltipRows: (effectiveSorted[index]?.hoverRows ?? [{ label: item.key, value: formatValue(item.value) }])
        .map((r) => ({ label: r.label, value: r.value })),
    }));
  }, [colorScale, maxVal, minVal, sorted, effectiveSorted, variant, formatValue]);

  const breakdownTooltipPos = clampTooltipPosition(
    mousePos.x, mousePos.y,
    containerSizeRef.current.width, containerSizeRef.current.height,
  );

  if (variant === "horizontal-bar") {
    return (
      <View
        ref={containerRef}
        style={styles.container}
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        onPointerMove={handlePointerMove}
      >
        {!truncateLabels && longestLabel.length > 0 ? (
          <Text
            style={[styles.hBarLabel, styles.hBarLabelFull, styles.measureLabel, { color: theme.text.secondary }]}
            onLayout={(event) => handleLongestLabelLayout(event.nativeEvent.layout.width)}
          >
            {longestLabel}
          </Text>
        ) : null}
        {showValues && longestFormattedValue.length > 0 ? (
          <Text
            style={[styles.hBarValue, styles.measureLabel, { color: theme.text.primary }]}
            onLayout={handleLongestValueLayout}
          >
            {longestFormattedValue}
          </Text>
        ) : null}
        <BarChart
          data={chartData}
          orientation="horizontal"
          showValues={showValues}
          xLabel={xLabel}
          onBarHoverIn={handleTooltipShow}
          onBarHoverOut={handleTooltipHide}
          horizontalOptions={{
            labelNumberOfLines: truncateLabels ? 1 : undefined,
            labelWidth: truncateLabels ? 80 : effectiveLabelWidth,
            valueWidth: Math.max(measuredValueWidth > 0 ? measuredValueWidth : 0, estimatedValueWidth),
            trackMinWidth: 56,
            trackHeight: 16,
            trackColor: theme.bg.surfaceElevated,
            rowHeight: !truncateLabels && measuredRowHeight > 0 ? measuredRowHeight : undefined,
            onRowLayout: truncateLabels ? undefined : handleRowHeightLayout,
          }}
          layoutStyles={{
            bars: styles.horizontalBars,
            row: styles.hBarRow,
            track: styles.hBarTrack,
            fill: styles.hBarFill,
          }}
          textStyles={{
            label: [
              styles.hBarLabel,
              { color: theme.text.secondary },
              !truncateLabels && styles.hBarLabelFull,
            ],
            value: [styles.hBarValue, { color: theme.text.primary }],
          }}
          renderHorizontalLabel={({ item, index, style, numberOfLines }) => {
            const hoverRows = effectiveSorted[index]?.hoverRows;
            const hasHoverRows = Boolean(hoverRows && hoverRows.length > 0);

            return (
              <View style={styles.hBarLabelWrap}>
                {hasHoverRows ? (
                  <Pressable
                    onHoverIn={() => handleTooltipShow(index)}
                    onHoverOut={() => handleTooltipHide(index)}
                    onPressIn={() => handleTooltipShow(index)}
                    onPressOut={() => handleTooltipHide(index)}
                    style={styles.hBarLabelPressable}
                    accessibilityRole="button"
                    accessibilityLabel={`Show details for ${item.label}`}
                    testID={`breakdown-label-hover-target-${index}`}
                  >
                    <Text style={style} numberOfLines={numberOfLines}>
                      {item.label}
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={style} numberOfLines={numberOfLines}>
                    {item.label}
                  </Text>
                )}
              </View>
            );
          }}
        />
        {activeTooltipIndex !== null && effectiveSorted[activeTooltipIndex]?.hoverRows?.length ? (
          <Animated.View
            pointerEvents="none"
            testID={`breakdown-hover-bubble-${activeTooltipIndex}`}
            style={[
              styles.tooltipBubble,
              {
                left: breakdownTooltipPos.left,
                top: breakdownTooltipPos.top,
                backgroundColor: theme.bg.surface,
                borderColor: theme.border.default,
                shadowColor: mode === "dark" ? "#000000" : "#0f1720",
              },
              tooltipAnimatedStyle,
            ]}
          >
            {effectiveSorted[activeTooltipIndex].hoverRows?.map((row, rowIndex) => (
              <View key={`${row.label}-${rowIndex}`} style={styles.tooltipRow}>
                <Text style={[styles.tooltipLabel, { color: theme.text.tertiary }]}>
                  {row.label}
                </Text>
                <Text style={[styles.tooltipValue, { color: theme.text.primary }]}>
                  {row.value}
                </Text>
              </View>
            ))}
          </Animated.View>
        ) : null}
      </View>
    );
  }

  return (
    <BarChart
      data={chartData}
      orientation="vertical"
      height={height}
      showValues={showValues}
      xLabel={xLabel}
      verticalOptions={{
        barWidth: "80%",
        maxBarHeightPercent: 70,
        minBarHeight: 4,
        labelNumberOfLines: 1,
      }}
      layoutStyles={{
        bars: styles.barContainer,
        column: styles.barCol,
        fill: styles.bar,
      }}
      textStyles={{
        value: [styles.barValue, { color: theme.text.secondary }],
        label: [styles.barLabel, { color: theme.text.tertiary }],
      }}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing[8],
  },
  horizontalBars: {
    gap: spacing[8],
  },
  hBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  hBarLabelWrap: {
    position: "relative",
    justifyContent: "center",
  },
  hBarLabelPressable: {
    justifyContent: "center",
  },
  hBarLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  hBarLabelFull: {
    flexShrink: 0,
  },
  measureLabel: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
  hBarTrack: {
    flex: 1,
    minWidth: 56,
    height: 16,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  hBarFill: {
    height: "100%",
    borderRadius: radius.sm,
  },
  hBarValue: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "left",
  },
  tooltipBubble: {
    position: "absolute",
    minWidth: 208,
    maxWidth: 280,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[8],
    zIndex: 10,
    elevation: 5,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[10],
  },
  tooltipLabel: {
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 14,
    flexShrink: 0,
  },
  tooltipValue: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[8],
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  bar: {
    borderRadius: radius.sm,
  },
  barValue: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: spacing[4],
  },
  barLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: spacing[4],
    textAlign: "center",
  },
});
