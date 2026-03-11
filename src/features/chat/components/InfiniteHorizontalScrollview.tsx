import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ScrollView,
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { CustomButton } from "@/components/buttons";
import type { SuggestedPrompt } from "@/features/chat/constants/suggestedPrompts";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";

const DEFAULT_SPEED_PIXELS_PER_SECOND = 14;
const RESUME_SCROLL_DELAY_MS = 1200;

interface InfiniteHorizontalScrollviewProps {
  prompts: readonly SuggestedPrompt[];
  onPressPrompt: (promptMessage: string) => void;
  disabled?: boolean;
  speedPixelsPerSecond?: number;
  leadingOffsetPx?: number;
  initialScrollOffsetPx?: number;
}

function normalizeOffset(offset: number, cycleWidth: number): number {
  "worklet";
  if (cycleWidth <= 0) {
    return offset;
  }
  if (offset >= cycleWidth) {
    return offset % cycleWidth;
  }
  if (offset < 0) {
    const remainder = offset % cycleWidth;
    return remainder === 0 ? 0 : cycleWidth + remainder;
  }
  return offset;
}

export function InfiniteHorizontalScrollview({
  prompts,
  onPressPrompt,
  disabled = false,
  speedPixelsPerSecond = DEFAULT_SPEED_PIXELS_PER_SECOND,
  leadingOffsetPx = 0,
  initialScrollOffsetPx = 0,
}: InfiniteHorizontalScrollviewProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const scrollRef = useAnimatedRef<ScrollView>();
  const cycleWidth = useSharedValue(0);
  const autoOffset = useSharedValue(0);
  const lastOffset = useSharedValue(0);
  const paused = useSharedValue(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldAnimate = prompts.length > 1;

  const clearResumeTimer = useCallback(() => {
    if (resumeTimeoutRef.current == null) {
      return;
    }
    clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = null;
  }, []);

  const startAutoScroll = useCallback(
    (resetOffset: boolean) => {
      runOnUI(
        (
          shouldAutoAnimate: boolean,
          speed: number,
          shouldResetOffset: boolean,
          initialOffset: number,
        ) => {
          "worklet";
          cancelAnimation(autoOffset);
          paused.value = false;
          if (shouldResetOffset) {
            autoOffset.value = initialOffset;
            lastOffset.value = initialOffset;
            scrollTo(scrollRef, initialOffset, 0, false);
          }

          if (!shouldAutoAnimate || speed <= 0 || cycleWidth.value <= 0) {
            return;
          }

          const normalizedStart = normalizeOffset(
            lastOffset.value,
            cycleWidth.value,
          );
          autoOffset.value = normalizedStart;
          const durationMs = Math.max(
            Math.round((cycleWidth.value / speed) * 1000),
            16,
          );
          autoOffset.value = withRepeat(
            withTiming(normalizedStart + cycleWidth.value, {
              duration: durationMs,
              easing: Easing.linear,
            }),
            -1,
            false,
          );
        },
      )(shouldAnimate, speedPixelsPerSecond, resetOffset, Math.max(0, initialScrollOffsetPx));
    },
    [
      autoOffset,
      cycleWidth,
      initialScrollOffsetPx,
      lastOffset,
      paused,
      scrollRef,
      shouldAnimate,
      speedPixelsPerSecond,
    ],
  );

  const pauseAutoScroll = useCallback(() => {
    runOnUI(() => {
      "worklet";
      paused.value = true;
      cancelAnimation(autoOffset);
    })();
  }, [autoOffset, paused]);

  const scheduleResume = useCallback(() => {
    clearResumeTimer();
    resumeTimeoutRef.current = setTimeout(() => {
      startAutoScroll(false);
    }, RESUME_SCROLL_DELAY_MS);
  }, [clearResumeTimer, startAutoScroll]);

  const handleSequenceLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const sequenceWidth = event.nativeEvent.layout.width;
      cycleWidth.value = sequenceWidth;
      if (sequenceWidth > 0) {
        startAutoScroll(false);
      }
    },
    [cycleWidth, startAutoScroll],
  );

  const animatedScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetX = event.contentOffset.x;
      lastOffset.value =
        cycleWidth.value > 0
          ? normalizeOffset(offsetX, cycleWidth.value)
          : offsetX;
    },
    onBeginDrag: () => {
      paused.value = true;
      cancelAnimation(autoOffset);
      runOnJS(clearResumeTimer)();
    },
    onEndDrag: () => {
      runOnJS(scheduleResume)();
    },
    onMomentumEnd: () => {
      runOnJS(scheduleResume)();
    },
  });

  useDerivedValue(() => {
    if (paused.value || cycleWidth.value <= 0) {
      return;
    }

    const nextOffset = normalizeOffset(autoOffset.value, cycleWidth.value);
    lastOffset.value = nextOffset;
    scrollTo(scrollRef, nextOffset, 0, false);
  });

  useEffect(() => {
    clearResumeTimer();
    startAutoScroll(true);
  }, [clearResumeTimer, prompts, startAutoScroll]);

  useEffect(() => {
    return () => {
      clearResumeTimer();
      pauseAutoScroll();
    };
  }, [clearResumeTimer, pauseAutoScroll]);

  const renderedPrompts = useMemo(() => [prompts, prompts] as const, [prompts]);

  if (prompts.length === 0) {
    return null;
  }

  return (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
      scrollEventThrottle={16}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingLeft: spacing[4] + Math.max(0, leadingOffsetPx) },
      ]}
      onScroll={animatedScrollHandler}
      testID="infinite-horizontal-scrollview"
    >
      {renderedPrompts.map((promptSequence, sequenceIndex) => (
        <View
          key={`prompt-sequence-${sequenceIndex}`}
          style={styles.promptSequence}
          onLayout={sequenceIndex === 0 ? handleSequenceLayout : undefined}
        >
          {promptSequence.map((prompt, promptIndex) => (
            <CustomButton
              key={`${sequenceIndex}-${prompt.label}-${promptIndex}`}
              onPress={() => onPressPrompt(prompt.message)}
              style={[
                styles.promptCard,
                {
                  borderColor: theme.border.default,
                  backgroundColor: theme.bg.surface,
                },
              ]}
              disabled={disabled}
              accessibilityLabel={prompt.label}
              testID={
                sequenceIndex === 0 ? `suggestion-${promptIndex}` : undefined
              }
            >
              <Text
                style={[styles.promptText, { color: theme.text.primary }]}
                numberOfLines={3}
              >
                {prompt.label}
              </Text>
            </CustomButton>
          ))}
        </View>
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: spacing[2],
    paddingLeft: spacing[4],
    paddingRight: spacing[4],
  },
  promptSequence: {
    flexDirection: "row",
    gap: spacing[10],
    paddingRight: spacing[10],
  },
  promptCard: {
    width: 280,
    minHeight: 74,
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    alignItems: "flex-start",
    justifyContent: "center",
  },
  promptText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    textAlign: "left",
  },
});
