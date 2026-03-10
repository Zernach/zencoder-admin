import React, { memo, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { spacing, radius } from "@/theme/tokens";
import { DeltaIndicator } from "./DeltaIndicator";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion } from "@/theme/motion";
import type { DeltaPolarity } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface CaptionLink {
  text: string;
  onPress: () => void;
}

interface KpiCardProps {
  title: string;
  value: string;
  valueColor?: string;
  delta?: number;
  deltaPolarity?: DeltaPolarity;
  caption?: string;
  captionLink?: CaptionLink;
  period?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

export const KpiCard = memo(function KpiCard({
  title,
  value,
  valueColor,
  delta,
  deltaPolarity = "positive-good",
  caption,
  captionLink,
  period,
  icon,
  onPress,
}: KpiCardProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const reducedMotion = useReducedMotion();
  const prevValue = useRef(value);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const resolvedValueColor = valueColor ?? theme.text.primary;

  useEffect(() => {
    if (prevValue.current !== value && !reducedMotion) {
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
    <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
      <View style={styles.header}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[styles.title, { color: theme.text.secondary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.valueRow}>
        <Animated.View style={[styles.valueWrap, valueAnimStyle]}>
          <Text
            style={[styles.value, { color: resolvedValueColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.58}
            allowFontScaling
            maxFontSizeMultiplier={1.2}
          >
            {value}
          </Text>
        </Animated.View>
        {delta != null && (
          <View style={styles.deltaWrap}>
            <DeltaIndicator value={delta} polarity={deltaPolarity} />
          </View>
        )}
      </View>
      {(caption || captionLink || period) && (
        <Text style={[styles.caption, { color: theme.text.tertiary }]}>
          {caption}
          {captionLink && (
            <Text
              style={[styles.captionLink, { color: theme.border.brand }]}
              onPress={captionLink.onPress}
              accessibilityRole="link"
            >
              {captionLink.text}
            </Text>
          )}
          {(caption || captionLink) && period ? " · " : ""}
          {period}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <CustomButton
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${value}`}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </CustomButton>
    );
  }

  return content;
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[16],
    minHeight: 132,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
    marginBottom: spacing[8],
  },
  icon: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "nowrap",
    gap: spacing[8],
    marginBottom: spacing[4],
    width: "100%",
    minWidth: 0,
  },
  valueWrap: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  deltaWrap: {
    flexShrink: 0,
  },
  caption: {
    fontSize: 11,
  },
  captionLink: {
    textDecorationLine: "underline" as const,
    fontWeight: "600" as const,
  },
  pressed: {
    opacity: 0.85,
  },
});
