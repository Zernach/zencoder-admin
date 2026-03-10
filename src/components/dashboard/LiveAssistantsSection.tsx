import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated as RNAnimated, Easing, Pressable, StyleSheet, Text, View, type ListRenderItemInfo, } from "react-native";
import { useTranslation } from "react-i18next";
import Svg, { Circle } from "react-native-svg";
import { Check } from "lucide-react-native";
import Reanimated, {
  Easing as ReanimatedEasing, cancelAnimation, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from "react-native-reanimated";
import type { LiveAgentSession } from "@/features/analytics/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { radius, spacing } from "@/theme/tokens";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes, type SemanticTheme } from "@/theme/themes";
import { keyExtractors } from "@/constants";
import { isWeb } from "@/constants/platform";
import { CustomList } from "@/components/lists";
import { ErrorState } from "./ErrorState";
import { SectionHeader } from "./SectionHeader";



const EMPTY_STATE_MESSAGE_KEYS = [
  "dashboard.live.emptyMessages.resting",
  "dashboard.live.emptyMessages.quiet",
  "dashboard.live.emptyMessages.noMembers",
  "dashboard.live.emptyMessages.waiting",
] as const;

const PROGRESS_TICK_MS = 280;
const REDUCED_MOTION_PROGRESS_TICK_MS = 950;
const COMPLETION_HOLD_MS = 520;
const ROWS_PER_COLUMN = 2;
const MAX_VISIBLE_CARDS = 12;
const INDICATOR_SIZE = 34;
const INDICATOR_STROKE = 3;
const INDICATOR_RADIUS = (INDICATOR_SIZE - INDICATOR_STROKE) / 2;
const INDICATOR_CIRCUMFERENCE = 2 * Math.PI * INDICATOR_RADIUS;
const PROGRESS_MORPH_DURATION_MS = PROGRESS_TICK_MS + 120;
const ACTIVE_SPIN_DURATION_MS = 1000;
const CHECK_POP_DURATION_MS = 220;

const AnimatedCircle = Reanimated.createAnimatedComponent(Circle);

interface LiveAssistantsSectionProps {
  sessions: LiveAgentSession[];
  loading: boolean;
  error?: string;
  onRetry?: () => void;
  onCardPress?: (agentId: string) => void;
}

interface SessionCardState {
  session: LiveAgentSession;
  progress: number;
  phase: "active" | "completed";
  completedAtMs?: number;
}

interface SessionColumn {
  id: string;
  rows: SessionCardState[];
}

type ThemeColors = Omit<SemanticTheme, "shadows">;

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getInitialProgress(sessionId: string): number {
  const hashed = hashString(sessionId);
  const normalized = (hashed % 42) / 100;
  return 0.18 + normalized;
}

function chunkSessions(items: SessionCardState[], chunkSize: number): SessionColumn[] {
  const columns: SessionColumn[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const rows = items.slice(i, i + chunkSize);
    columns.push({
      id: rows.map((row) => row.session.sessionId).join("_"),
      rows,
    });
  }
  return columns;
}

function firstInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed[0]!.toUpperCase() : "?";
}

function elapsedSecondsSince(iso: string): number {
  const delta = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(delta) || delta <= 0) return 0;
  return Math.max(0, Math.floor(delta / 1000));
}

function formatElapsedClock(iso: string): string {
  const totalSeconds = elapsedSecondsSince(iso);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function createCardState(session: LiveAgentSession): SessionCardState {
  return {
    session,
    progress: getInitialProgress(session.sessionId),
    phase: "active",
  };
}

function LiveBadge({ reducedMotion, theme }: { reducedMotion: boolean; theme: ThemeColors }) {
  const { t } = useTranslation();
  const pulse = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      pulse.setValue(0);
      return undefined;
    }

    const animation = RNAnimated.loop(
      RNAnimated.timing(pulse, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: !isWeb,
      })
    );
    animation.start();

    return () => {
      animation.stop();
      pulse.setValue(0);
    };
  }, [pulse, reducedMotion]);

  const animatedStyle = {
    opacity: reducedMotion
      ? 0
      : pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 0],
      }),
    transform: [
      {
        scale: reducedMotion
          ? 1
          : pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.7],
          }),
      },
    ],
  };

  return (
    <View style={[styles.liveBadge, { borderColor: `${theme.state.success}40`, backgroundColor: `${theme.state.success}14` }]}>
      <View style={styles.liveDotWrap}>
        <RNAnimated.View style={[styles.liveDotPulse, { backgroundColor: theme.state.success }, animatedStyle]} />
        <View style={[styles.liveDotCore, { backgroundColor: theme.state.success }]} />
      </View>
      <Text style={[styles.liveBadgeLabel, { color: theme.state.success }]}>{t("common.live")}</Text>
    </View>
  );
}

