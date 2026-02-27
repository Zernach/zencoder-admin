import React, { useEffect } from "react";
import { Slot, usePathname } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { DashboardShell } from "@/components/shell";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { motion } from "@/theme/motion";

export default function DashboardLayout() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const breakpoint = useBreakpoint();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion || breakpoint === "mobile") return;
    opacity.value = 0.8;
    translateY.value = 8;
    opacity.value = withTiming(1, {
      duration: motion.base,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: motion.base,
      easing: Easing.out(Easing.ease),
    });
  }, [pathname, reducedMotion, breakpoint, opacity, translateY]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    flex: 1,
  }));

  return (
    <DashboardShell>
      <Animated.View style={contentStyle}>
        <Slot />
      </Animated.View>
    </DashboardShell>
  );
}
