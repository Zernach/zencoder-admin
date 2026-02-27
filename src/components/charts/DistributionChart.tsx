import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { bin } from "d3-array";
import { DATA_PALETTE } from "./palette";

interface DistributionChartProps {
  data: number[];
  bins?: number;
  xLabel?: string;
  height?: number;
  color?: string;
}

export function DistributionChart({
  data,
  bins: binCount = 10,
  xLabel,
  height = 200,
  color = DATA_PALETTE[0],
}: DistributionChartProps) {
  if (data.length === 0) return null;

  const histogram = bin().thresholds(binCount)(data);
  const maxCount = Math.max(...histogram.map((b) => b.length), 1);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.bars}>
        {histogram.map((b, i) => {
          const label =
            b.x0 != null && b.x1 != null
              ? `${Math.round(b.x0)}-${Math.round(b.x1)}`
              : String(i);
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barWrapper}>
                <Text style={styles.countLabel}>{b.length}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(b.length / maxCount) * 70}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.binLabel} numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
      {xLabel && <Text style={styles.xLabel}>{xLabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "90%",
    borderRadius: 3,
    minHeight: 2,
  },
  countLabel: {
    fontSize: 9,
    color: "#8a8a8a",
    marginBottom: 2,
  },
  binLabel: {
    fontSize: 8,
    color: "#8a8a8a",
    marginTop: 2,
  },
  xLabel: {
    fontSize: 10,
    color: "#8a8a8a",
    textAlign: "center",
    marginTop: 4,
  },
});
