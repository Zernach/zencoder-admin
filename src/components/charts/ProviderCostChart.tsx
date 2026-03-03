import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { arc, pie } from "d3-shape";
import type { ProviderCostRow } from "@/features/analytics/types";
import { formatCompactNumber, formatCurrency, formatPercent } from "@/features/analytics/utils/formatters";
import { typography } from "@/theme/typography";
import { semanticThemes } from "@/theme/themes";
import { DATA_PALETTE } from "./palette";

interface ProviderCostChartProps {
  data: ProviderCostRow[];
  totalCostUsd: number;
  height?: number;
}

const PROVIDER_LABELS: Record<ProviderCostRow["provider"], string> = {
  codex: "Codex",
  claude: "Claude",
  other: "Other",
};

export function ProviderCostChart({
  data,
  totalCostUsd,
  height = 220,
}: ProviderCostChartProps) {
  const sorted = [...data].sort((a, b) => b.totalCostUsd - a.totalCostUsd);
  const topProvider = sorted[0];
  const chartData = sorted.map((row) => ({ key: row.provider, value: row.totalCostUsd }));
  const total = chartData.reduce((sum, row) => sum + row.value, 0) || 1;
  const maxRuns = Math.max(...sorted.map((row) => row.runCount), 1);

  const size = Math.min(height, 220);
  const radius = size / 2 - 8;
  const innerRadius = radius * 0.6;

  const pieGen = pie<{ key: string; value: number }>()
    .value((d) => d.value)
    .sort(null);

  const arcGen = arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(innerRadius)
    .outerRadius(radius);

  const arcs = pieGen(chartData);
  const segmentLabelTypography = typography.label;
  const textColors = semanticThemes.dark.text;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
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
          <View pointerEvents="none" style={styles.chartTextOverlay}>
            {arcs.map((a) => {
              if (a.data.value / total <= 0.05) {
                return null;
              }

              const centroid = arcGen.centroid(a);
              const pct = formatPercent((a.data.value / total) * 100);
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
                    },
                  ]}
                >
                  {pct}
                </Text>
              );
            })}
            <View style={styles.centerTextWrap}>
              <Text
                style={[
                  styles.centerValue,
                  {
                    color: textColors.primary,
                  },
                ]}
              >
                {formatCurrency(totalCostUsd)}
              </Text>
              <Text
                style={[
                  styles.centerLabel,
                  {
                    color: textColors.tertiary,
                  },
                ]}
              >
                Cost by Provider
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsColumn}>
          <Text style={[styles.statsLabel, { color: textColors.tertiary }]}>Top provider</Text>
          <Text style={[styles.statsValue, { color: textColors.primary }]}>
            {topProvider ? PROVIDER_LABELS[topProvider.provider] : "N/A"}
          </Text>
          <Text style={[styles.statsSubtle, { color: textColors.secondary }]}>
                {topProvider
              ? `${formatPercent((topProvider.totalCostUsd / total) * 100)} of cost`
              : "No data"}
          </Text>

          <Text style={[styles.statsLabel, styles.metricSpacing, { color: textColors.tertiary }]}>
            Total runs
          </Text>
          <Text style={[styles.statsValue, { color: textColors.primary }]}>
            {formatCompactNumber(sorted.reduce((sum, row) => sum + row.runCount, 0))}
          </Text>
          <Text style={[styles.statsSubtle, { color: textColors.secondary }]}>Across all providers</Text>
        </View>
      </View>

      <View style={styles.rows}>
        {sorted.map((row, i) => {
          const share = (row.totalCostUsd / total) * 100;
          const avgCostPerRun = row.runCount > 0 ? row.totalCostUsd / row.runCount : 0;

          return (
            <View key={row.provider} style={styles.row}>
              <View style={styles.rowHeader}>
                <View style={styles.providerNameWrap}>
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: DATA_PALETTE[i % DATA_PALETTE.length] },
                    ]}
                  />
                  <Text style={[styles.providerName, { color: textColors.primary }]}>
                    {PROVIDER_LABELS[row.provider]}
                  </Text>
                </View>
                <Text style={[styles.share, { color: textColors.secondary }]}>
                  {formatPercent(share)}
                </Text>
              </View>

              <View style={styles.metricsRow}>
                <Text style={[styles.metric, { color: textColors.secondary }]}>
                  Cost {formatCurrency(row.totalCostUsd)}
                </Text>
                <Text style={[styles.metric, { color: textColors.secondary }]}>
                  Runs {formatCompactNumber(row.runCount)}
                </Text>
                <Text style={[styles.metric, { color: textColors.secondary }]}>
                  Avg/run {formatCurrency(avgCostPerRun)}
                </Text>
              </View>

              <View style={styles.runBarTrack}>
                <View
                  style={[
                    styles.runBarFill,
                    {
                      width: `${(row.runCount / maxRuns) * 100}%`,
                      backgroundColor: DATA_PALETTE[i % DATA_PALETTE.length],
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  top: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  chartFrame: {
    position: "relative",
  },
  chartTextOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  statsColumn: {
    flex: 1,
    minWidth: 150,
    gap: 2,
  },
  statsLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
    textTransform: "uppercase",
  },
  statsValue: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: typography.cardTitle.fontSize,
    fontWeight: typography.cardTitle.fontWeight,
    lineHeight: typography.cardTitle.lineHeight,
  },
  statsSubtle: {
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  metricSpacing: {
    marginTop: 12,
  },
  rows: {
    gap: 10,
  },
  row: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  providerNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  swatch: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  providerName: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: typography.tableBody.fontWeight,
    lineHeight: typography.tableBody.lineHeight,
  },
  share: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: typography.tableBody.fontWeight,
    lineHeight: typography.tableBody.lineHeight,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 3,
  },
  metric: {
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  runBarTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#262626",
    overflow: "hidden",
  },
  runBarFill: {
    height: "100%",
    borderRadius: 4,
    minWidth: 3,
  },
});
