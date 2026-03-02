import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Text as SvgText } from "react-native-svg";
import { arc, pie } from "d3-shape";
import type { ProviderCostRow } from "@/features/analytics/types";
import { formatCompactNumber, formatCurrency } from "@/features/analytics/utils/formatters";
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

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            {arcs.map((a, i) => {
              const centroid = arcGen.centroid(a);
              const pct = ((a.data.value / total) * 100).toFixed(0);

              return (
                <React.Fragment key={a.data.key}>
                  <Path
                    d={arcGen(a) ?? ""}
                    fill={DATA_PALETTE[i % DATA_PALETTE.length]}
                    transform={`translate(${size / 2},${size / 2})`}
                  />
                  {a.data.value / total > 0.05 && (
                    <SvgText
                      x={size / 2 + centroid[0]}
                      y={size / 2 + centroid[1]}
                      fill="#e5e5e5"
                      fontSize={10}
                      fontWeight="600"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {pct}%
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}

            <SvgText
              x={size / 2}
              y={size / 2 - 6}
              fill="#e5e5e5"
              fontSize={16}
              fontWeight="700"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {formatCurrency(totalCostUsd)}
            </SvgText>
            <SvgText
              x={size / 2}
              y={size / 2 + 14}
              fill="#8a8a8a"
              fontSize={10}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              Cost by provider
            </SvgText>
          </Svg>
        </View>

        <View style={styles.statsColumn}>
          <Text style={styles.statsLabel}>Top provider</Text>
          <Text style={styles.statsValue}>
            {topProvider ? PROVIDER_LABELS[topProvider.provider] : "N/A"}
          </Text>
          <Text style={styles.statsSubtle}>
            {topProvider
              ? `${((topProvider.totalCostUsd / total) * 100).toFixed(1)}% of cost`
              : "No data"}
          </Text>

          <Text style={[styles.statsLabel, styles.metricSpacing]}>Total runs</Text>
          <Text style={styles.statsValue}>{formatCompactNumber(sorted.reduce((sum, row) => sum + row.runCount, 0))}</Text>
          <Text style={styles.statsSubtle}>Across all providers</Text>
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
                  <Text style={styles.providerName}>{PROVIDER_LABELS[row.provider]}</Text>
                </View>
                <Text style={styles.share}>{share.toFixed(1)}%</Text>
              </View>

              <View style={styles.metricsRow}>
                <Text style={styles.metric}>Cost {formatCurrency(row.totalCostUsd)}</Text>
                <Text style={styles.metric}>Runs {formatCompactNumber(row.runCount)}</Text>
                <Text style={styles.metric}>Avg/run {formatCurrency(avgCostPerRun)}</Text>
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
  statsColumn: {
    flex: 1,
    minWidth: 150,
    gap: 2,
  },
  statsLabel: {
    fontSize: 11,
    color: "#8a8a8a",
    textTransform: "uppercase",
  },
  statsValue: {
    fontSize: 16,
    color: "#e5e5e5",
    fontWeight: "700",
  },
  statsSubtle: {
    fontSize: 11,
    color: "#a3a3a3",
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
    fontSize: 12,
    color: "#e5e5e5",
    fontWeight: "600",
  },
  share: {
    fontSize: 12,
    color: "#d4d4d4",
    fontWeight: "600",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 3,
  },
  metric: {
    fontSize: 11,
    color: "#a3a3a3",
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
