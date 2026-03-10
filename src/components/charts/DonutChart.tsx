import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { KeyValueMetric } from "@/features/analytics/types";
import { formatPercent } from "@/features/analytics/utils/formatters";
import { typography } from "@/theme/typography";
import { getOrangePieColorsByValue } from "./palette";
import { PieChart, type PieChartDatum } from "./PieChart";
import { BarChart, type BarChartBreakdownDatum } from "./BarChart";
import { BarPieChart } from "./BarPieChart";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

interface DonutChartProps {
  data: KeyValueMetric[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

export const DonutChart = React.memo(function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 220,
  formatValue,
}: DonutChartProps) {
  const { mode } = useThemeMode();
  const textColors = semanticThemes[mode].text;
  const size = Math.min(height, 220);
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const safeTotal = total || 1;
  const resolvedFormatValue = formatValue ?? ((value: number) => String(value));

  const barData = useMemo<BarChartBreakdownDatum[]>(
    () =>
      data.map((datum) => ({
        key: datum.key,
        value: datum.value,
        hoverRows: [
          { label: datum.key, value: resolvedFormatValue(datum.value) },
          { label: "Share", value: formatPercent((datum.value / safeTotal) * 100) },
        ],
      })),
    [data, resolvedFormatValue, safeTotal],
  );

  const pieData = useMemo<PieChartDatum[]>(
    () => {
      const colors = getOrangePieColorsByValue(data.map((datum) => datum.value));
      return data.map((datum, index) => ({
        id: datum.key,
        value: datum.value,
        color: colors[index] ?? "#f64a00",
        tooltipRows: [
          { label: datum.key, value: resolvedFormatValue(datum.value) },
          { label: "Share", value: formatPercent((datum.value / safeTotal) * 100) },
        ],
      }));
    },
    [data, safeTotal, resolvedFormatValue],
  );

  return (
    <BarPieChart
      defaultMode="pie"
      renderBar={() => (
        <BarChart
          data={barData}
          variant="horizontal-bar"
          showModeToggle={false}
          truncateLabels={false}
          formatValue={resolvedFormatValue}
        />
      )}
      renderPie={() => (
        <View style={styles.pieRow}>
          <PieChart data={pieData} size={size} innerRadiusRatio={0.6} style={styles.chartFrame}>
            {() => (
              <>
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
                <Text
                  style={[styles.legendLabel, { color: textColors.secondary }]}
                  numberOfLines={1}
                >
                  {d.key}
                </Text>
                <Text style={[styles.legendValue, { color: textColors.secondary }]}>
                  {resolvedFormatValue(d.value)}
                </Text>
                <Text style={[styles.legendPct, { color: textColors.tertiary }]}>
                  {formatPercent((d.value / safeTotal) * 100)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    />
  );
});

const styles = StyleSheet.create({
  pieRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing[16],
  },
  chartFrame: {
    flexShrink: 0,
    alignSelf: "flex-start",
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
    flex: 1,
    minWidth: 180,
    alignSelf: "flex-start",
    justifyContent: "center",
    gap: spacing[8],
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
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
  legendValue: {
    marginLeft: "auto",
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: "600",
    lineHeight: typography.tableBody.lineHeight,
  },
  legendPct: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: "600",
    lineHeight: typography.tableBody.lineHeight,
  },
});