interface SessionIndicatorProps {
  progress: number;
  color: string;
  completed: boolean;
  reducedMotion: boolean;
  theme: ThemeColors;
}

const SessionProgressIndicator = memo(function SessionProgressIndicator({
  progress,
  color,
  completed,
  reducedMotion,
  theme,
}: SessionIndicatorProps) {
  const clampedProgress = Math.max(0.08, Math.min(1, progress));
  const animatedProgress = useSharedValue(clampedProgress);
  const spinDegrees = useSharedValue(0);
  const checkScale = useSharedValue(completed ? 1 : 0.86);
  const checkOpacity = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      animatedProgress.value = clampedProgress;
      return;
    }

    animatedProgress.value = withTiming(clampedProgress, {
      duration: completed ? 180 : PROGRESS_MORPH_DURATION_MS,
      easing: ReanimatedEasing.linear,
    });
  }, [animatedProgress, clampedProgress, completed, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || completed) {
      cancelAnimation(spinDegrees);
      spinDegrees.value = 0;
      return undefined;
    }

    spinDegrees.value = 0;
    spinDegrees.value = withRepeat(
      withTiming(360, {
        duration: ACTIVE_SPIN_DURATION_MS,
        easing: ReanimatedEasing.linear,
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(spinDegrees);
      spinDegrees.value = 0;
    };
  }, [completed, reducedMotion, spinDegrees]);

  useEffect(() => {
    if (reducedMotion) {
      checkScale.value = completed ? 1 : 0.86;
      checkOpacity.value = completed ? 1 : 0;
      return;
    }

    if (completed) {
      checkScale.value = 0.72;
      checkOpacity.value = 0;
      checkScale.value = withTiming(1, {
        duration: CHECK_POP_DURATION_MS,
        easing: ReanimatedEasing.bezier(0.22, 1, 0.36, 1),
      });
      checkOpacity.value = withTiming(1, {
        duration: CHECK_POP_DURATION_MS - 40,
        easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
      });
      return;
    }

    checkScale.value = 0.86;
    checkOpacity.value = 0;
  }, [checkOpacity, checkScale, completed, reducedMotion]);

  const indicatorArcProps = useAnimatedProps<React.ComponentProps<typeof Circle>>(() => ({
    strokeDashoffset: INDICATOR_CIRCUMFERENCE * (1 - animatedProgress.value),
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinDegrees.value}deg` }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={styles.indicatorWrap}>
      <Reanimated.View style={!completed && !reducedMotion ? spinnerStyle : undefined}>
        <Svg width={INDICATOR_SIZE} height={INDICATOR_SIZE}>
          <Circle
            cx={INDICATOR_SIZE / 2}
            cy={INDICATOR_SIZE / 2}
            r={INDICATOR_RADIUS}
            stroke={theme.data.gridLine}
            strokeWidth={INDICATOR_STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={INDICATOR_SIZE / 2}
            cy={INDICATOR_SIZE / 2}
            r={INDICATOR_RADIUS}
            stroke={color}
            strokeWidth={INDICATOR_STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${INDICATOR_CIRCUMFERENCE} ${INDICATOR_CIRCUMFERENCE}`}
            animatedProps={indicatorArcProps}
          />
        </Svg>
      </Reanimated.View>
      {completed ? (
        <Reanimated.View style={[styles.checkWrap, checkStyle]}>
          <Check size={16} color={theme.state.success} />
        </Reanimated.View>
      ) : null}
    </View>
  );
});

