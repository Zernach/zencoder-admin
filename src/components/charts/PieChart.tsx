import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import type { PointerEvent as RNPointerEvent, ViewProps, ViewStyle, StyleProp } from "react-native";
import Svg, { Path } from "react-native-svg";
import { arc, pie } from "d3-shape";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { fontFamilies, radius, spacing } from "@/theme/tokens";
import { typography } from "@/theme/typography";
import { getOrangePieColorsByValue } from "./palette";
import { clampTooltipPosition } from "./tooltipUtils";

export interface PieChartTooltipRow {
  label: string;
  value: string;
}

export interface PieChartDatum {
  id: string;
  value: number;
  color: string;
  tooltipRows?: PieChartTooltipRow[];
}

export interface PieChartSliceLayout {
  id: string;
  value: number;
  color: string;
  percent: number;
  centroidX: number;
  centroidY: number;
}

export interface PieChartRenderContext {
  size: number;
  total: number;
  slices: PieChartSliceLayout[];
}

interface PieChartProps {
  data: PieChartDatum[];
  size: number;
  innerRadiusRatio?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  overlayPointerEvents?: ViewProps["pointerEvents"];
  /** Render percentage labels inside slices (for slices > threshold). Defaults to true. */
  showSliceLabels?: boolean;
  /** Minimum slice percent (0–1) to show a label. Defaults to 0.05 (5%). */
  sliceLabelThreshold?: number;
  children?: (context: PieChartRenderContext) => ReactNode;
}

interface PieSlice extends PieChartSliceLayout {
  path: string;
  startAngle: number;
  endAngle: number;
  tooltipRows?: PieChartTooltipRow[];
}

