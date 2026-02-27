import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ArrowUp, ArrowDown } from "lucide-react-native";
import { formatDelta } from "@/features/analytics/utils/formatters";

interface DeltaIndicatorProps {
  value: number;
  polarity?: "positive-good" | "negative-good";
}

export function DeltaIndicator({
  value,
  polarity = "positive-good",
}: DeltaIndicatorProps) {
  const isPositive = value >= 0;
  const isGood =
    polarity === "positive-good" ? isPositive : !isPositive;
  const color = isGood ? "#22c55e" : "#ef4444";
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
