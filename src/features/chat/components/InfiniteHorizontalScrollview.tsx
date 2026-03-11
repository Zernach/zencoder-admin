import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
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
}

function normalizeOffset(offset: number, cycleWidth: number): number {
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
}: InfiniteHorizontalScrollviewProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const scrollRef = useRef<ScrollView>(null);
  const cycleWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldAnimate = prompts.length > 1;

  const clearResumeTimer = useCallback(() => {
    if (resumeTimeoutRef.current == null) {
      return;
    }
    clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = null;
  }, []);

  const scheduleResume = useCallback(() => {
    clearResumeTimer();
    resumeTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_SCROLL_DELAY_MS);
  }, [clearResumeTimer]);

  const rebaseOffset = useCallback(() => {
    const cycleWidth = cycleWidthRef.current;
    if (cycleWidth <= 0) {
      return;
    }
    const normalized = normalizeOffset(offsetRef.current, cycleWidth);
    if (Math.abs(normalized - offsetRef.current) > 0.5) {
      offsetRef.current = normalized;
      scrollRef.current?.scrollTo({ x: normalized, animated: false });
    }
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetRef.current = event.nativeEvent.contentOffset.x;
    },
    [],
  );

  const handleScrollBeginDrag = useCallback(() => {
    pausedRef.current = true;
    clearResumeTimer();
  }, [clearResumeTimer]);

  const handleScrollEndDrag = useCallback(() => {
    rebaseOffset();
    scheduleResume();
  }, [rebaseOffset, scheduleResume]);

  const handleMomentumScrollEnd = useCallback(() => {
    rebaseOffset();
    scheduleResume();
  }, [rebaseOffset, scheduleResume]);

  const handleSequenceLayout = useCallback(
    (event: LayoutChangeEvent) => {
      cycleWidthRef.current = event.nativeEvent.layout.width;
      rebaseOffset();
    },
    [rebaseOffset],
  );

  useEffect(() => {
    if (!shouldAnimate) {
      return undefined;
    }

    let cancelled = false;
    let lastTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (cancelled) {
        return;
      }

      animationFrameRef.current = requestAnimationFrame(step);

      if (pausedRef.current) {
        lastTimestamp = timestamp;
        return;
      }

      const cycleWidth = cycleWidthRef.current;
      if (cycleWidth <= 0) {
        lastTimestamp = timestamp;
        return;
      }

      if (lastTimestamp == null) {
        lastTimestamp = timestamp;
        return;
      }

      const deltaMs = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      offsetRef.current = normalizeOffset(
        offsetRef.current + (speedPixelsPerSecond * deltaMs) / 1000,
        cycleWidth,
      );
      scrollRef.current?.scrollTo({ x: offsetRef.current, animated: false });
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [shouldAnimate, speedPixelsPerSecond]);

  useEffect(() => {
    offsetRef.current = 0;
    pausedRef.current = false;
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [prompts]);

  useEffect(() => {
    return () => {
      clearResumeTimer();
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [clearResumeTimer]);

  const renderedPrompts = useMemo(() => [prompts, prompts] as const, [prompts]);

  if (prompts.length === 0) {
    return null;
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
      scrollEventThrottle={16}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleMomentumScrollEnd}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
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
