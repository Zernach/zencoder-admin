import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { PointerEvent as RNPointerEvent, StyleProp, TextStyle, ViewStyle } from "react-native";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { fontFamilies, radius, spacing } from "@/theme/tokens";
import { clampTooltipPosition } from "./tooltipUtils";

export type BarChartOrientation = "horizontal" | "vertical";

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

interface BarChartProps {
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

export const BarChart = React.memo(function BarChart({
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
}: BarChartProps) {
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
          styles.container,
          layoutStyles?.container,
        ]}
      >
        <View style={[styles.horizontalBars, layoutStyles?.bars]}>
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
              styles.horizontalLabel,
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
                  styles.horizontalRow,
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
                      styles.horizontalTrack,
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
                        styles.horizontalFill,
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
                      styles.horizontalTrack,
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
                        styles.horizontalFill,
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
                      styles.horizontalValue,
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
        {xLabel ? <Text style={[styles.xLabel, { color: theme.text.tertiary }, textStyles?.xLabel]}>{xLabel}</Text> : null}
        {tooltipBubble}
      </View>
    );
  }

  return (
    <View
      ref={hasTooltipData ? containerRef : undefined}
      onPointerMove={hasTooltipData ? handlePointerMove : undefined}
      style={[
        styles.container,
        height != null ? { height } : null,
        layoutStyles?.container,
      ]}
    >
      <View style={[styles.verticalBars, layoutStyles?.bars]}>
        {data.map((item, index) => {
          const valueRatio = maxValue > 0 ? item.value / maxValue : 0;
          const barHeight = `${valueRatio * (resolvedVerticalOptions.maxBarHeightPercent ?? 70)}%` as `${number}%`;
          return (
            <View key={item.id} style={[styles.verticalColumn, layoutStyles?.column]}>
              <View style={styles.verticalBarWrapper}>
                {showValues ? (
                  <Text style={[styles.verticalValue, textStyles?.value]}>
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
                      styles.verticalBar,
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
                      styles.verticalBar,
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
                style={[styles.verticalLabel, textStyles?.label]}
                numberOfLines={resolvedVerticalOptions.labelNumberOfLines}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
      {xLabel ? <Text style={[styles.xLabel, { color: theme.text.tertiary }, textStyles?.xLabel]}>{xLabel}</Text> : null}
      {tooltipBubble}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing[4],
  },
  horizontalBars: {
    gap: spacing[8],
  },
  horizontalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  horizontalLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "500",
  },
  horizontalTrack: {
    flex: 1,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  horizontalFill: {
    height: "100%",
    borderRadius: radius.sm,
  },
  horizontalValue: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 0,
  },
  verticalBars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[8],
  },
  verticalColumn: {
    flex: 1,
    alignItems: "center",
  },
  verticalBarWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  verticalBar: {
    borderRadius: radius.sm,
  },
  verticalValue: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    fontWeight: "600",
    marginBottom: spacing[2],
  },
  verticalLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    fontWeight: "500",
    marginTop: spacing[4],
    textAlign: "center",
  },
  xLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginTop: spacing[4],
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
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 14,
    flexShrink: 0,
  },
  tooltipValue: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
});
