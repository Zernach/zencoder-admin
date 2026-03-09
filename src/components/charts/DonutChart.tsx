import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { arc, pie } from "d3-shape";
import type { KeyValueMetric } from "@/features/analytics/types";
import { formatPercent } from "@/features/analytics/utils/formatters";
import { typography } from "@/theme/typography";
import { DATA_PALETTE } from "./palette";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface DonutChartProps {
  data: KeyValueMetric[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}

export const DonutChart = React.memo(function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 220,
}: DonutChartProps) {
  const { mode } = useThemeMode();
  const textColors = semanticThemes[mode].text;
  const size = Math.min(height, 220);
  const chartRadius = size / 2 - 8;
  const innerRadius = chartRadius * 0.6;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  const { arcs, arcGen, segmentLabels } = useMemo(() => {
    const pieGen = pie<KeyValueMetric>()
      .value((d) => d.value)
      .sort(null);

    const gen = arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(innerRadius)
      .outerRadius(chartRadius);

    const computedArcs = pieGen(data);

    // Pre-compute segment label positions to avoid per-render work
    const labels = computedArcs
      .filter((a) => a.data.value / total > 0.05)
      .map((a) => {
        const centroid = gen.centroid(a);
        return {
          key: a.data.key,
          pct: formatPercent((a.data.value / total) * 100),
          left: size / 2 + centroid[0] - 18,
          top: size / 2 + centroid[1] - typography.label.lineHeight / 2,
        };
      });

    return { arcs: computedArcs, arcGen: gen, segmentLabels: labels };
  }, [data, innerRadius, chartRadius, total, size]);

  return (
    <View style={styles.container}>
      <View style={[styles.chartFrame, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {arcs.map((a, i) => (
            <Path
              key={a.data.key}
              d={arcGen(a) ?? ""}
              fill={DATA_PALETTE[i % DATA_PALETTE.length]}
              transform={`translate(${size / 2},${size / 2})`}
            />
          ))}
        </Svg>
        <View style={styles.chartTextOverlay}>
          {segmentLabels.map((label) => (
            <Text
              key={`pct-${label.key}`}
              style={[
                styles.segmentLabel,
                {
                  left: label.left,
                  top: label.top,
                  color: textColors.primary,
                },
              ]}
            >
              {label.pct}
            </Text>
          ))}

          {(centerLabel || centerValue) && (
            <View style={styles.centerTextWrap}>
              {centerValue && (
                <Text
                  style={[
                    styles.centerValue,
                    {
                      color: textColors.primary,
                    },
                  ]}
                >
                  {centerValue}
                </Text>
              )}
              {centerLabel && (
                <Text
                  style={[
                    styles.centerLabel,
                    {
                      color: textColors.tertiary,
                    },
                  ]}
                >
                  {centerLabel}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={d.key} style={styles.legendItem}>
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor:
                    DATA_PALETTE[i % DATA_PALETTE.length],
                },
              ]}
            />
            <Text style={[styles.legendLabel, { color: textColors.secondary }]}>
              {d.key}
            </Text>
            <Text style={[styles.legendPct, { color: textColors.tertiary }]}>
              {formatPercent((d.value / total) * 100)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  chartFrame: {
    alignSelf: "center",
    position: "relative",
  },
  chartTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  segmentLabel: {
    position: "absolute",
    width: 36,
    textAlign: "center",
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  centerTextWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  centerValue: {
    textAlign: "center",
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: typography.cardTitle.fontSize,
    fontWeight: typography.cardTitle.fontWeight,
    lineHeight: typography.cardTitle.lineHeight,
  },
  centerLabel: {
    textAlign: "center",
    marginTop: 2,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  legend: {
    width: "100%",
    alignSelf: "stretch",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 6,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: typography.tableBody.fontWeight,
    lineHeight: typography.tableBody.lineHeight,
  },
  legendPct: {
    marginLeft: "auto",
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: typography.tableBody.fontWeight,
    lineHeight: typography.tableBody.lineHeight,
  },
});
