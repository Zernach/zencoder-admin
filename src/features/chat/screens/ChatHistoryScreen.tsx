import React, { memo, useCallback, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, type ListRenderItemInfo } from "react-native";
import { useRouter } from "expo-router";
import type { TABS } from "@/constants/routes";
import { buildChatThreadRoute, buildCreateChatRoute, ROUTES } from "@/constants/routes";
import { ScreenWrapper } from "@/components/screen";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { CustomButton } from "@/components/buttons";
import { CustomList } from "@/components/lists";
import { ChatHistoryFilters } from "@/features/chat/components";
import { filterChatHistoryByTopics } from "@/features/chat/filters";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";
import { useChatHistory, useChatSearchSuggestions } from "@/features/chat/hooks";
import type {
  ChatConversationStatus,
  ChatConversationSummary,
  ChatTopic,
  GetChatHistoryResponse,
} from "@/features/chat/types";
import type { SearchSuggestion } from "@/features/analytics/types";
import { formatRelativeTime } from "@/utils";
import {
  useAppDispatch,
  useAppSelector,
  clearChatHistorySelectedTopics,
  selectChatHistorySelectedTopics,
  setChatHistorySelectedTopics,
  toggleChatHistorySelectedTopic,
} from "@/store";

interface ChatHistoryScreenProps {
  tab: TABS;
  /** When provided, seeds selected topics for the initial render. */
  initialTopics?: ChatTopic[];
}

interface ChatHistoryContentProps {
  data: GetChatHistoryResponse | undefined;
  loading: boolean;
  query: string;
  onOpenConversation: (chatId: string) => void;
}

interface TopicBadgeItem {
  id: string;
  topic: ChatTopic;
}

interface ChatHistoryConversationCardProps {
  item: ChatConversationSummary;
  mode: "light" | "dark";
  theme: ThemePalette;
  onOpenConversation: (chatId: string) => void;
}