const LiveAssistantCard = memo(function LiveAssistantCard({
  card,
  reducedMotion,
  theme,
  onPress,
}: {
  card: SessionCardState;
  reducedMotion: boolean;
  theme: ThemeColors;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const statusColor =
    card.phase === "completed"
      ? theme.state.success
      : card.session.status === "queued"
        ? theme.text.tertiary
        : theme.border.brand;
  const statusLabelColor =
    card.session.status === "queued" && card.phase !== "completed"
      ? '#aaa'
      : statusColor;
  const elapsedClock = formatElapsedClock(card.session.startedAtIso);
  const statusLabel =
    card.phase === "completed"
      ? t("dashboard.live.succeeded")
      : card.session.status === "queued"
        ? t("dashboard.live.queued")
        : t("dashboard.live.running");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: statusColor }]}>
          <Text style={[styles.avatarInitial, { color: theme.text.onBrand }]}>{firstInitial(card.session.agentName)}</Text>
        </View>
        <View style={styles.titleWrap}>
          <Text style={[styles.agentName, { color: theme.text.primary }]} numberOfLines={1}>
            {card.session.agentName}
          </Text>
          <Text style={[styles.projectName, { color: theme.text.tertiary }]} numberOfLines={1}>
            {card.session.projectName}
          </Text>
        </View>
        <SessionProgressIndicator
          progress={card.progress}
          color={statusColor}
          completed={card.phase === "completed"}
          reducedMotion={reducedMotion}
          theme={theme}
        />
      </View>
      <Text style={[styles.task, { color: theme.text.secondary }]} numberOfLines={1}>
        {card.session.currentTask}
      </Text>
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: statusLabelColor }]} numberOfLines={1}>
          {statusLabel}
          <Text style={{ color: theme.text.tertiary }}> {t("common.by")} </Text>
          <Text style={{ color: theme.text.tertiary, fontWeight: "500" }}>{card.session.userName}</Text>
        </Text>
        <Text style={[styles.elapsedTime, { color: theme.text.secondary }]}>{elapsedClock}</Text>
      </View>
    </Pressable>
  );
});

function EmptyLiveState({ theme }: { theme: ThemeColors }) {
  const { t } = useTranslation();
  const messageIndex = Math.floor(Date.now() / 60_000) % EMPTY_STATE_MESSAGE_KEYS.length;
  return (
    <View style={[styles.emptyState, { borderColor: theme.border.subtle, backgroundColor: theme.bg.subtle }]}>
      <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>{t(EMPTY_STATE_MESSAGE_KEYS[messageIndex]!)}</Text>
      <Text style={[styles.emptySubtitle, { color: theme.text.tertiary }]}>
        {t("dashboard.live.emptySubtitle")}
      </Text>
    </View>
  );
}

