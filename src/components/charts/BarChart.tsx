import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { PointerEvent as RNPointerEvent, StyleProp, TextStyle, ViewStyle } from "react-native";
import type { KeyValueMetric } from "@/features/analytics/types";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { fontFamilies, radius, spacing } from "@/theme/tokens";
import { getOrangeBarShade, getOrangeBarShadesStepped, getOrangePieColorsByValue } from "./palette";
import { BarPieChart, type BarPieChartMode } from "./BarPieChart";
import { PieChart, type PieChartDatum } from "./PieChart";
import { clampTooltipPosition } from "./tooltipUtils";

export type BarChartOrientation = "horizontal" | "vertical";
export type BarChartVariant = "bar" | "horizontal-bar";
export type BarChartColorScale = "stepped" | "scaled";

export interface BarChartTooltipRow {
  label: string;
  value: string;
}

export interface BarChartDatum {
  id: string;
  label: string;
  value: number;
  color: string;
  valueLabel?: string;
  barTestID?: string;
  tooltipRows?: BarChartTooltipRow[];
}

export interface BarChartBreakdownDatum extends KeyValueMetric {
  hoverRows?: BarChartTooltipRow[];
}

export interface HorizontalBarChartOptions {
  labelWidth?: number;
  labelNumberOfLines?: number;
  valueWidth?: number;
  trackMinWidth?: number;
  trackHeight?: number;
  trackColor?: string;
  minFillPercent?: number;
  rowHeight?: number;
  onRowLayout?: (height: number) => void;
}

export interface VerticalBarChartOptions {
  barWidth?: number | `${number}%`;
  maxBarHeightPercent?: number;
  minBarHeight?: number;
  labelNumberOfLines?: number;
}

export interface BarChartLayoutStyles {
  container?: StyleProp<ViewStyle>;
  bars?: StyleProp<ViewStyle>;
  row?: StyleProp<ViewStyle>;
  column?: StyleProp<ViewStyle>;
  track?: StyleProp<ViewStyle>;
  fill?: StyleProp<ViewStyle>;
}

export interface BarChartTextStyles {
  label?: StyleProp<TextStyle>;
  value?: StyleProp<TextStyle>;
  xLabel?: StyleProp<TextStyle>;
}

interface PrimitiveBarChartProps {
  data: BarChartDatum[];
  orientation: BarChartOrientation;
  height?: number;
  showValues?: boolean;
  xLabel?: string;
  horizontalOptions?: HorizontalBarChartOptions;
  verticalOptions?: VerticalBarChartOptions;
  layoutStyles?: BarChartLayoutStyles;
  textStyles?: BarChartTextStyles;
  renderHorizontalLabel?: (params: {
    item: BarChartDatum;
    index: number;
    style: StyleProp<TextStyle>;
    numberOfLines?: number;
  }) => ReactNode;
  onBarHoverIn?: (index: number) => void;
  onBarHoverOut?: (index: number) => void;
}

export interface BarChartProps {
  data: BarChartDatum[] | BarChartBreakdownDatum[];
  orientation?: BarChartOrientation;
  variant?: BarChartVariant;
  height?: number;
  showValues?: boolean;
  xLabel?: string;
  horizontalOptions?: HorizontalBarChartOptions;
  verticalOptions?: VerticalBarChartOptions;
  layoutStyles?: BarChartLayoutStyles;
  textStyles?: BarChartTextStyles;
  renderHorizontalLabel?: (params: {
    item: BarChartDatum;
    index: number;
    style: StyleProp<TextStyle>;
    numberOfLines?: number;
  }) => ReactNode;
  onBarHoverIn?: (index: number) => void;
  onBarHoverOut?: (index: number) => void;
  truncateLabels?: boolean;
  formatValue?: (value: number) => string;
  colorScale?: BarChartColorScale;
  defaultMode?: BarPieChartMode;
  showModeToggle?: boolean;
  pieSize?: number;
  pieInnerRadiusRatio?: number;
  piePadding?: number;
}

