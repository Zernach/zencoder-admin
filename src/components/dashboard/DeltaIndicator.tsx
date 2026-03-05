import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ArrowUp, ArrowDown } from "lucide-react-native";
import { formatDelta } from "@/features/analytics/utils/formatters";
import type { DeltaPolarity } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface DeltaIndicatorProps {
  value: number;
  polarity?: DeltaPolarity;
}

export function DeltaIndicator({
  value,
  polarity = "positive-good",
}: DeltaIndicatorProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const isPositive = value >= 0;
  const isGood =
    polarity === "positive-good" ? isPositive : !isPositive;
  const color = isGood ? theme.state.success : theme.state.error;
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <View style={styles.container} accessibilityLabel={`${formatDelta(value)} change`}>
      <Icon size={12} color={color} />
      <Text style={[styles.text, { color }]}>{formatDelta(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