const ChatHistoryConversationCard = memo(function ChatHistoryConversationCard({
  item,
  mode,
  theme,
  onOpenConversation,
}: ChatHistoryConversationCardProps) {
  const primaryTopic = item.topics[0] ?? "Agents";
  const railAccent = theme.border.default;
  const topicBadgeAccent = theme.text.tertiary;
  const statusAccent = resolveStatusAccent(item.status, theme);
  const hasUnread = item.unreadCount > 0;

  const topicBadges = useMemo<TopicBadgeItem[]>(
    () =>
      (item.topics.length > 0 ? item.topics : [primaryTopic]).map((topic) => ({
        id: `${item.id}-${topic}`,
        topic,
      })),
    [item.id, item.topics, primaryTopic],
  );

  const handleOpenConversation = useCallback(() => {
    onOpenConversation(item.id);
  }, [item.id, onOpenConversation]);

  const renderTopicBadge = useCallback(
    ({ item: badge }: ListRenderItemInfo<TopicBadgeItem>) => (
      <View
        style={[
          styles.topicBadge,
          {
            backgroundColor: withAlpha(topicBadgeAccent, mode === "dark" ? 0.24 : 0.12),
            borderColor: withAlpha(topicBadgeAccent, 0.55),
          },
        ]}
      >
        <Text style={[styles.topicBadgeText, { color: topicBadgeAccent }]}>{badge.topic}</Text>
      </View>
    ),
    [mode, topicBadgeAccent],
  );

  const renderTopicBadgeSeparator = useCallback(
    () => <View style={styles.topicBadgeSeparator} />,
    [],
  );

  const keyTopicBadge = useCallback((badge: TopicBadgeItem) => badge.id, []);

  return (
    <CustomButton
      onPress={handleOpenConversation}
      style={[
        styles.card,
        {
          borderColor: withAlpha(railAccent, 0.42),
          backgroundColor: theme.bg.surface,
          boxShadow:
            mode === "dark"
              ? "0px 10px 24px rgba(0, 0, 0, 0.28)"
              : "0px 10px 24px rgba(15, 23, 32, 0.12)",
          elevation: mode === "dark" ? 2 : 4,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open chat ${item.title}`}
    >
      <View style={[styles.cardAccentRail, { backgroundColor: statusAccent }]} />

      <View style={styles.cardHeader}>
        <Text
          style={[styles.cardTitle, { color: theme.text.primary }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={[styles.cardMeta, { color: theme.text.tertiary }]}>
          {formatRelativeTime(item.updatedAtIso)}
        </Text>
      </View>

      <Text
        style={[styles.cardPreview, { color: theme.text.secondary }]}
        numberOfLines={2}
      >
        {item.preview}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.cardMetaGroup}>
          <View
            style={[
              styles.metaBadge,
              {
                backgroundColor: withAlpha(
                  statusAccent,
                  mode === "dark" ? 0.2 : 0.1,
                ),
                borderColor: withAlpha(statusAccent, 0.45),
              },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusAccent }]}
            />
            <Text style={[styles.metaBadgeText, { color: statusAccent }]}>
              {formatStatusLabel(item.status)}
            </Text>
          </View>
          {hasUnread && (
            <View
              style={[
                styles.metaBadge,
                styles.unreadMetaBadge,
                {
                  backgroundColor: theme.border.brand,
                  borderColor: withAlpha(theme.border.brand, 0.65),
                },
              ]}
            >
              <Text
                style={[
                  styles.metaBadgeText,
                  styles.unreadMetaBadgeText,
                  { color: theme.text.onBrand },
                ]}
              >
                {item.unreadCount} New
              </Text>
            </View>
          )}
          <View
            style={[
              styles.metaBadge,
              {
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(15, 23, 32, 0.04)",
                borderColor: theme.border.subtle,
              },
            ]}
          >
            <Text
              style={[
                styles.metaBadgeText,
                { color: theme.text.secondary, fontWeight: "400" },
              ]}
            >
              {formatMessageCount(item.messageCount)}
            </Text>
          </View>
        </View>
        <CustomList
          flatListProps={{
            data: topicBadges,
            renderItem: renderTopicBadge,
            keyExtractor: keyTopicBadge,
            horizontal: true,
            scrollEnabled: false,
            showsHorizontalScrollIndicator: false,
            style: styles.topicBadgeList,
            contentContainerStyle: styles.topicBadgeRowFooter,
            ItemSeparatorComponent: renderTopicBadgeSeparator,
          }}
        />
      </View>
    </CustomButton>
  );
});

const ChatHistoryTopicFilterBar = memo(function ChatHistoryTopicFilterBar() {
  const dispatch = useAppDispatch();
  const selectedTopics = useAppSelector(selectChatHistorySelectedTopics);

  const handleToggleTopic = useCallback(
    (topic: ChatTopic) => {
      dispatch(toggleChatHistorySelectedTopic(topic));
    },
    [dispatch],
  );

  const handleClearTopics = useCallback(() => {
    dispatch(clearChatHistorySelectedTopics());
  }, [dispatch]);

  return (
    <ChatHistoryFilters
      selectedTopics={selectedTopics}
      onToggleTopic={handleToggleTopic}
      onClearTopics={handleClearTopics}
    />
  );
});

const ChatHistoryContent = memo(function ChatHistoryContent({
  data,
  loading,
  query,
  onOpenConversation,
}: ChatHistoryContentProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const selectedTopics = useAppSelector(selectChatHistorySelectedTopics);

  const filteredItems = useMemo(() => {
    const topicFiltered = filterChatHistoryByTopics(data?.items ?? [], selectedTopics);
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return topicFiltered;

    return topicFiltered.filter(
      (item) =>
        item.title.toLowerCase().includes(trimmedQuery) ||
        item.preview.toLowerCase().includes(trimmedQuery),
    );
  }, [data?.items, query, selectedTopics]);

  const renderConversation = useCallback(
    ({ item }: ListRenderItemInfo<ChatConversationSummary>) => (
      <ChatHistoryConversationCard
        item={item}
        mode={mode}
        theme={theme}
        onOpenConversation={onOpenConversation}
      />
    ),
    [mode, onOpenConversation, theme],
  );

  const renderCardSeparator = useCallback(
    () => <View style={styles.cardSeparator} />,
    [],
  );

  const keyConversation = useCallback(
    (item: ChatConversationSummary) => item.id,
    [],
  );

  if (loading && !data) {
    return (
      <View style={styles.loadingWrap}>
        <LoadingSkeleton variant="table" rows={4} />
      </View>
    );
  }

  if (!loading && data && filteredItems.length === 0) {
    return (
      <View
        style={[
          styles.emptyState,
          { borderColor: theme.border.default, backgroundColor: theme.bg.surface },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
          No chat history available
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
          {selectedTopics.length === 0
            ? "Recent conversations will appear here automatically."
            : "No conversations match the selected topics."}
        </Text>
      </View>
    );
  }

  return (
    <CustomList
      flatListProps={{
        data: filteredItems,
        renderItem: renderConversation,
        keyExtractor: keyConversation,
        scrollEnabled: false,
        contentContainerStyle: styles.cardList,
        ItemSeparatorComponent: renderCardSeparator,
      }}
    />
  );
});

export function ChatHistoryScreen({ tab, initialTopics }: ChatHistoryScreenProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, loading, error, refetch } = useChatHistory(tab, { scope: "all" });

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      router.push(buildChatThreadRoute(suggestion.id) as never);
    },
    [router],
  );

  const chatAutocomplete = useChatSearchSuggestions(data?.items, handleSuggestionSelect);

  useEffect(() => {
    if (initialTopics !== undefined) {
      dispatch(setChatHistorySelectedTopics(initialTopics));
    }
  }, [dispatch, initialTopics]);

  const handleOpenConversation = useCallback(
    (chatId: string) => {
      router.push(buildChatThreadRoute(chatId) as never);
    },
    [router],
  );

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => void refetch()}
        fullScreen
        showHomeButton
        onGoHome={() => router.replace(ROUTES.ROOT as never)}
      />
    );
  }

  return (
    <ScreenWrapper
      topBarProps={{
        placeholder: "Search chat with AI history...",
        showTimeRange: false,
        autocomplete: chatAutocomplete,
      }}
      headerProps={{
        title: "Chat History",
        subtitle: "Your Conversations with AI",
        isLoading: loading,
        showBackButton: false,
        rightComponent: (
          <CustomButton
            buttonMode="secondary"
            buttonSize="compact"
            onPress={() => router.push(buildCreateChatRoute() as never)}
            label="+ Create Chat"
            textStyle={styles.newChatButtonText}
            accessibilityRole="button"
            accessibilityLabel="Create new chat"
            style={styles.newChatButton}
          />
        ),
      }}
      showFilterBar={false}
      topFilterBar={<ChatHistoryTopicFilterBar />}
    >
      <ChatHistoryContent
        data={data}
        loading={loading}
        query={chatAutocomplete.query}
        onOpenConversation={handleOpenConversation}
      />
    </ScreenWrapper>
  );
}

type ThemePalette = (typeof semanticThemes)["light"];

function resolveStatusAccent(status: ChatConversationStatus, theme: ThemePalette): string {
  switch (status) {
    case "active":
      return theme.border.brand;
    case "archived":
      return theme.text.tertiary;
    case "completed":
    default:
      return theme.state.success;
  }
}

function formatStatusLabel(status: ChatConversationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatMessageCount(messageCount: number): string {
  return `${messageCount} message${messageCount === 1 ? "" : "s"}`;
}

function withAlpha(color: string, alpha: number): string {
  const normalizedColor = color.trim().replace("#", "");
  if (normalizedColor.length !== 3 && normalizedColor.length !== 6) {
    return color;
  }

  const hex =
    normalizedColor.length === 3
      ? normalizedColor
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalizedColor;
  const parsed = Number.parseInt(hex, 16);
  if (Number.isNaN(parsed)) {
    return color;
  }

  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;
  const safeAlpha = Math.max(0, Math.min(1, alpha));

  return `rgba(${red}, ${green}, ${blue}, ${safeAlpha})`;
}

const styles = StyleSheet.create({
  newChatButton: {
    marginLeft: "auto",
    flexShrink: 0,
    maxWidth: "100%",
  },
  newChatButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loadingWrap: {
    paddingVertical: spacing[12],
  },
  emptyState: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    padding: spacing[16],
    gap: spacing[8],
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardList: {
    flexGrow: 1,
  },
  cardSeparator: {
    height: spacing[10],
  },
  card: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.lg,
    position: "relative",
    overflow: "hidden",
    padding: spacing[16],
    paddingTop: spacing[12],
    paddingLeft: spacing[20],
    gap: spacing[6],
  },
  cardAccentRail: {
    position: "absolute",
    left: spacing[8],
    top: spacing[10],
    bottom: spacing[10],
    width: 4,
    borderRadius: radius.full,
  },
  topicBadge: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.full,
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[4],
  },
  topicBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[10],
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  cardPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: spacing[10],
  },
  cardMetaGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[8],
    flex: 1,
  },
  topicBadgeList: {
    maxWidth: "45%",
    alignSelf: "flex-end",
    flexGrow: 0,
  },
  topicBadgeRowFooter: {
    justifyContent: "flex-end",
  },
  topicBadgeSeparator: {
    width: spacing[6],
  },
  metaBadge: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.full,
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[6],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[6],
  },
  unreadMetaBadge: {
    paddingHorizontal: spacing[8],
  },
  unreadMetaBadgeText: {
    fontWeight: "700",
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  cardMeta: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.2,
    flexShrink: 0,
  },
});
