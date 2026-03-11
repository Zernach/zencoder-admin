import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { TABS } from "@/constants/routes";
import { buildChatThreadRoute, buildCreateChatRoute } from "@/constants/routes";
import { ScreenWrapper } from "@/components/screen";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { CustomButton } from "@/components/buttons";
import { ChatHistoryFilters } from "@/features/chat/components";
import {
  filterChatHistoryByTopics,
  getDefaultTopicFiltersForTab,
} from "@/features/chat/filters";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";
import { useChatHistory, useChatSearchSuggestions } from "@/features/chat/hooks";
import type { ChatConversationStatus, ChatTopic } from "@/features/chat/types";
import type { SearchSuggestion } from "@/features/analytics/types";
import { formatRelativeTime } from "@/utils";

interface ChatHistoryScreenProps {
  tab: TABS;
  /** When provided, overrides the default topic filters for the initial render. */
  initialTopics?: ChatTopic[];
}

export function ChatHistoryScreen({ tab, initialTopics }: ChatHistoryScreenProps) {
  const router = useRouter();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const [selectedTopics, setSelectedTopics] = useState<ChatTopic[]>(
    () => initialTopics ?? getDefaultTopicFiltersForTab(tab),
  );
  const { data, loading, error, refetch } = useChatHistory(tab, { scope: "all" });

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      router.push(buildChatThreadRoute(tab, suggestion.id) as never);
    },
    [router, tab],
  );

  const chatAutocomplete = useChatSearchSuggestions(data?.items, handleSuggestionSelect);

  useEffect(() => {
    setSelectedTopics(initialTopics ?? getDefaultTopicFiltersForTab(tab));
  }, [tab, initialTopics]);

  const filteredItems = useMemo(() => {
    const topicFiltered = filterChatHistoryByTopics(data?.items ?? [], selectedTopics);
    const trimmed = chatAutocomplete.query.trim().toLowerCase();
    if (!trimmed) return topicFiltered;
    return topicFiltered.filter(
      (item) =>
        item.title.toLowerCase().includes(trimmed) ||
        item.preview.toLowerCase().includes(trimmed),
    );
  }, [data?.items, selectedTopics, chatAutocomplete.query]);

  const handleToggleTopic = useCallback((topic: ChatTopic) => {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic],
    );
  }, []);

  const handleClearTopics = useCallback(() => {
    setSelectedTopics([]);
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
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
            onPress={() => router.push(buildCreateChatRoute(tab) as never)}
            label="+ Create Chat"
            textStyle={styles.newChatButtonText}
            accessibilityRole="button"
            accessibilityLabel="Create new chat"
            style={styles.newChatButton}
          />
        ),
      }}
      showFilterBar={false}
      topFilterBar={
        <ChatHistoryFilters
          selectedTopics={selectedTopics}
          onToggleTopic={handleToggleTopic}
          onClearTopics={handleClearTopics}
        />
      }
    >
      {loading && !data ? (
        <View style={styles.loadingWrap}>
          <LoadingSkeleton variant="table" rows={4} />
        </View>
      ) : null}

      {!loading && data && filteredItems.length === 0 ? (
        <View style={[styles.emptyState, { borderColor: theme.border.default, backgroundColor: theme.bg.surface }]}>
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No chat history available</Text>
          <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
            {selectedTopics.length === 0
              ? "Recent conversations will appear here automatically."
              : "No conversations match the selected topics."}
          </Text>
        </View>
      ) : null}

      <View style={styles.cardList}>
        {filteredItems.map((item) => {
          const primaryTopic = item.topics[0] ?? "Agents";
          const railAccent = theme.border.default;
          const topicBadgeAccent = theme.text.tertiary;
          const statusAccent = resolveStatusAccent(item.status, theme);
          const hasUnread = item.unreadCount > 0;

          return (
            <CustomButton
              key={item.id}
              onPress={() => router.push(buildChatThreadRoute(tab, item.id) as never)}
              style={[
                styles.card,
                  {
                  borderColor: withAlpha(railAccent, 0.42),
                  backgroundColor: theme.bg.surface,
                  boxShadow: mode === "dark"
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
                <Text style={[styles.cardTitle, { color: theme.text.primary }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.cardMeta, { color: theme.text.tertiary }]}>
                  {formatRelativeTime(item.updatedAtIso)}
                </Text>
              </View>

              <Text style={[styles.cardPreview, { color: theme.text.secondary }]} numberOfLines={2}>
                {item.preview}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.cardMetaGroup}>
                <View
                  style={[
                    styles.metaBadge,
                    {
                      backgroundColor: withAlpha(statusAccent, mode === "dark" ? 0.2 : 0.1),
                      borderColor: withAlpha(statusAccent, 0.45),
                    },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: statusAccent }]} />
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
                    <Text style={[styles.metaBadgeText, styles.unreadMetaBadgeText, { color: theme.text.onBrand }]}>
                      {item.unreadCount} New
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.metaBadge,
                    {
                      backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 32, 0.04)",
                      borderColor: theme.border.subtle,
                    },
                  ]}
                >
                  <Text style={[styles.metaBadgeText, { color: theme.text.secondary, fontWeight: "400" }]}>
                    {formatMessageCount(item.messageCount)}
                  </Text>
                </View>
                </View>
                <View style={styles.topicBadgeRowFooter}>
                  {(item.topics.length > 0 ? item.topics : [primaryTopic]).map((topic) => (
                    <View
                      key={`${item.id}-${topic}`}
                      style={[
                        styles.topicBadge,
                        {
                          backgroundColor: withAlpha(topicBadgeAccent, mode === "dark" ? 0.24 : 0.12),
                          borderColor: withAlpha(topicBadgeAccent, 0.55),
                        },
                      ]}
                    >
                      <Text style={[styles.topicBadgeText, { color: topicBadgeAccent }]}>{topic}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </CustomButton>
          );
        })}
      </View>
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

  const hex = normalizedColor.length === 3
    ? normalizedColor.split("").map((char) => `${char}${char}`).join("")
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
    gap: spacing[10],
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
  topicBadgeRowFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[6],
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    maxWidth: "45%",
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
