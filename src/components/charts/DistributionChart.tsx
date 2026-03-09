import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { bin } from "d3-array";
import { DATA_PALETTE } from "./palette";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface DistributionChartProps {
  data: number[];
  bins?: number;
  xLabel?: string;
  height?: number;
  color?: string;
}

export const DistributionChart = React.memo(function DistributionChart({
  data,
  bins: binCount = 10,
  xLabel,
  height = 200,
  color = DATA_PALETTE[0],
}: DistributionChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const { histogram, maxCount } = useMemo(() => {
    if (data.length === 0) return { histogram: [], maxCount: 1 };
    const hist = bin().thresholds(binCount)(data);
    const max = Math.max(...hist.map((b) => b.length), 1);
    return { histogram: hist, maxCount: max };
  }, [data, binCount]);

  if (histogram.length === 0) return null;

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
                <Text style={[styles.countLabel, { color: theme.text.tertiary }]}>{b.length}</Text>
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
              <Text style={[styles.binLabel, { color: theme.text.tertiary }]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
      {xLabel && <Text style={[styles.xLabel, { color: theme.text.tertiary }]}>{xLabel}</Text>}
    </View>
  );
});

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
    marginBottom: 2,
  },
  binLabel: {
    fontSize: 8,
    marginTop: 2,
  },
  xLabel: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
});
