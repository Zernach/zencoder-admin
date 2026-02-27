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
        ? "rgba(48, 168, 220, 0.2)"
        : "#242424",
    backgroundColor:
      borderColor.value > 0.5
        ? "#1e1e1e"
        : "#1a1a1a",
  }));

  const viewProps = Platform.OS === "web"
    ? { onMouseEnter: onHoverIn, onMouseLeave: onHoverOut }
    : {};

  return (
    <Animated.View style={[styles.card, hoverStyle]} {...viewProps}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 10,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e5e5",
  },
  subtitle: {
    fontSize: 12,
    color: "#a3a3a3",
    marginTop: 2,
  },
});
