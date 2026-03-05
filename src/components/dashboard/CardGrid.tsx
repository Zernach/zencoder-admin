import React, { useEffect } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion } from "@/theme/motion";

interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6;
  gap?: number;
}

interface StaggerChildProps {
  index: number;
  reducedMotion: boolean;
  children: React.ReactNode;
  style: Record<string, unknown>;
}

function StaggerChild({
  index,
  reducedMotion,
  children,
  style,
}: StaggerChildProps) {
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const translateY = useSharedValue(reducedMotion ? 0 : 12);

  useEffect(() => {
    if (!reducedMotion) {
      opacity.value = withDelay(
        index * 50,
        withTiming(1, { duration: motion.base, easing: Easing.out(Easing.ease) })
      );
      translateY.value = withDelay(
        index * 50,
        withTiming(0, { duration: motion.base, easing: Easing.out(Easing.ease) })
      );
    }
  }, [index, reducedMotion, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}

export function CardGrid({
  children,
  columns = 4,
  gap = 16,
}: CardGridProps) {
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();

  let effectiveCols: number = columns;
  if (width < 768) effectiveCols = 1;
  else if (width < 1360) effectiveCols = Math.min(columns, 2);

  const childArray = React.Children.toArray(children);

  return (
    <View style={[styles.grid, { gap }]}>
      {childArray.map((child, i) => (
        <StaggerChild
          key={i}
          index={i}
          reducedMotion={reducedMotion}
          style={{
            flex: effectiveCols === 1 ? undefined : 1,
            width: effectiveCols === 1 ? "100%" : undefined,
            minWidth:
              effectiveCols > 1
                ? `${Math.floor(100 / effectiveCols) - 2}%`
                : undefined,
            maxWidth:
              effectiveCols > 1
                ? `${Math.floor(100 / effectiveCols)}%`
                : undefined,
          }}
        >
          {child}
        </StaggerChild>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
