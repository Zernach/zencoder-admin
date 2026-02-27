import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { KeyValueMetric } from "@/features/analytics/types";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import { DATA_PALETTE } from "./palette";

interface BreakdownChartProps {
  data: KeyValueMetric[];
  variant: "bar" | "horizontal-bar";
  color?: string;
  height?: number;
  showValues?: boolean;
}

export function BreakdownChart({
  data,
  variant = "bar",
  height = 200,
  showValues = true,
}: BreakdownChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const maxVal = Math.max(...sorted.map((d) => d.value), 1);

  if (variant === "horizontal-bar") {
    return (
      <View style={[styles.container, { minHeight: height }]}>
        {sorted.map((item, i) => (
          <View key={item.key} style={styles.hBarRow}>
            <Text style={styles.hBarLabel} numberOfLines={1}>
              {item.key}
            </Text>
            <View style={styles.hBarTrack}>
              <View
                style={[
                  styles.hBarFill,
                  {
                    width: `${(item.value / maxVal) * 100}%`,
                    backgroundColor:
                      DATA_PALETTE[i % DATA_PALETTE.length],
                  },
                ]}
              />
            </View>
            {showValues && (
              <Text style={styles.hBarValue}>
                {formatCompactNumber(item.value)}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  }

  // Vertical bars
  return (
    <View style={[styles.barContainer, { height }]}>
      {sorted.map((item, i) => (
        <View key={item.key} style={styles.barCol}>
          <View style={styles.barWrapper}>
            {showValues && (
              <Text style={styles.barValue}>
                {formatCompactNumber(item.value)}
              </Text>
            )}
            <View
              style={[
                styles.bar,
                {
                  height: `${(item.value / maxVal) * 70}%`,
                  backgroundColor:
                    DATA_PALETTE[i % DATA_PALETTE.length],
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel} numberOfLines={1}>
            {item.key}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  hBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hBarLabel: {
    width: 80,
    fontSize: 11,
    color: "#a3a3a3",
  },
  hBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: "#262626",
    borderRadius: 4,
    overflow: "hidden",
  },
  hBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  hBarValue: {
    width: 48,
    fontSize: 11,
    color: "#e5e5e5",
    textAlign: "right",
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
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
    width: "80%",
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: "#a3a3a3",
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: "#8a8a8a",
    marginTop: 4,
    textAlign: "center",
  },
});
