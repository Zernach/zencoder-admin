import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { arc, pie } from "d3-shape";
import type { ProviderCostRow } from "@/features/analytics/types";
import {
  formatCompactNumber,
  formatCurrency,
  formatPercent,
} from "@/features/analytics/utils/formatters";
import { typography } from "@/theme/typography";
import { DATA_PALETTE } from "./palette";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

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
  height = 180,
}: ProviderCostChartProps) {
  const { mode } = useThemeMode();
  const textColors = semanticThemes[mode].text;
  const sorted = [...data].sort((a, b) => b.totalCostUsd - a.totalCostUsd);
  const chartData = sorted.map((row) => ({ key: row.provider, value: row.totalCostUsd }));
  const total = chartData.reduce((sum, row) => sum + row.value, 0) || 1;
  const size = Math.min(height, 180);
  const radius = size / 2 - 8;
  const innerRadius = radius * 0.6;
  const pieGen = pie<{ key: string; value: number }>()
    .value((d) => d.value)
    .sort(null);
  const arcGen = arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(innerRadius)
    .outerRadius(radius);
  const arcs = pieGen(chartData);

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
          <View style={styles.centerTextWrap}>
            <Text style={[styles.centerValue, { color: textColors.primary }]}>
              {formatCurrency(totalCostUsd)}
            </Text>
            <Text style={[styles.centerLabel, { color: textColors.tertiary }]}>
              Cost by Provider
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rightColumn}>
        {sorted.map((row, i) => {
          const share = (row.totalCostUsd / total) * 100;
          const avgCostPerRun = row.runCount > 0 ? row.totalCostUsd / row.runCount : 0;

          return (
            <View key={row.provider} style={[styles.row, i > 0 ? styles.rowSpacing : null]}>
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

              <Text style={[styles.metricLabel, { color: textColors.secondary }]}>
                {`${formatCurrency(row.totalCostUsd)} • ${formatCompactNumber(row.runCount)} runs • ${formatCurrency(avgCostPerRun)}/run`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
  },
  chartFrame: {
    position: "relative",
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  chartTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
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
  rightColumn: {
    minWidth: 220,
    maxWidth: 320,
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: "flex-start",
  },
  row: {
    gap: 6,
  },
  rowSpacing: {
    marginTop: 10,
  },
  rowHeader: {
    alignItems: "flex-start",
    gap: 2,
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
  metricLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
});