interface BreakdownModeBarChartProps {
  data: BarChartBreakdownDatum[];
  orientation: BarChartOrientation;
  height?: number;
  showValues: boolean;
  xLabel?: string;
  horizontalOptions?: HorizontalBarChartOptions;
  verticalOptions?: VerticalBarChartOptions;
  layoutStyles?: BarChartLayoutStyles;
  textStyles?: BarChartTextStyles;
  renderHorizontalLabel?: (params: {
    item: BarChartDatum;
    index: number;
    style: StyleProp<TextStyle>;
    numberOfLines?: number;
  }) => ReactNode;
  onBarHoverIn?: (index: number) => void;
  onBarHoverOut?: (index: number) => void;
  truncateLabels: boolean;
  formatValue: (value: number) => string;
  colorScale: BarChartColorScale;
}

const DEFAULT_HORIZONTAL_OPTIONS: Pick<
  HorizontalBarChartOptions,
  "trackMinWidth" | "trackHeight" | "trackColor" | "minFillPercent"
> = {
  trackMinWidth: 56,
  trackHeight: 16,
  trackColor: "rgba(128, 128, 128, 0.12)",
  minFillPercent: 0,
};

const DEFAULT_VERTICAL_OPTIONS: Required<Omit<VerticalBarChartOptions, "labelNumberOfLines">> = {
  barWidth: "80%",
  maxBarHeightPercent: 70,
  minBarHeight: 2,
};

function isPrimitiveBarDatum(datum: BarChartDatum | BarChartBreakdownDatum): datum is BarChartDatum {
  return "id" in datum && "label" in datum && "color" in datum;
}

