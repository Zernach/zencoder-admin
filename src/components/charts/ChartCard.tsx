import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { motion } from "@/theme/motion";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  loading,
  error,
  onRetry,
  children,
}: ChartCardProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const borderColor = useSharedValue(0);

  const onHoverIn = useCallback(() => {
    if (Platform.OS === "web") {
      borderColor.value = withTiming(1, {
        duration: motion.fast,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [borderColor]);

  const onHoverOut = useCallback(() => {
    if (Platform.OS === "web") {
      borderColor.value = withTiming(0, {
        duration: motion.fast,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [borderColor]);

  const hoverStyle = useAnimatedStyle(() => ({
    borderColor:
      borderColor.value > 0.5
        ? theme.bg.brandSubtle
        : theme.border.subtle,
    backgroundColor:
      borderColor.value > 0.5
        ? theme.bg.surfaceHover
        : theme.bg.surface,
  }));

  const viewProps = Platform.OS === "web"
    ? { onMouseEnter: onHoverIn, onMouseLeave: onHoverOut }
    : {};

  return (
    <Animated.View style={[styles.card, hoverStyle]} {...viewProps}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{subtitle}</Text>}
      </View>
      {loading ? (
        <LoadingSkeleton variant="chart" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry ?? (() => {})} />
      ) : (
        children
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