export const PieChart = React.memo(function PieChart({
  data,
  size,
  innerRadiusRatio = 0.6,
  padding = 8,
  style,
  overlayPointerEvents = "none",
  showSliceLabels,
  sliceLabelThreshold = 0.05,
  children,
}: PieChartProps) {
  const resolvedShowSliceLabels = showSliceLabels ?? true;
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const { slices, total, outerRadius, innerRadius: computedInnerRadius } = useMemo(() => {
    const normalizedData = data.map((datum) => ({
      ...datum,
      value: Math.max(0, datum.value),
    }));
    const orangeScaleColors = getOrangePieColorsByValue(
      normalizedData.map((datum) => datum.value),
    );

    const chartTotal = normalizedData.reduce((sum, datum) => sum + datum.value, 0);
    const safeTotal = chartTotal > 0 ? chartTotal : 1;
    const r = Math.max(size / 2 - padding, 0);
    const ir = r * innerRadiusRatio;

    const pieGenerator = pie<PieChartDatum>()
      .value((datum) => datum.value)
      .sort(null);
    const arcGenerator = arc<{
      data: PieChartDatum;
      startAngle: number;
      endAngle: number;
      padAngle: number;
      value: number;
      index: number;
    }>()
      .innerRadius(ir)
      .outerRadius(r);

    const arcData = pieGenerator(normalizedData);
    const computedSlices: PieSlice[] = arcData.map((entry) => {
      const centroid = arcGenerator.centroid(entry);
      return {
        id: entry.data.id,
        value: entry.data.value,
        color: orangeScaleColors[entry.index] ?? entry.data.color,
        percent: entry.data.value / safeTotal,
        centroidX: size / 2 + centroid[0],
        centroidY: size / 2 + centroid[1],
        path: arcGenerator(entry) ?? "",
        startAngle: entry.startAngle,
        endAngle: entry.endAngle,
        tooltipRows: entry.data.tooltipRows,
      };
    });

    return {
      slices: computedSlices,
      total: chartTotal,
      outerRadius: r,
      innerRadius: ir,
    };
  }, [data, innerRadiusRatio, padding, size]);

  // Tooltip state
  const hasTooltipData = useMemo(
    () => slices.some((s) => s.tooltipRows && s.tooltipRows.length > 0),
    [slices],
  );
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<View>(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  const handlePointerMove = useCallback(
    (event: RNPointerEvent) => {
      if (!hasTooltipData || Platform.OS !== "web") return;
      const container = containerRef.current;
      if (!container) return;
      (
        container as unknown as {
          measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void;
        }
      ).measureInWindow((cx, cy, cw, ch) => {
        containerSizeRef.current = { width: cw, height: ch };
        const px = (event.nativeEvent as unknown as { pageX: number }).pageX - cx;
        const py = (event.nativeEvent as unknown as { pageY: number }).pageY - cy;
        setMousePos({ x: px, y: py });

        // Hit-test: determine which slice the pointer is over
        const centerX = size / 2;
        const centerY = size / 2;
        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < computedInnerRadius || dist > outerRadius) {
          setActiveTooltipIndex((prev) => (prev !== null ? null : prev));
          return;
        }

        // d3 angles: 0 = 12 o'clock, clockwise. atan2 gives angle from 3 o'clock, counter-clockwise.
        // Convert: angle = atan2(dy, dx) rotated so 0 is at top
        let angle = Math.atan2(dy, dx) + Math.PI / 2;
        if (angle < 0) angle += Math.PI * 2;

        const hitIndex = slices.findIndex(
          (s) => angle >= s.startAngle && angle < s.endAngle,
        );
        setActiveTooltipIndex(hitIndex >= 0 ? hitIndex : null);
      });
    },
    [hasTooltipData, size, computedInnerRadius, outerRadius, slices],
  );

  const handlePointerLeave = useCallback(() => {
    if (hasTooltipData) setActiveTooltipIndex(null);
  }, [hasTooltipData]);

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

  const activeTooltipRows =
    hasTooltipData && activeTooltipIndex !== null
      ? slices[activeTooltipIndex]?.tooltipRows
      : undefined;

  const tooltipPos = clampTooltipPosition(
    mousePos.x, mousePos.y,
    containerSizeRef.current.width, containerSizeRef.current.height,
  );

  const tooltipBubble =
    activeTooltipRows && activeTooltipRows.length > 0 ? (
      <Animated.View
        pointerEvents="none"
        testID={`pie-chart-tooltip-${activeTooltipIndex}`}
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

  return (
    <View
      ref={hasTooltipData ? containerRef : undefined}
      onPointerMove={hasTooltipData ? handlePointerMove : undefined}
      onPointerLeave={hasTooltipData ? handlePointerLeave : undefined}
      style={[
        styles.frame,
        { width: size, height: size },
        hasTooltipData && styles.frameTooltipEnabled,
        style,
      ]}
    >
      <Svg width={size} height={size}>
        {slices.map((slice) => (
          <Path
            key={slice.id}
            d={slice.path}
            fill={slice.color}
            transform={`translate(${size / 2},${size / 2})`}
          />
        ))}
      </Svg>
      <View style={styles.overlay} pointerEvents={overlayPointerEvents}>
        {resolvedShowSliceLabels &&
          slices
            .filter((slice) => slice.percent > sliceLabelThreshold)
            .map((slice) => (
              <Text
                key={`slice-label-${slice.id}`}
                style={[
                  styles.sliceLabel,
                  {
                    left: slice.centroidX - 18,
                    top: slice.centroidY - typography.label.lineHeight / 2,
                  },
                ]}
              >
                {`${(slice.percent * 100).toFixed(1)}%`}
              </Text>
            ))}
        {children ? children({ size, total, slices }) : null}
      </View>
      {tooltipBubble}
    </View>
  );
});

const styles = StyleSheet.create({
  frame: {
    position: "relative",
    alignSelf: "center",
  },
  frameTooltipEnabled: {
    overflow: "visible",
    zIndex: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sliceLabel: {
    position: "absolute",
    width: 36,
    textAlign: "center",
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: "600",
    lineHeight: typography.label.lineHeight,
    color: "#ffffff",
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
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
});