export const LiveAssistantsSection = React.memo(function LiveAssistantsSection({
  sessions,
  loading,
  error,
  onRetry,
  onCardPress,
}: LiveAssistantsSectionProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const reducedMotion = useReducedMotion();
  const [cards, setCards] = useState<SessionCardState[]>([]);

  useEffect(() => {
    const now = Date.now();
    setCards((previousCards) => {
      const previousById = new Map(
        previousCards.map((existingCard) => [existingCard.session.sessionId, existingCard])
      );
      const incoming = sessions.slice(0, MAX_VISIBLE_CARDS * 2);
      const seen = new Set<string>();
      const nextCards: SessionCardState[] = [];

      for (const session of incoming) {
        if (seen.has(session.sessionId)) continue;
        seen.add(session.sessionId);
        const existing = previousById.get(session.sessionId);
        nextCards.push(existing ? { ...existing, session } : createCardState(session));
      }

      for (const existingCard of previousCards) {
        if (
          existingCard.phase === "completed" &&
          !seen.has(existingCard.session.sessionId) &&
          now - (existingCard.completedAtMs ?? now) < COMPLETION_HOLD_MS
        ) {
          seen.add(existingCard.session.sessionId);
          nextCards.push(existingCard);
        }
      }

      return nextCards.slice(0, MAX_VISIBLE_CARDS);
    });
  }, [sessions]);

  useEffect(() => {
    const intervalMs = reducedMotion ? REDUCED_MOTION_PROGRESS_TICK_MS : PROGRESS_TICK_MS;
    let previousTickAtMs = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedScale = Math.max(0.65, (now - previousTickAtMs) / intervalMs);
      previousTickAtMs = now;

      setCards((previousCards) => {
        let changed = false;
        const nextCards: SessionCardState[] = [];

        for (const card of previousCards) {
          if (card.phase === "active") {
            const tickHash = hashString(
              `${card.session.sessionId}_${Math.floor(now / (intervalMs * 2))}`
            );
            const baseIncrement = card.session.status === "queued" ? 0.008 : 0.013;
            const increment = (baseIncrement + (tickHash % 6) * 0.0028) * elapsedScale;
            const nextProgress = Math.min(1, card.progress + increment);

            if (nextProgress >= 1) {
              changed = true;
              nextCards.push({
                ...card,
                progress: 1,
                phase: "completed",
                completedAtMs: now,
              });
              continue;
            }

            if (nextProgress !== card.progress) {
              changed = true;
            }
            nextCards.push({
              ...card,
              progress: nextProgress,
            });
            continue;
          }

          if (now - (card.completedAtMs ?? now) < COMPLETION_HOLD_MS) {
            nextCards.push(card);
          } else {
            changed = true;
          }
        }

        return changed ? nextCards : previousCards;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [reducedMotion]);

  const columns = useMemo(() => chunkSessions(cards, ROWS_PER_COLUMN), [cards]);

  const renderColumn = useCallback(
    ({ item }: ListRenderItemInfo<SessionColumn>) => {
      return (
        <View style={styles.column}>
          {item.rows.map((card) => (
            <LiveAssistantCard
              key={card.session.sessionId}
              card={card}
              reducedMotion={reducedMotion}
              theme={theme}
              onPress={onCardPress ? () => onCardPress(card.session.agentId) : undefined}
            />
          ))}
          {item.rows.length < ROWS_PER_COLUMN ? <View style={styles.cardSpacer} /> : null}
        </View>
      );
    },
    [reducedMotion, theme, onCardPress],
  );
  const renderColumnSeparator = useCallback(
    () => <View style={styles.columnGap} />,
    [],
  );

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t("dashboard.live.title")}
        subtitle={t("dashboard.live.subtitle")}
        action={<LiveBadge reducedMotion={reducedMotion} theme={theme} />}
      />
      {error ? (
        <ErrorState message={error} onRetry={onRetry ?? (() => undefined)} />
      ) : loading && columns.length === 0 ? (
        <View style={styles.placeholderWrap}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={[styles.placeholderCard, { borderColor: theme.border.subtle, backgroundColor: theme.bg.subtle }]} />
          ))}
        </View>
      ) : columns.length === 0 ? (
        <EmptyLiveState theme={theme} />
      ) : (
        <CustomList
          flatListProps={{
            horizontal: true,
            data: columns,
            renderItem: renderColumn,
            keyExtractor: keyExtractors.byId,
            showsHorizontalScrollIndicator: false,
            contentContainerStyle: styles.listContent,
            ItemSeparatorComponent: renderColumnSeparator,
          }}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: spacing[12],
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: radius.full,
    borderWidth: 1,
  },
  liveDotWrap: {
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  liveDotPulse: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  liveDotCore: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  liveBadgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  listContent: {
    paddingVertical: spacing[2],
  },
  column: {
    width: 240,
    gap: spacing[12],
  },
  columnGap: {
    width: spacing[16],
  },
  card: {
    minHeight: 108,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[12],
    justifyContent: "space-between",
    gap: spacing[8],
  },
  cardSpacer: {
    minHeight: 108,
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
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: "700",
  },
  titleWrap: {
    flex: 1,
    gap: spacing[0],
  },
  agentName: {
    fontSize: 14,
    fontWeight: "600",
  },
  projectName: {
    fontSize: 12,
  },
  task: {
    fontSize: 12,
  },
  meta: {
    fontSize: 11,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  elapsedTime: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.md,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[20],
    gap: spacing[4],
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    maxWidth: 320,
  },
  placeholderWrap: {
    flexDirection: "row",
    gap: spacing[12],
  },
  placeholderCard: {
    width: 240,
    minHeight: 108,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  indicatorWrap: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  checkWrap: {
    position: "absolute",
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
