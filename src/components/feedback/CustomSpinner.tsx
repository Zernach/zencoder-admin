import React, { memo, useEffect } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Reanimated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

const DEFAULT_SIZE = 12;
const DEFAULT_STROKE_WIDTH = 1.8;
const DEFAULT_DURATION_MS = 1000;
const ARC_RATIO = 0.72;

interface CustomSpinnerProps {
  size?: number;
  strokeWidth?: number;
  durationMs?: number;
  color?: string;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const CustomSpinner = memo(function CustomSpinner({
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  durationMs = DEFAULT_DURATION_MS,
  color,
  trackColor,
  style,
}: CustomSpinnerProps) {
  const reducedMotion = useReducedMotion();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const spinDegrees = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(spinDegrees);
      spinDegrees.value = 0;
      return undefined;
    }

    spinDegrees.value = 0;
    spinDegrees.value = withRepeat(
      withTiming(360, { duration: durationMs, easing: Easing.linear }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(spinDegrees);
      spinDegrees.value = 0;
    };
  }, [durationMs, reducedMotion, spinDegrees]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinDegrees.value}deg` }],
  }));

  const stroke = color ?? theme.state.info;
  const backgroundStroke = trackColor ?? theme.data.gridLine;
  const radius = Math.max(0.1, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * ARC_RATIO;
  const remainingLength = circumference - arcLength;

  return (
    <Reanimated.View style={[styles.root, spinnerStyle, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundStroke}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${remainingLength}`}
        />
      </Svg>
    </Reanimated.View>
  );
});

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
});
