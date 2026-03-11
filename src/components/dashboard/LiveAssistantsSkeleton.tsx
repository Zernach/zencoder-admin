import React, { memo, useEffect, useRef } from "react";
import { Animated as RNAnimated, Easing, StyleSheet, View } from "react-native";
import { isWeb } from "@/constants/platform";
import type { SemanticTheme } from "@/theme/themes";
import { radius, spacing } from "@/theme/tokens";

const CARD_WIDTH = 240;
const CARD_HEIGHT = 108;
const DEFAULT_CARD_COUNT = 4;
const PULSE_DURATION_MS = 1100;
const SHIMMER_DURATION_MS = 1600;
const SHIMMER_IDLE_MS = 400;

type ThemeColors = Omit<SemanticTheme, "shadows">;

interface LiveAssistantsSkeletonProps {
  theme: ThemeColors;
  reducedMotion: boolean;
  cardCount?: number;
}

const LiveAssistantsSkeletonCard = memo(function LiveAssistantsSkeletonCard({
  index,
  reducedMotion,
  theme,
}: {
  index: number;
  reducedMotion: boolean;
  theme: ThemeColors;
}) {
  const pulse = useRef(new RNAnimated.Value(reducedMotion ? 0.76 : 0.4)).current;
  const sweep = useRef(new RNAnimated.Value(0)).current;
  const staggerMs = index * 120;

  useEffect(() => {
    if (reducedMotion) {
      pulse.setValue(0.76);
      return undefined;
    }

    const pulseLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.delay(staggerMs),
        RNAnimated.timing(pulse, {
          toValue: 1,
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: !isWeb,
        }),
        RNAnimated.timing(pulse, {
          toValue: 0.4,
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: !isWeb,
        }),
      ])
    );

    pulseLoop.start();
    return () => {
      pulseLoop.stop();
      pulse.setValue(0.76);
    };
  }, [pulse, reducedMotion, staggerMs]);

  useEffect(() => {
    if (reducedMotion) {
      sweep.setValue(0);
      return undefined;
    }

    const sweepLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.delay(160 + staggerMs),
        RNAnimated.timing(sweep, {
          toValue: 1,
          duration: SHIMMER_DURATION_MS,
          easing: Easing.linear,
          useNativeDriver: !isWeb,
        }),
        RNAnimated.timing(sweep, {
          toValue: 0,
          duration: 0,
          easing: Easing.linear,
          useNativeDriver: !isWeb,
        }),
        RNAnimated.delay(SHIMMER_IDLE_MS),
      ])
    );

    sweepLoop.start();
    return () => {
      sweepLoop.stop();
      sweep.setValue(0);
    };
  }, [reducedMotion, staggerMs, sweep]);

  const bone = theme.bg.surfaceElevated;
  const boneSoft = theme.bg.subtle;

  const pulseStyle = {
    opacity: reducedMotion
      ? 0.78
      : pulse.interpolate({
        inputRange: [0.4, 1],
        outputRange: [0.5, 1],
      }),
  };

  const shimmerStyle = {
    opacity: reducedMotion
      ? 0
      : sweep.interpolate({
        inputRange: [0, 0.4, 0.6, 1],
        outputRange: [0, 0.38, 0.38, 0],
      }),
    transform: [
      {
        translateX: sweep.interpolate({
          inputRange: [0, 1],
          outputRange: [-CARD_WIDTH * 1.2, CARD_WIDTH * 1.2],
        }),
      },
      { rotate: "-14deg" as const },
    ],
  };

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: theme.border.subtle,
          backgroundColor: theme.bg.surface,
        },
      ]}
      testID={`live-assistants-skeleton-card-${index}`}
    >
      <RNAnimated.View style={[styles.cardContent, pulseStyle]}>
        <View style={styles.topRow}>
          <View style={[styles.avatar, { backgroundColor: bone }]} />
          <View style={styles.titleStack}>
            <View style={[styles.titleBar, { backgroundColor: bone }]} />
            <View style={[styles.subtitleBar, { backgroundColor: boneSoft }]} />
          </View>
          <View style={[styles.progressRing, { backgroundColor: boneSoft }]} />
        </View>
        <View style={[styles.taskBar, { backgroundColor: bone }]} />
        <View style={styles.metaRow}>
          <View style={[styles.metaLeftBar, { backgroundColor: boneSoft }]} />
          <View style={[styles.metaRightBar, { backgroundColor: bone }]} />
        </View>
      </RNAnimated.View>
      <RNAnimated.View
        style={[
          styles.shimmer,
          {
            pointerEvents: "none",
            backgroundColor: theme.bg.surfaceElevated,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
});

export const LiveAssistantsSkeleton = memo(function LiveAssistantsSkeleton({
  cardCount = DEFAULT_CARD_COUNT,
  reducedMotion,
  theme,
}: LiveAssistantsSkeletonProps) {
  return (
    <View style={styles.wrap} testID="live-assistants-skeleton">
      {Array.from({ length: cardCount }).map((_, index) => (
        <LiveAssistantsSkeletonCard
          key={index}
          index={index}
          reducedMotion={reducedMotion}
          theme={theme}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing[12],
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[12],
    gap: spacing[8],
    overflow: "hidden",
    position: "relative",
  },
  cardContent: {
    gap: spacing[8],
  },
  shimmer: {
    position: "absolute",
    top: -44,
    left: -80,
    width: 84,
    height: CARD_HEIGHT + 94,
    borderRadius: radius.full,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
  },
  titleStack: {
    flex: 1,
    gap: spacing[6],
  },
  titleBar: {
    width: "68%",
    height: 12,
    borderRadius: radius.sm,
  },
  subtitleBar: {
    width: "46%",
    height: 9,
    borderRadius: radius.sm,
  },
  progressRing: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
  },
  taskBar: {
    width: "82%",
    height: 10,
    borderRadius: radius.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing[12],
  },
  metaLeftBar: {
    width: "56%",
    height: 9,
    borderRadius: radius.sm,
  },
  metaRightBar: {
    width: "22%",
    height: 9,
    borderRadius: radius.sm,
  },
});
