import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ProviderCostRow } from "@/features/analytics/types";
import { DATA_PALETTE } from "./palette";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { typography } from "@/theme/typography";

interface ProviderTokenCostBarChartProps {
  data: ProviderCostRow[];
  height?: number;
}

const PROVIDER_LABELS: Record<ProviderCostRow["provider"], string> = {
  codex: "Codex",
  claude: "Claude",
  other: "Other",
};

function computeCostPerToken(row: ProviderCostRow): number {
  if (row.totalTokens <= 0) return 0;
  return row.totalCostUsd / row.totalTokens;
}

function formatTenThousandths(usdPerToken: number): string {
  return Math.round(usdPerToken * 1_000_000).toLocaleString("en-US");
}

export function ProviderTokenCostBarChart({
  data,
  height = 180,
}: ProviderTokenCostBarChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const ranked = [...data]
    .map((row) => ({
      ...row,
      costPerToken: computeCostPerToken(row),
    }))
    .sort((a, b) => b.costPerToken - a.costPerToken);

  const maxCost = Math.max(...ranked.map((r) => r.costPerToken), 0);

  return (
    <View style={[styles.container, { minHeight: height }]}>
      <View style={styles.bars}>
        {ranked.map((row, i) => {
          const barFraction = maxCost > 0 ? row.costPerToken / maxCost : 0;
          const barColor = DATA_PALETTE[i % DATA_PALETTE.length];
          return (
            <View key={row.provider} style={styles.row}>
              <Text
                style={[styles.label, { color: theme.text.primary }]}
                numberOfLines={1}
              >
                {PROVIDER_LABELS[row.provider]}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(barFraction * 100, 2)}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.value, { color: theme.text.secondary }]}
                numberOfLines={1}
              >
                {formatTenThousandths(row.costPerToken)}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.axisLabel, { color: theme.text.tertiary }]}>
        ten-thousandths of a penny per token
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    justifyContent: "center",
  },
  bars: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    width: 60,
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: typography.tableBody.fontWeight,
    lineHeight: typography.tableBody.lineHeight,
  },
  barTrack: {
    flex: 1,
    height: 20,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(128,128,128,0.1)",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  value: {
    flexShrink: 0,
    minWidth: 28,
    textAlign: "right",
    fontFamily: typography.tableBody.fontFamily,
    fontSize: typography.tableBody.fontSize,
    fontWeight: typography.tableBody.fontWeight,
    lineHeight: typography.tableBody.lineHeight,
  },
  axisLabel: {
    textAlign: "right",
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
});
