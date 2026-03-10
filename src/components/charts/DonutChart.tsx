import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { KeyValueMetric } from "@/features/analytics/types";
import { formatPercent } from "@/features/analytics/utils/formatters";
import { typography } from "@/theme/typography";
import { getOrangePieColorsByValue } from "./palette";
import { PieChart, type PieChartDatum } from "./PieChart";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

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
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const safeTotal = total || 1;

  const pieData = useMemo<PieChartDatum[]>(
    () => {
      const colors = getOrangePieColorsByValue(data.map((datum) => datum.value));
      return data.map((datum, index) => ({
        id: datum.key,
        value: datum.value,
        color: colors[index] ?? "#f64a00",
        tooltipRows: [
          { label: datum.key, value: String(datum.value) },
          { label: "Share", value: formatPercent((datum.value / safeTotal) * 100) },
        ],
      }));
    },
    [data, safeTotal],
  );

  return (
    <View style={styles.container}>
      <PieChart data={pieData} size={size} innerRadiusRatio={0.6} style={styles.chartFrame}>
        {({ slices }) => (
          <>
            {slices
              .filter((slice) => slice.percent > 0.05)
              .map((slice) => (
                <Text
                  key={`pct-${slice.id}`}
                  style={[
                    styles.segmentLabel,
                    {
                      left: slice.centroidX - 18,
                      top: slice.centroidY - typography.label.lineHeight / 2,
                      color: mode === "dark" ? "#ffffff" : "#000000",
                    },
                  ]}
                >
                  {formatPercent(slice.percent * 100)}
                </Text>
              ))}

            {(centerLabel || centerValue) && (
              <View style={styles.centerTextWrap}>
                {centerValue ? (
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
                ) : null}
                {centerLabel ? (
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
                ) : null}
              </View>
            )}
          </>
        )}
      </PieChart>
      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={d.key} style={styles.legendItem}>
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor: pieData[i]?.color ?? "#f64a00",
                },
              ]}
            />
            <Text style={[styles.legendLabel, { color: textColors.secondary }]}>
              {d.key}
            </Text>
            <Text style={[styles.legendPct, { color: textColors.tertiary }]}>
              {formatPercent((d.value / safeTotal) * 100)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing[12],
  },
  chartFrame: {
    alignSelf: "center",
  },
  segmentLabel: {
    position: "absolute",
    width: 36,
    textAlign: "center",
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: "600",
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
    marginTop: spacing[2],
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  legend: {
    width: "100%",
    alignSelf: "stretch",
    gap: spacing[8],
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: spacing[6],
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: radius.sm,
  },
  legendLabel: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: "500",
    lineHeight: typography.tableBody.lineHeight,
  },
  legendPct: {
    marginLeft: "auto",
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: "600",
    lineHeight: typography.tableBody.lineHeight,
  },
});
