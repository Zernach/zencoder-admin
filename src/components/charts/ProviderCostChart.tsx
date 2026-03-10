import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ProviderCostRow } from "@/features/analytics/types";
import {
  formatCompactNumber,
  formatPercent,
} from "@/features/analytics/utils/formatters";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { spacing, radius } from "@/theme/tokens";
import { typography } from "@/theme/typography";
import { getOrangePieColorsByValue } from "./palette";
import { PieChart, type PieChartDatum } from "./PieChart";
import { BarChart, type BarChartBreakdownDatum } from "./BarChart";
import { BarPieChart } from "./BarPieChart";
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

export const ProviderCostChart = React.memo(function ProviderCostChart({
  data,
  totalCostUsd,
  height = 180,
}: ProviderCostChartProps) {
  const { mode } = useThemeMode();
  const textColors = semanticThemes[mode].text;
  const { formatCurrency } = useCurrencyFormatter();
  const size = Math.min(height, 180);

  const { sorted, providerMetrics, providerColors, pieData, barData } = useMemo(() => {
    const s = [...data].sort((a, b) => b.totalCostUsd - a.totalCostUsd);
    const chartData = s.map((row) => ({ provider: row.provider, value: row.totalCostUsd }));
    const t = chartData.reduce((sum, row) => sum + row.value, 0) || 1;

    // Pre-compute per-provider metrics to avoid per-render calculations
    const metrics = s.map((row) => ({
      share: (row.totalCostUsd / t) * 100,
      avgCostPerRun: row.runCount > 0 ? row.totalCostUsd / row.runCount : 0,
    }));

    const colors = getOrangePieColorsByValue(s.map((row) => row.totalCostUsd));

    const slices: PieChartDatum[] = s.map((row, index) => ({
      id: row.provider,
      value: row.totalCostUsd,
      color: colors[index] ?? "#f64a00",
      tooltipRows: [
        { label: "Provider", value: PROVIDER_LABELS[row.provider] },
        { label: "Cost", value: formatCurrency(row.totalCostUsd) },
        { label: "Runs", value: formatCompactNumber(row.runCount) },
        {
          label: "Avg/Run",
          value: formatCurrency(row.runCount > 0 ? row.totalCostUsd / row.runCount : 0),
        },
        { label: "Share", value: formatPercent((row.totalCostUsd / t) * 100) },
      ],
    }));
    const providerColorMap = Object.fromEntries(
      slices.map((slice) => [slice.id, slice.color] as const),
    ) as Record<ProviderCostRow["provider"], string>;
    const bars: BarChartBreakdownDatum[] = s.map((row) => ({
      key: PROVIDER_LABELS[row.provider],
      value: row.totalCostUsd,
      hoverRows: [
        { label: "Provider", value: PROVIDER_LABELS[row.provider] },
        { label: "Cost", value: formatCurrency(row.totalCostUsd) },
        { label: "Runs", value: formatCompactNumber(row.runCount) },
        {
          label: "Avg/Run",
          value: formatCurrency(row.runCount > 0 ? row.totalCostUsd / row.runCount : 0),
        },
        { label: "Share", value: formatPercent((row.totalCostUsd / t) * 100) },
      ],
    }));

    return {
      sorted: s,
      providerMetrics: metrics,
      providerColors: providerColorMap,
      pieData: slices,
      barData: bars,
    };
  }, [data, formatCurrency]);

  return (
    <BarPieChart
      defaultMode="pie"
      renderBar={() => (
        <BarChart
          data={barData}
          variant="horizontal-bar"
          showModeToggle={false}
          truncateLabels={false}
          formatValue={formatCurrency}
        />
      )}
      renderPie={() => (
        <View style={styles.pieRow}>
          <PieChart data={pieData} size={size} innerRadiusRatio={0.6} style={styles.chartFrame}>
            {() => (
              <View style={styles.centerTextWrap}>
                <Text style={[styles.centerValue, { color: textColors.primary }]}>
                  {formatCurrency(totalCostUsd)}
                </Text>
                <Text style={[styles.centerLabel, { color: textColors.tertiary }]}>
                  Total
                </Text>
              </View>
            )}
          </PieChart>
          <View style={styles.legend}>
            {sorted.map((row, i) => (
              <View key={row.provider} style={styles.legendItem}>
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: providerColors[row.provider] ?? "#f64a00" },
                  ]}
                />
                <Text
                  style={[styles.legendLabel, { color: textColors.secondary }]}
                  numberOfLines={1}
                >
                  {PROVIDER_LABELS[row.provider]}
                </Text>
                <Text style={[styles.legendValue, { color: textColors.secondary }]}>
                  {formatCurrency(row.totalCostUsd)}
                </Text>
                <Text style={[styles.legendPct, { color: textColors.tertiary }]}>
                  {formatPercent(providerMetrics[i]!.share)}
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
