import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  type ListRenderItemInfo,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
} from "react-native";
import { Pressable as GesturePressable } from "react-native-gesture-handler";
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

interface PromptCardItem {
  id: string;
  prompt: SuggestedPrompt;
  promptIndex: number;
  sequenceIndex: 0 | 1;
}

interface SuggestedPromptCardProps {
  item: PromptCardItem;
}

interface SuggestedPromptCardContextValue {
  onPressPrompt: (promptMessage: string) => void;
  onPressIn: () => void;
  onPressOut: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  disabled: boolean;
}

const PROMPT_CARD_WIDTH = 280;
const PROMPT_CARD_GAP = spacing[10];
const SuggestedPromptCardContext = React.createContext<SuggestedPromptCardContextValue | null>(null);

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

const SuggestedPromptCard = React.memo(function SuggestedPromptCard({
  item,
}: SuggestedPromptCardProps) {
  const context = React.useContext(SuggestedPromptCardContext);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  if (!context) {
    throw new Error("SuggestedPromptCard must be rendered within SuggestedPromptCardContext.");
  }
  const {
    onPressPrompt,
    onPressIn,
    onPressOut,
    onTouchStart,
    onTouchEnd,
    disabled,
  } = context;

  const handleTouchStart = useCallback(
    (_event: NativeSyntheticEvent<NativeTouchEvent>) => {
      onPressIn();
      onTouchStart();
    },
    [onPressIn, onTouchStart],
  );

  const handleTouchEnd = useCallback(
    (_event: NativeSyntheticEvent<NativeTouchEvent>) => {
      onPressOut();
      onTouchEnd();
    },
    [onPressOut, onTouchEnd],
  );

  const handlePress = useCallback(() => {
    onPressPrompt(item.prompt.message);
  }, [item.prompt.message, onPressPrompt]);

  return (
    <GesturePressable
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      pressRetentionOffset={{
        top: spacing[16],
        bottom: spacing[16],
        left: spacing[24],
        right: spacing[24],
      }}
      hitSlop={{
        top: spacing[6],
        bottom: spacing[6],
        left: spacing[6],
        right: spacing[6],
      }}
      style={({ pressed }) => [
        styles.promptCard,
        {
          borderColor: theme.border.default,
          backgroundColor: theme.bg.surface,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      disabled={disabled}
      accessibilityLabel={item.prompt.label}
      testID={item.sequenceIndex === 0 ? `suggestion-${item.promptIndex}` : undefined}
    >
      <Text
        style={[styles.promptText, { color: theme.text.primary }]}
        numberOfLines={3}
      >
        {item.prompt.label}
      </Text>
    </GesturePressable>
  );
});

SuggestedPromptCard.displayName = "SuggestedPromptCard";

export const InfiniteHorizontalScrollview = React.memo(function InfiniteHorizontalScrollview({
  prompts,
  onPressPrompt,
  disabled = false,
  speedPixelsPerSecond = DEFAULT_SPEED_PIXELS_PER_SECOND,
  leadingOffsetPx = 0,
  initialScrollOffsetPx = 0,
}: InfiniteHorizontalScrollviewProps) {
  const scrollRef = useAnimatedRef<FlatList<PromptCardItem>>();
  const cycleWidth = useSharedValue(0);
  const autoOffset = useSharedValue(0);
  const lastOffset = useSharedValue(0);
  const paused = useSharedValue(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCardTouchActive, setIsCardTouchActive] = useState(false);
  const shouldAnimate = prompts.length > 1;
  const shouldAutoAnimate = shouldAnimate;

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
      )(shouldAutoAnimate, speedPixelsPerSecond, resetOffset, Math.max(0, initialScrollOffsetPx));
    },
    [
      autoOffset,
      cycleWidth,
      initialScrollOffsetPx,
      lastOffset,
      paused,
      scrollRef,
      shouldAutoAnimate,
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

  const renderedPrompts = useMemo<PromptCardItem[]>(
    () => [
      ...prompts.map((prompt, promptIndex) => ({
        id: `0-${prompt.label}-${promptIndex}`,
        prompt,
        promptIndex,
        sequenceIndex: 0 as const,
      })),
      ...prompts.map((prompt, promptIndex) => ({
        id: `1-${prompt.label}-${promptIndex}`,
        prompt,
        promptIndex,
        sequenceIndex: 1 as const,
      })),
    ],
    [prompts],
  );

  const cyclePixelWidth = useMemo(
    () => prompts.length * (PROMPT_CARD_WIDTH + PROMPT_CARD_GAP),
    [prompts.length],
  );

  const keyExtractor = useCallback((item: PromptCardItem) => item.id, []);

  const handleCardPressIn = useCallback(() => {
    pauseAutoScroll();
  }, [pauseAutoScroll]);

  const handleCardPressOut = useCallback(() => {
    scheduleResume();
  }, [scheduleResume]);

  const handleCardTouchStart = useCallback(() => {
    setIsCardTouchActive(true);
    clearResumeTimer();
    pauseAutoScroll();
  }, [clearResumeTimer, pauseAutoScroll]);

  const handleCardTouchEnd = useCallback(() => {
    setIsCardTouchActive(false);
    scheduleResume();
  }, [scheduleResume]);

  const suggestedPromptCardContextValue = useMemo<SuggestedPromptCardContextValue>(
    () => ({
      onPressPrompt,
      onPressIn: handleCardPressIn,
      onPressOut: handleCardPressOut,
      onTouchStart: handleCardTouchStart,
      onTouchEnd: handleCardTouchEnd,
      disabled,
    }),
    [
      disabled,
      handleCardPressIn,
      handleCardPressOut,
      handleCardTouchStart,
      handleCardTouchEnd,
      onPressPrompt,
    ],
  );

  const renderPromptCard = useCallback(
    ({ item }: ListRenderItemInfo<PromptCardItem>) => (
      <SuggestedPromptCard item={item} />
    ),
    [],
  );

  useEffect(() => {
    cycleWidth.value = cyclePixelWidth;
    if (cyclePixelWidth > 0) {
      startAutoScroll(false);
    }
  }, [cyclePixelWidth, cycleWidth, startAutoScroll]);

  const handleTouchStart = useCallback(
    (_event: NativeSyntheticEvent<NativeTouchEvent>) => {
      clearResumeTimer();
      pauseAutoScroll();
    },
    [clearResumeTimer, pauseAutoScroll],
  );

  const handleTouchEnd = useCallback(
    (_event: NativeSyntheticEvent<NativeTouchEvent>) => {
      scheduleResume();
    },
    [scheduleResume],
  );

  if (prompts.length === 0) {
    return null;
  }

  return (
    <SuggestedPromptCardContext.Provider value={suggestedPromptCardContextValue}>
      <Animated.FlatList
        ref={scrollRef}
        data={renderedPrompts}
        renderItem={renderPromptCard}
        keyExtractor={keyExtractor}
        horizontal
        scrollEnabled={!disabled && shouldAnimate && !isCardTouchActive}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="always"
        disableScrollViewPanResponder={Platform.OS === "ios"}
        // iOS: keep touches focused on child pressables while auto-scroll runs.
        {...(Platform.OS === "ios" && {
          delaysContentTouches: false,
          canCancelContentTouches: false,
        })}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingLeft: spacing[4] + Math.max(0, leadingOffsetPx) },
        ]}
        onScroll={animatedScrollHandler}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        testID="infinite-horizontal-scrollview"
      />
    </SuggestedPromptCardContext.Provider>
  );
});

InfiniteHorizontalScrollview.displayName = "InfiniteHorizontalScrollview";

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: spacing[2],
    paddingLeft: spacing[4],
    paddingRight: spacing[4],
  },
  promptCard: {
    width: PROMPT_CARD_WIDTH,
    minHeight: 74,
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    marginRight: PROMPT_CARD_GAP,
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
