import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface LoadingSkeletonProps {
  variant: "kpi" | "chart" | "table" | "text";
  rows?: number;
  columns?: number;
}

function SkeletonBlock({ width, height }: { width: number | string; height: number }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.block,
        { width: width as number, height },
        animatedStyle,
      ]}
    />
  );
}

export function LoadingSkeleton({
  variant,
  rows = 5,
}: LoadingSkeletonProps) {
  switch (variant) {
    case "kpi":
      return (
        <View style={styles.kpiContainer}>
          <SkeletonBlock width="60%" height={12} />
          <SkeletonBlock width="40%" height={28} />
          <SkeletonBlock width="30%" height={12} />
        </View>
      );
    case "chart":
      return (
        <View style={styles.chartContainer}>
          <SkeletonBlock width="100%" height={200} />
        </View>
      );
    case "table":
      return (
        <View style={styles.tableContainer}>
          <SkeletonBlock width="100%" height={32} />
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonBlock key={i} width="100%" height={40} />
          ))}
        </View>
      );
    case "text":
      return (
        <View style={styles.textContainer}>
          <SkeletonBlock width="90%" height={14} />
          <SkeletonBlock width="75%" height={14} />
          <SkeletonBlock width="60%" height={14} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#262626",
    borderRadius: 6,
  },
  kpiContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 16,
    minHeight: 132,
    gap: 12,
    justifyContent: "center",
  },
  chartContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 16,
  },
  tableContainer: {
    gap: 4,
  },
  textContainer: {
    gap: 8,
  },
});
