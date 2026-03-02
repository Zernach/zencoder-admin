import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { arc, pie } from "d3-shape";
import type { KeyValueMetric } from "@/features/analytics/types";
import { typography } from "@/theme/typography";
import { semanticThemes } from "@/theme/themes";
import { DATA_PALETTE } from "./palette";

interface DonutChartProps {
  data: KeyValueMetric[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 220,
}: DonutChartProps) {
  const size = Math.min(height, 220);
  const radius = size / 2 - 8;
  const innerRadius = radius * 0.6;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  const pieGen = pie<KeyValueMetric>()
    .value((d) => d.value)
    .sort(null);

  const arcGen = arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(innerRadius)
    .outerRadius(radius);

  const arcs = pieGen(data);
  const segmentLabelTypography = typography.label;
  const centerValueTypography = typography.cardTitle;
  const centerLabelTypography = typography.label;
  const textColors = semanticThemes.dark.text;

  return (
    <View style={styles.container}>
      <View style={[styles.chartFrame, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {arcs.map((a, i) => {
            return (
              <React.Fragment key={a.data.key}>
                <Path
                  d={arcGen(a) ?? ""}
                  fill={DATA_PALETTE[i % DATA_PALETTE.length]}
                  transform={`translate(${size / 2},${size / 2})`}
                />
              </React.Fragment>
            );
          })}
        </Svg>
        <View pointerEvents="none" style={styles.chartTextOverlay}>
          {arcs.map((a) => {
            if (a.data.value / total <= 0.05) {
              return null;
            }

            const centroid = arcGen.centroid(a);
            const pct = ((a.data.value / total) * 100).toFixed(0);
            const x = size / 2 + centroid[0];
            const y = size / 2 + centroid[1];

            return (
              <Text
                key={`pct-${a.data.key}`}
                style={[
                  styles.segmentLabel,
                  {
                    left: x - 18,
                    top: y - segmentLabelTypography.lineHeight / 2,
                    color: textColors.primary,
                    fontFamily: segmentLabelTypography.fontFamily,
                    fontSize: segmentLabelTypography.fontSize,
                    fontWeight: "600",
                    lineHeight: segmentLabelTypography.lineHeight,
                  },
                ]}
              >
                {pct}%
              </Text>
            );
          })}

          {(centerLabel || centerValue) && (
            <View style={styles.centerTextWrap}>
              {centerValue && (
                <Text
                  style={[
                    styles.centerValue,
                    {
                      color: textColors.primary,
                      fontFamily: centerValueTypography.fontFamily,
                      fontSize: centerValueTypography.fontSize,
                      fontWeight: "600",
                      lineHeight: centerValueTypography.lineHeight,
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
                      fontFamily: centerLabelTypography.fontFamily,
                      fontSize: centerLabelTypography.fontSize,
                      fontWeight: "500",
                      lineHeight: centerLabelTypography.lineHeight,
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
              {((d.value / total) * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

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
  },
  segmentLabel: {
    position: "absolute",
    width: 36,
    textAlign: "center",
  },
  centerTextWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  centerValue: {
    textAlign: "center",
  },
  centerLabel: {
    textAlign: "center",
    marginTop: 2,
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
    fontWeight: "400",
    lineHeight: typography.tableBody.lineHeight,
  },
  legendPct: {
    marginLeft: "auto",
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: "400",
    lineHeight: typography.tableBody.lineHeight,
  },
});
