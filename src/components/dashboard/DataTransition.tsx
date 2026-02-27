import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion } from "@/theme/motion";

interface DataTransitionProps {
  loading?: boolean;
  children: React.ReactNode;
}

export function DataTransition({ loading, children }: DataTransitionProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    if (loading) {
      opacity.value = withTiming(0.5, {
        duration: motion.fast,
        easing: Easing.out(Easing.ease),
      });
    } else {
      opacity.value = withTiming(1, {
        duration: motion.base,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [loading, reducedMotion, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={animStyle}>{children}</Animated.View>;
}
