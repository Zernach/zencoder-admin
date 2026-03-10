import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { bin } from "d3-array";
import { BarChart, type BarChartDatum } from "./BarChart";
import { getOrangeBarShade } from "./palette";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

interface DistributionChartProps {
  data: number[];
  bins?: number;
  xLabel?: string;
  height?: number;
}

export const DistributionChart = React.memo(function DistributionChart({
  data,
  bins: binCount = 10,
  xLabel,
  height = 200,
}: DistributionChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const chartData = useMemo<BarChartDatum[]>(() => {
    if (data.length === 0) return [];
    const hist = bin().thresholds(binCount)(data);
    const counts = hist.map((b) => b.length);
    const min = counts.length > 0 ? Math.min(...counts) : 0;
    const max = counts.length > 0 ? Math.max(...counts) : 1;
    return hist.map((bucket, index) => {
      const label =
        bucket.x0 != null && bucket.x1 != null
          ? `${Math.round(bucket.x0)}-${Math.round(bucket.x1)}`
          : String(index);
      return {
        id: `${label}-${index}`,
        label,
        value: bucket.length,
        valueLabel: String(bucket.length),
        color: getOrangeBarShade(bucket.length, min, max),
        barTestID: `distribution-bar-${index}`,
        tooltipRows: [
          { label: "Range", value: label },
          { label: "Count", value: String(bucket.length) },
        ],
      };
    });
  }, [data, binCount]);

  if (chartData.length === 0) return null;

  return (
    <BarChart
      data={chartData}
      orientation="vertical"
      height={height}
      showValues
      xLabel={xLabel}
      verticalOptions={{
        barWidth: "90%",
        maxBarHeightPercent: 70,
        minBarHeight: 2,
        labelNumberOfLines: 1,
      }}
      layoutStyles={{
        container: styles.container,
        bars: styles.bars,
        column: styles.barCol,
        fill: styles.bar,
      }}
      textStyles={{
        value: [styles.countLabel, { color: theme.text.tertiary }],
        label: [styles.binLabel, { color: theme.text.tertiary }],
        xLabel: [styles.xLabel, { color: theme.text.tertiary }],
      }}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[2],
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  bar: {
    borderRadius: radius.sm,
  },
  countLabel: {
    fontSize: 9,
    fontWeight: "600",
    marginBottom: spacing[2],
  },
  binLabel: {
    fontSize: 8,
    fontWeight: "500",
    marginTop: spacing[2],
  },
  xLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginTop: spacing[4],
  },
});