const PrimitiveBarChart = React.memo(function PrimitiveBarChart({
  data,
  orientation,
  height,
  showValues = true,
  xLabel,
  horizontalOptions,
  verticalOptions,
  layoutStyles,
  textStyles,
  renderHorizontalLabel,
  onBarHoverIn,
  onBarHoverOut,
}: PrimitiveBarChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const maxValue = useMemo(
    () => Math.max(...data.map((item) => item.value), 0),
    [data],
  );

  // Built-in tooltip: only when data has tooltipRows and no external hover handlers
  const hasTooltipData = useMemo(
    () => !onBarHoverIn && data.some((d) => d.tooltipRows && d.tooltipRows.length > 0),
    [data, onBarHoverIn],
  );
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<View>(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

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

  const handleTooltipShow = useCallback((index: number) => {
    setActiveTooltipIndex(index);
  }, []);

  const handleTooltipHide = useCallback((index: number) => {
    setActiveTooltipIndex((current) => (current === index ? null : current));
  }, []);

  useEffect(() => {
    if (!hasTooltipData) return;
    if (activeTooltipIndex === null) {
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
  }, [activeTooltipIndex, tooltipOpacity, hasTooltipData]);

  useEffect(() => {
    if (activeTooltipIndex != null && activeTooltipIndex >= data.length) {
      setActiveTooltipIndex(null);
    }
  }, [activeTooltipIndex, data.length]);

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

  // Determine effective hover handlers: use external ones if provided, else internal if data has tooltips
  const effectiveHoverIn = onBarHoverIn ?? (hasTooltipData ? handleTooltipShow : undefined);
  const effectiveHoverOut = onBarHoverOut ?? (hasTooltipData ? handleTooltipHide : undefined);

  const resolvedHorizontalOptions: HorizontalBarChartOptions = {
    ...DEFAULT_HORIZONTAL_OPTIONS,
    ...horizontalOptions,
  };

  const resolvedVerticalOptions: VerticalBarChartOptions = {
    ...DEFAULT_VERTICAL_OPTIONS,
    ...verticalOptions,
  };

  const activeTooltipRows = hasTooltipData && activeTooltipIndex !== null
    ? data[activeTooltipIndex]?.tooltipRows
    : undefined;

  const tooltipPos = clampTooltipPosition(
    mousePos.x, mousePos.y,
    containerSizeRef.current.width, containerSizeRef.current.height,
  );

  const tooltipBubble = activeTooltipRows && activeTooltipRows.length > 0 ? (
    <Animated.View
      pointerEvents="none"
      testID={`bar-chart-tooltip-${activeTooltipIndex}`}
      style={[
        styles.tooltipBubble,
        {
          left: tooltipPos.left,
          top: tooltipPos.top,
          backgroundColor: theme.bg.surface,
          borderColor: theme.border.default,
          shadowColor: mode === "dark" ? "#000000" : "#0f1720",
        },
        tooltipAnimatedStyle,
      ]}
    >
      {activeTooltipRows.map((row, rowIndex) => (
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
  ) : null;

  if (orientation === "horizontal") {
    return (
      <View
        ref={hasTooltipData ? containerRef : undefined}
        onPointerMove={hasTooltipData ? handlePointerMove : undefined}
        style={[
          styles.primitiveContainer,
          layoutStyles?.container,
        ]}
      >
        <View style={[styles.primitiveHorizontalBars, layoutStyles?.bars]}>
          {data.map((item, index) => {
            const valueRatio = maxValue > 0 ? item.value / maxValue : 0;
            const fillPercent =
              item.value > 0
                ? Math.max(
                  valueRatio * 100,
                  resolvedHorizontalOptions.minFillPercent ?? 0,
                )
                : 0;
            const labelStyle: StyleProp<TextStyle> = [
              styles.primitiveHorizontalLabel,
              resolvedHorizontalOptions.labelWidth != null
                ? { width: resolvedHorizontalOptions.labelWidth }
                : null,
              textStyles?.label,
            ];

            return (
              <View
                key={item.id}
                onLayout={
                  resolvedHorizontalOptions.onRowLayout
                    ? (event) =>
                      resolvedHorizontalOptions.onRowLayout?.(
                        event.nativeEvent.layout.height,
                      )
                    : undefined
                }
                style={[
                  styles.primitiveHorizontalRow,
                  resolvedHorizontalOptions.rowHeight != null
                    ? { height: resolvedHorizontalOptions.rowHeight }
                    : null,
                  layoutStyles?.row,
                ]}
              >
                {renderHorizontalLabel ? (
                  renderHorizontalLabel({
                    item,
                    index,
                    style: labelStyle,
                    numberOfLines: resolvedHorizontalOptions.labelNumberOfLines,
                  })
                ) : (
                  <Text
                    style={labelStyle}
                    numberOfLines={resolvedHorizontalOptions.labelNumberOfLines}
                  >
                    {item.label}
                  </Text>
                )}
                {effectiveHoverIn || effectiveHoverOut ? (
                  <Pressable
                    onHoverIn={effectiveHoverIn ? () => effectiveHoverIn(index) : undefined}
                    onHoverOut={effectiveHoverOut ? () => effectiveHoverOut(index) : undefined}
                    onPressIn={effectiveHoverIn ? () => effectiveHoverIn(index) : undefined}
                    onPressOut={effectiveHoverOut ? () => effectiveHoverOut(index) : undefined}
                    style={[
                      styles.primitiveHorizontalTrack,
                      {
                        minWidth: resolvedHorizontalOptions.trackMinWidth,
                        height: resolvedHorizontalOptions.trackHeight,
                        backgroundColor: resolvedHorizontalOptions.trackColor,
                      },
                      layoutStyles?.track,
                    ]}
                  >
                    <View
                      testID={item.barTestID}
                      style={[
                        styles.primitiveHorizontalFill,
                        {
                          width: `${fillPercent}%`,
                          backgroundColor: item.color,
                        },
                        layoutStyles?.fill,
                      ]}
                    />
                  </Pressable>
                ) : (
                  <View
                    style={[
                      styles.primitiveHorizontalTrack,
                      {
                        minWidth: resolvedHorizontalOptions.trackMinWidth,
                        height: resolvedHorizontalOptions.trackHeight,
                        backgroundColor: resolvedHorizontalOptions.trackColor,
                      },
                      layoutStyles?.track,
                    ]}
                  >
                    <View
                      testID={item.barTestID}
                      style={[
                        styles.primitiveHorizontalFill,
                        {
                          width: `${fillPercent}%`,
                          backgroundColor: item.color,
                        },
                        layoutStyles?.fill,
                      ]}
                    />
                  </View>
                )}
                {showValues ? (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.primitiveHorizontalValue,
                      resolvedHorizontalOptions.valueWidth != null
                        ? { width: resolvedHorizontalOptions.valueWidth }
                        : null,
                      textStyles?.value,
                    ]}
                  >
                    {item.valueLabel ?? formatCompactNumber(item.value)}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
        {xLabel ? <Text style={[styles.primitiveXLabel, { color: theme.text.tertiary }, textStyles?.xLabel]}>{xLabel}</Text> : null}
        {tooltipBubble}
      </View>
    );
  }

  return (
    <View
      ref={hasTooltipData ? containerRef : undefined}
      onPointerMove={hasTooltipData ? handlePointerMove : undefined}
      style={[
        styles.primitiveContainer,
        height != null ? { height } : null,
        layoutStyles?.container,
      ]}
    >
      <View style={[styles.primitiveVerticalBars, layoutStyles?.bars]}>
        {data.map((item, index) => {
          const valueRatio = maxValue > 0 ? item.value / maxValue : 0;
          const barHeight = `${valueRatio * (resolvedVerticalOptions.maxBarHeightPercent ?? 70)}%` as `${number}%`;
          return (
            <View key={item.id} style={[styles.primitiveVerticalColumn, layoutStyles?.column]}>
              <View style={styles.primitiveVerticalBarWrapper}>
                {showValues ? (
                  <Text style={[styles.primitiveVerticalValue, textStyles?.value]}>
                    {item.valueLabel ?? formatCompactNumber(item.value)}
                  </Text>
                ) : null}
                {effectiveHoverIn || effectiveHoverOut ? (
                  <Pressable
                    onHoverIn={effectiveHoverIn ? () => effectiveHoverIn(index) : undefined}
                    onHoverOut={effectiveHoverOut ? () => effectiveHoverOut(index) : undefined}
                    onPressIn={effectiveHoverIn ? () => effectiveHoverIn(index) : undefined}
                    onPressOut={effectiveHoverOut ? () => effectiveHoverOut(index) : undefined}
                    testID={item.barTestID}
                    style={[
                      styles.primitiveVerticalBar,
                      {
                        width: resolvedVerticalOptions.barWidth,
                        minHeight: resolvedVerticalOptions.minBarHeight,
                        height: barHeight,
                        backgroundColor: item.color,
                      },
                      layoutStyles?.fill,
                    ]}
                  />
                ) : (
                  <View
                    testID={item.barTestID}
                    style={[
                      styles.primitiveVerticalBar,
                      {
                        width: resolvedVerticalOptions.barWidth,
                        minHeight: resolvedVerticalOptions.minBarHeight,
                        height: barHeight,
                        backgroundColor: item.color,
                      },
                      layoutStyles?.fill,
                    ]}
                  />
                )}
              </View>
              <Text
                style={[styles.primitiveVerticalLabel, textStyles?.label]}
                numberOfLines={resolvedVerticalOptions.labelNumberOfLines}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
      {xLabel ? <Text style={[styles.primitiveXLabel, { color: theme.text.tertiary }, textStyles?.xLabel]}>{xLabel}</Text> : null}
      {tooltipBubble}
    </View>
  );
});

const BreakdownModeBarChart = React.memo(function BreakdownModeBarChart({
  data,
  orientation,
  height,
  showValues,
  xLabel,
  horizontalOptions,
  verticalOptions,
  layoutStyles,
  textStyles,
  renderHorizontalLabel,
  onBarHoverIn,
  onBarHoverOut,
  truncateLabels,
  formatValue,
  colorScale,
}: BreakdownModeBarChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const [measuredLabelWidth, setMeasuredLabelWidth] = useState<number>(0);
  const [measuredRowHeight, setMeasuredRowHeight] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [measuredValueWidth, setMeasuredValueWidth] = useState<number>(0);
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });

  const { sorted, minVal, maxVal, longestLabel, longestFormattedValue } = useMemo(() => {
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const values = sortedData.map((item) => item.value);
    const formattedValues = sortedData.map((item) => formatValue(item.value));

    return {
      sorted: sortedData,
      minVal: values.length > 0 ? Math.min(...values) : 0,
      maxVal: values.length > 0 ? Math.max(...values) : 0,
      longestLabel: sortedData.reduce((longest, item) => (item.key.length > longest.length ? item.key : longest), ""),
      longestFormattedValue: formattedValues.reduce((longest, value) => (value.length > longest.length ? value : longest), ""),
    };
  }, [data, formatValue]);

  const effectiveSorted = useMemo(() => {
    return sorted.map((item) => ({
      ...item,
      hoverRows: item.hoverRows && item.hoverRows.length > 0
        ? item.hoverRows
        : [{ label: item.key, value: formatValue(item.value) }],
    }));
  }, [sorted, formatValue]);

  const chartData = useMemo<BarChartDatum[]>(() => {
    const steppedShades = colorScale === "stepped" ? getOrangeBarShadesStepped(sorted.length) : null;

    return sorted.map((item, index) => ({
      id: `${item.key}-${index}`,
      label: item.key,
      value: item.value,
      valueLabel: formatValue(item.value),
      color: steppedShades
        ? (steppedShades[index] ?? getOrangeBarShade(item.value, minVal, maxVal))
        : getOrangeBarShade(item.value, minVal, maxVal),
      barTestID: orientation === "horizontal"
        ? `breakdown-bar-fill-${index}`
        : `breakdown-vertical-bar-${index}`,
      tooltipRows: (effectiveSorted[index]?.hoverRows ?? [{ label: item.key, value: formatValue(item.value) }])
        .map((row) => ({ label: row.label, value: row.value })),
    }));
  }, [colorScale, effectiveSorted, formatValue, maxVal, minVal, orientation, sorted]);

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

  const handleLongestLabelLayout = useCallback((width: number): void => {
    if (width > measuredLabelWidth) {
      setMeasuredLabelWidth(width);
    }
  }, [measuredLabelWidth]);

  const handleLongestValueLayout = useCallback((event: { nativeEvent: { layout: { width: number } } }): void => {
    const width = event.nativeEvent.layout.width;
    if (width > measuredValueWidth) {
      setMeasuredValueWidth(width);
    }
  }, [measuredValueWidth]);

  const handleRowHeightLayout = useCallback((rowHeight: number): void => {
    if (rowHeight > measuredRowHeight) {
      setMeasuredRowHeight(rowHeight);
    }
  }, [measuredRowHeight]);

  const handleTooltipShow = useCallback((index: number): void => {
    setActiveTooltipIndex(index);
    onBarHoverIn?.(index);
  }, [onBarHoverIn]);

  const handleTooltipHide = useCallback((index: number): void => {
    setActiveTooltipIndex((current) => (current === index ? null : current));
    onBarHoverOut?.(index);
  }, [onBarHoverOut]);

  useEffect(() => {
    if (activeTooltipIndex === null || orientation !== "horizontal") {
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
  }, [activeTooltipIndex, orientation, tooltipOpacity]);

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

  const defaultHorizontalLabelRenderer = useCallback((params: {
    item: BarChartDatum;
    index: number;
    style: StyleProp<TextStyle>;
    numberOfLines?: number;
  }) => {
    const hoverRows = effectiveSorted[params.index]?.hoverRows;
    const hasHoverRows = Boolean(hoverRows && hoverRows.length > 0);

    return (
      <View style={styles.breakdownHorizontalLabelWrap}>
        {hasHoverRows ? (
          <Pressable
            onHoverIn={() => handleTooltipShow(params.index)}
            onHoverOut={() => handleTooltipHide(params.index)}
            onPressIn={() => handleTooltipShow(params.index)}
            onPressOut={() => handleTooltipHide(params.index)}
            style={styles.breakdownHorizontalLabelPressable}
            accessibilityRole="button"
            accessibilityLabel={`Show details for ${params.item.label}`}
            testID={`breakdown-label-hover-target-${params.index}`}
          >
            <Text style={params.style} numberOfLines={params.numberOfLines}>
              {params.item.label}
            </Text>
          </Pressable>
        ) : (
          <Text style={params.style} numberOfLines={params.numberOfLines}>
            {params.item.label}
          </Text>
        )}
      </View>
    );
  }, [effectiveSorted, handleTooltipHide, handleTooltipShow]);

  const tooltipPos = clampTooltipPosition(
    mousePos.x,
    mousePos.y,
    containerSizeRef.current.width,
    containerSizeRef.current.height,
  );

  if (orientation === "horizontal") {
    return (
      <View
        ref={containerRef}
        style={[styles.breakdownContainer, layoutStyles?.container]}
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        onPointerMove={handlePointerMove}
      >
        {!truncateLabels && longestLabel.length > 0 ? (
          <Text
            style={[
              styles.breakdownHorizontalLabel,
              styles.breakdownHorizontalLabelFull,
              styles.breakdownMeasureLabel,
              { color: theme.text.secondary },
            ]}
            onLayout={(event) => handleLongestLabelLayout(event.nativeEvent.layout.width)}
          >
            {longestLabel}
          </Text>
        ) : null}
        {showValues && longestFormattedValue.length > 0 ? (
          <Text
            style={[styles.breakdownHorizontalValue, styles.breakdownMeasureLabel, { color: theme.text.primary }]}
            onLayout={handleLongestValueLayout}
          >
            {longestFormattedValue}
          </Text>
        ) : null}
        <PrimitiveBarChart
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
            ...horizontalOptions,
          }}
          layoutStyles={{
            container: undefined,
            bars: [styles.breakdownHorizontalBars, layoutStyles?.bars],
            row: [styles.breakdownHorizontalRow, layoutStyles?.row],
            column: layoutStyles?.column,
            track: [styles.breakdownHorizontalTrack, layoutStyles?.track],
            fill: [styles.breakdownHorizontalFill, layoutStyles?.fill],
          }}
          textStyles={{
            label: [
              styles.breakdownHorizontalLabel,
              { color: theme.text.secondary },
              !truncateLabels && styles.breakdownHorizontalLabelFull,
              textStyles?.label,
            ],
            value: [styles.breakdownHorizontalValue, { color: theme.text.primary }, textStyles?.value],
            xLabel: textStyles?.xLabel,
          }}
          renderHorizontalLabel={renderHorizontalLabel ?? defaultHorizontalLabelRenderer}
        />
        {activeTooltipIndex !== null && effectiveSorted[activeTooltipIndex]?.hoverRows?.length ? (
          <Animated.View
            pointerEvents="none"
            testID={`breakdown-hover-bubble-${activeTooltipIndex}`}
            style={[
              styles.tooltipBubble,
              {
                left: tooltipPos.left,
                top: tooltipPos.top,
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
    <PrimitiveBarChart
      data={chartData}
      orientation="vertical"
      height={height}
      showValues={showValues}
      xLabel={xLabel}
      onBarHoverIn={onBarHoverIn}
      onBarHoverOut={onBarHoverOut}
      verticalOptions={{
        barWidth: "80%",
        maxBarHeightPercent: 70,
        minBarHeight: 4,
        labelNumberOfLines: 1,
        ...verticalOptions,
      }}
      layoutStyles={{
        container: layoutStyles?.container,
        bars: [styles.breakdownVerticalBars, layoutStyles?.bars],
        row: layoutStyles?.row,
        column: [styles.breakdownVerticalColumn, layoutStyles?.column],
        track: layoutStyles?.track,
        fill: [styles.breakdownVerticalFill, layoutStyles?.fill],
      }}
      textStyles={{
        value: [styles.breakdownVerticalValue, { color: theme.text.secondary }, textStyles?.value],
        label: [styles.breakdownVerticalLabel, { color: theme.text.tertiary }, textStyles?.label],
        xLabel: textStyles?.xLabel,
      }}
    />
  );
});

const BaseBarChart = React.memo(function BaseBarChart({
  data,
  orientation,
  variant,
  height,
  showValues = true,
  xLabel,
  horizontalOptions,
  verticalOptions,
  layoutStyles,
  textStyles,
  renderHorizontalLabel,
  onBarHoverIn,
  onBarHoverOut,
  truncateLabels = true,
  formatValue = formatCompactNumber,
  colorScale = "stepped",
}: BarChartProps) {
  const resolvedOrientation: BarChartOrientation = useMemo(() => {
    if (variant === "bar") return "vertical";
    if (variant === "horizontal-bar") return "horizontal";
    return orientation ?? "horizontal";
  }, [orientation, variant]);

  const shouldUseBreakdownMode = useMemo(() => {
    if (data.length > 0) {
      return !isPrimitiveBarDatum(data[0] as BarChartDatum | BarChartBreakdownDatum);
    }

    return Boolean(variant || formatValue !== formatCompactNumber || colorScale !== "stepped" || !truncateLabels);
  }, [colorScale, data, formatValue, truncateLabels, variant]);

  if (shouldUseBreakdownMode) {
    return (
      <BreakdownModeBarChart
        data={data as BarChartBreakdownDatum[]}
        orientation={resolvedOrientation}
        height={height}
        showValues={showValues}
        xLabel={xLabel}
        horizontalOptions={horizontalOptions}
        verticalOptions={verticalOptions}
        layoutStyles={layoutStyles}
        textStyles={textStyles}
        renderHorizontalLabel={renderHorizontalLabel}
        onBarHoverIn={onBarHoverIn}
        onBarHoverOut={onBarHoverOut}
        truncateLabels={truncateLabels}
        formatValue={formatValue}
        colorScale={colorScale}
      />
    );
  }

  return (
    <PrimitiveBarChart
      data={data as BarChartDatum[]}
      orientation={resolvedOrientation}
      height={height}
      showValues={showValues}
      xLabel={xLabel}
      horizontalOptions={horizontalOptions}
      verticalOptions={verticalOptions}
      layoutStyles={layoutStyles}
      textStyles={textStyles}
      renderHorizontalLabel={renderHorizontalLabel}
      onBarHoverIn={onBarHoverIn}
      onBarHoverOut={onBarHoverOut}
    />
  );
});

interface BarChartPieLegendItem {
  id: string;
  label: string;
  color: string;
  valueLabel: string;
  shareLabel: string;
}

function toBarChartPieModel(
  data: BarChartDatum[] | BarChartBreakdownDatum[],
  formatValue: (value: number) => string,
): { pieData: PieChartDatum[]; legendItems: BarChartPieLegendItem[] } {
  const normalized = data.map((datum, index) => {
    if (isPrimitiveBarDatum(datum as BarChartDatum | BarChartBreakdownDatum)) {
      const primitiveDatum = datum as BarChartDatum;
      return {
        id: primitiveDatum.id,
        label: primitiveDatum.label,
        value: Math.max(0, primitiveDatum.value),
        color: primitiveDatum.color,
        valueLabel: primitiveDatum.valueLabel ?? formatValue(primitiveDatum.value),
        tooltipRows: primitiveDatum.tooltipRows,
      };
    }

    const breakdownDatum = datum as BarChartBreakdownDatum;
    return {
      id: `${breakdownDatum.key}-${index}`,
      label: breakdownDatum.key,
      value: Math.max(0, breakdownDatum.value),
      color: "#f64a00",
      valueLabel: formatValue(breakdownDatum.value),
      tooltipRows: breakdownDatum.hoverRows,
    };
  });

  const sorted = [...normalized].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = total > 0 ? total : 1;
  const colors = getOrangePieColorsByValue(sorted.map((item) => item.value));

  const pieData: PieChartDatum[] = sorted.map((item, index) => {
    const shareLabel = `${((item.value / safeTotal) * 100).toFixed(1)}%`;
    const defaultTooltipRows: BarChartTooltipRow[] = [
      { label: item.label, value: item.valueLabel },
      { label: "Share", value: shareLabel },
    ];

    return {
      id: item.id,
      value: item.value,
      color: colors[index] ?? item.color,
      tooltipRows: item.tooltipRows && item.tooltipRows.length > 0 ? item.tooltipRows : defaultTooltipRows,
    };
  });

  const legendItems: BarChartPieLegendItem[] = sorted.map((item, index) => ({
    id: item.id,
    label: item.label,
    color: colors[index] ?? item.color,
    valueLabel: item.valueLabel,
    shareLabel: `${((item.value / safeTotal) * 100).toFixed(1)}%`,
  }));

  return { pieData, legendItems };
}

export const BarChart = React.memo(function BarChart({
  defaultMode = "bar",
  showModeToggle = true,
  pieSize = 220,
  pieInnerRadiusRatio = 0.6,
  piePadding = 8,
  formatValue = formatCompactNumber,
  ...barChartProps
}: BarChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const { pieData, legendItems } = useMemo(
    () => toBarChartPieModel(barChartProps.data, formatValue),
    [barChartProps.data, formatValue],
  );

  const pieView = (
    <View style={styles.unifiedPieContainer}>
      <PieChart
        data={pieData}
        size={pieSize}
        innerRadiusRatio={pieInnerRadiusRatio}
        padding={piePadding}
        style={styles.unifiedPieFrame}
      />
      {legendItems.length > 0 ? (
        <View style={styles.unifiedPieLegend}>
          {legendItems.map((item) => (
            <View key={item.id} style={styles.unifiedPieLegendRow}>
              <View
                style={[
                  styles.unifiedPieLegendSwatch,
                  {
                    backgroundColor: item.color,
                  },
                ]}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.unifiedPieLegendLabel,
                  {
                    color: theme.text.secondary,
                  },
                ]}
              >
                {item.label}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.unifiedPieLegendValue,
                  {
                    color: theme.text.tertiary,
                  },
                ]}
              >
                {`${item.valueLabel} • ${item.shareLabel}`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  if (!showModeToggle) {
    if (defaultMode === "pie") {
      return pieView;
    }

    return <BaseBarChart {...barChartProps} formatValue={formatValue} />;
  }

  return (
    <BarPieChart
      defaultMode={defaultMode}
      showModeToggle={showModeToggle}
      renderBar={() => <BaseBarChart {...barChartProps} formatValue={formatValue} />}
      renderPie={() => pieView}
    />
  );
});

const styles = StyleSheet.create({
  primitiveContainer: {
    width: "100%",
    gap: spacing[4],
  },
  primitiveHorizontalBars: {
    gap: spacing[8],
  },
  primitiveHorizontalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  primitiveHorizontalLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "500",
  },
  primitiveHorizontalTrack: {
    flex: 1,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  primitiveHorizontalFill: {
    height: "100%",
    borderRadius: radius.sm,
  },
  primitiveHorizontalValue: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 0,
  },
  primitiveVerticalBars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[8],
  },
  primitiveVerticalColumn: {
    flex: 1,
    alignItems: "center",
  },
  primitiveVerticalBarWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  primitiveVerticalBar: {
    borderRadius: radius.sm,
  },
  primitiveVerticalValue: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    fontWeight: "600",
    marginBottom: spacing[2],
  },
  primitiveVerticalLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    fontWeight: "500",
    marginTop: spacing[2],
    textAlign: "center",
  },
  primitiveXLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    textAlign: "center",
  },
  unifiedPieContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing[16],
  },
  unifiedPieFrame: {
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  unifiedPieLegend: {
    flex: 1,
    minWidth: 180,
    alignSelf: "flex-start",
    justifyContent: "center",
    gap: spacing[6],
  },
  unifiedPieLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[6],
  },
  unifiedPieLegendSwatch: {
    width: 8,
    height: 8,
    borderRadius: radius.sm,
  },
  unifiedPieLegendLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
    minWidth: 0,
  },
  unifiedPieLegendValue: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },

  breakdownContainer: {
    gap: spacing[8],
  },
  breakdownHorizontalBars: {
    gap: spacing[8],
  },
  breakdownHorizontalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  breakdownHorizontalLabelWrap: {
    position: "relative",
    justifyContent: "center",
  },
  breakdownHorizontalLabelPressable: {
    justifyContent: "center",
  },
  breakdownHorizontalLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  breakdownHorizontalLabelFull: {
    flexShrink: 0,
  },
  breakdownMeasureLabel: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
  breakdownHorizontalTrack: {
    flex: 1,
    minWidth: 56,
    height: 16,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  breakdownHorizontalFill: {
    height: "100%",
    borderRadius: radius.sm,
  },
  breakdownHorizontalValue: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "left",
  },
  breakdownVerticalBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[8],
  },
  breakdownVerticalColumn: {
    flex: 1,
    alignItems: "center",
  },
  breakdownVerticalFill: {
    borderRadius: radius.sm,
  },
  breakdownVerticalValue: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: spacing[4],
  },
  breakdownVerticalLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: spacing[4],
    textAlign: "center",
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
});
