import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { DeltaIndicator } from "./DeltaIndicator";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion } from "@/theme/motion";

interface KpiCardProps {
  title: string;
  value: string;
  delta?: number;
  deltaPolarity?: "positive-good" | "negative-good";
  caption?: string;
  period?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

export function KpiCard({
  title,
  value,
  delta,
  deltaPolarity = "positive-good",
  caption,
  period,
  icon,
  onPress,
}: KpiCardProps) {
  const reducedMotion = useReducedMotion();
  const prevValue = useRef(value);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (prevValue.current !== value && !reducedMotion) {
      // Animate cross-fade
      opacity.value = 0;
      translateY.value = 8;
      opacity.value = withTiming(1, {
        duration: motion.base,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(0, {
        duration: motion.base,
        easing: Easing.out(Easing.ease),
      });
    }
    prevValue.current = value;
  }, [value, reducedMotion, opacity, translateY]);

  const valueAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const content = (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.valueRow}>
        <Animated.View style={valueAnimStyle}>
          <Text style={styles.value}>{value}</Text>
        </Animated.View>
        {delta != null && (
          <DeltaIndicator value={delta} polarity={deltaPolarity} />
        )}
      </View>
      {(caption || period) && (
        <Text style={styles.caption}>
          {caption}
          {caption && period ? " · " : ""}
          {period}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${value}`}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 10,
    padding: 16,
    minHeight: 132,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 11,
    fontWeight: "500",
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e5e5e5",
    letterSpacing: -0.3,
  },
  caption: {
    fontSize: 11,
    color: "#8a8a8a",
  },
  pressed: {
    opacity: 0.85,
  },
});
