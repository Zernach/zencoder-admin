import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Text as SvgText } from "react-native-svg";
import { arc, pie } from "d3-shape";
import type { KeyValueMetric } from "@/features/analytics/types";
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

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignSelf: "center" }}>
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
          {(centerLabel || centerValue) && (
            <>
              {centerValue && (
                <SvgText
                  x={size / 2}
                  y={size / 2 - (centerLabel ? 6 : 0)}
                  fill="#e5e5e5"
                  fontSize={16}
                  fontWeight="700"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {centerValue}
                </SvgText>
              )}
              {centerLabel && (
                <SvgText
                  x={size / 2}
                  y={size / 2 + 14}
                  fill="#7a7a7a"
                  fontSize={10}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {centerLabel}
                </SvgText>
              )}
            </>
          )}
        </Svg>
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
            <Text style={styles.legendLabel}>{d.key}</Text>
            <Text style={styles.legendPct}>
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
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 11,
    color: "#a3a3a3",
  },
  legendPct: {
    fontSize: 11,
    color: "#7a7a7a",
  },
});
