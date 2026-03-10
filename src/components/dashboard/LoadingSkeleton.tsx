import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { spacing, radius } from "@/theme/tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface LoadingSkeletonProps {
  variant: "kpi" | "chart" | "table" | "text";
  rows?: number;
  columns?: number;
}

const SkeletonBlock = React.memo(function SkeletonBlock({
  width,
  height,
  reducedMotion,
  blockColor,
}: {
  width: number | string;
  height: number;
  reducedMotion: boolean;
  blockColor: string;
}) {
  const opacity = useSharedValue(reducedMotion ? 0.6 : 0.4);

  useEffect(() => {
    if (!reducedMotion) {
      opacity.value = withRepeat(
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [opacity, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.block,
        { width: width as number, height, backgroundColor: blockColor },
        animatedStyle,
      ]}
    />
  );
});

export const LoadingSkeleton = React.memo(function LoadingSkeleton({
  variant,
  rows = 5,
}: LoadingSkeletonProps) {
  const reducedMotion = useReducedMotion();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const blockColor = theme.bg.surfaceElevated;
  const surfaceColor = theme.bg.surface;

  switch (variant) {
    case "kpi":
      return (
        <View style={[styles.kpiContainer, { backgroundColor: surfaceColor }]}>
          <SkeletonBlock width="60%" height={12} reducedMotion={reducedMotion} blockColor={blockColor} />
          <SkeletonBlock width="40%" height={28} reducedMotion={reducedMotion} blockColor={blockColor} />
          <SkeletonBlock width="30%" height={12} reducedMotion={reducedMotion} blockColor={blockColor} />
        </View>
      );
    case "chart":
      return (
        <View style={[styles.chartContainer, { backgroundColor: surfaceColor }]}>
          <SkeletonBlock width="100%" height={200} reducedMotion={reducedMotion} blockColor={blockColor} />
        </View>
      );
    case "table":
      return (
        <View style={styles.tableContainer}>
          <SkeletonBlock width="100%" height={32} reducedMotion={reducedMotion} blockColor={blockColor} />
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonBlock key={i} width="100%" height={40} reducedMotion={reducedMotion} blockColor={blockColor} />
          ))}
        </View>
      );
    case "text":
      return (
        <View style={styles.textContainer}>
          <SkeletonBlock width="90%" height={14} reducedMotion={reducedMotion} blockColor={blockColor} />
          <SkeletonBlock width="75%" height={14} reducedMotion={reducedMotion} blockColor={blockColor} />
          <SkeletonBlock width="60%" height={14} reducedMotion={reducedMotion} blockColor={blockColor} />
        </View>
      );
  }
});

const styles = StyleSheet.create({
  block: {
    borderRadius: radius.sm,
  },
  kpiContainer: {
    borderRadius: radius.md,
    padding: spacing[16],
    minHeight: 132,
    gap: spacing[12],
    justifyContent: "center",
  },
  chartContainer: {
    borderRadius: radius.md,
    padding: spacing[16],
  },
  tableContainer: {
    gap: spacing[4],
  },
  textContainer: {
    gap: spacing[8],
  },
});
