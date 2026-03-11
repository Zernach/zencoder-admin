import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  X,
  ArrowLeft,
  Send,
  History,
  ExternalLink,
  Sparkles,
} from "lucide-react-native";
import { CustomButton } from "@/components/buttons";
import { CustomTextInput } from "@/components/inputs";
import { LoadingSkeleton } from "@/components/dashboard";
import { useAppDependencies } from "@/core/di";
import {
  buildChatHistoryRoute,
  buildChatThreadRoute,
  resolveTabFromPathname,
} from "@/constants/routes";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";
import { useChatHistory } from "@/features/chat/hooks";
import { ChatHistoryFilters } from "@/features/chat/components";
import {
  filterChatHistoryByTopics,
  getDefaultTopicFiltersForTab,
} from "@/features/chat/filters";
import type { ChatTopic } from "@/features/chat/types";
import { formatRelativeTime } from "@/utils";
import {
  getSuggestedPrompts,
  getWelcomeTitle,
  getWelcomeSubtitle,
} from "@/features/chat/constants/suggestedPrompts";

type MiniChatView = "compose" | "history";

interface MiniChatModalProps {
  onClose: () => void;
}

interface MiniMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const MiniChatModal = React.memo(function MiniChatModal({
  onClose,
}: MiniChatModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { chatService } = useAppDependencies();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const [view, setView] = useState<MiniChatView>("compose");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<MiniMessage[]>([]);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const tab = useMemo(() => resolveTabFromPathname(pathname), [pathname]);
  const { data, loading } = useChatHistory(tab, { scope: "all", limit: 10 });
  const [selectedTopics, setSelectedTopics] = useState<ChatTopic[]>(() =>
    getDefaultTopicFiltersForTab(tab),
  );

  const filteredItems = useMemo(
    () => filterChatHistoryByTopics(data?.items ?? [], selectedTopics),
    [data?.items, selectedTopics],
  );

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

  const suggestedPrompts = useMemo(() => getSuggestedPrompts(tab, t), [tab, t]);

  const doSend = useCallback(
    (text: string) => {
      const value = text.trim();
      if (value.length === 0 || sendingRef.current) return;

      setDraft("");
      sendingRef.current = true;
      setSending(true);

      const userMsg: MiniMessage = {
        id: `mini-user-${Date.now()}`,
        role: "user",
        content: value,
      };
      setMessages((prev) => [...prev, userMsg]);

      // Scroll to bottom after adding user message
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

      // Use a stub chatId for the mini chat
      chatService
        .sendMessage({ tab, chatId: `mini-${tab}`, content: value })
        .then((response) => {
          const aiMsg: MiniMessage = {
            id: response.assistantMessage.id,
            role: "assistant",
            content: response.assistantMessage.content,
          };
          setMessages((prev) => [...prev, aiMsg]);
          setTimeout(
            () => scrollRef.current?.scrollToEnd({ animated: true }),
            50,
          );
        })
        .catch(() => {
          // Fallback stub response on error
          setMessages((prev) => [
            ...prev,
            {
              id: `mini-err-${Date.now()}`,
              role: "assistant",
              content:
                "This is a demo, so the chat feature is stubbed. In production, you'd get a real AI response here!",
            },
          ]);
        })
        .finally(() => {
          sendingRef.current = false;
          setSending(false);
        });
    },
    [chatService, tab],
  );

  const handleSend = useCallback(() => {
    doSend(draft);
  }, [draft, doSend]);

  const handleSuggestionPress = useCallback(
    (message: string) => {
      doSend(message);
    },
    [doSend],
  );

  const handleOpenThread = useCallback(
    (chatId: string) => {
      onClose();
      router.push(buildChatThreadRoute(tab, chatId) as never);
    },
    [onClose, router, tab],
  );

  const handleExpandToFull = useCallback(() => {
    onClose();
    router.push(
      buildChatHistoryRoute(tab, { topics: selectedTopics }) as never,
    );
  }, [onClose, router, tab, selectedTopics]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: theme.bg.surface,
        borderColor: theme.border.default,
        boxShadow:
          mode === "dark"
            ? "0px 12px 40px rgba(0, 0, 0, 0.5)"
            : "0px 12px 40px rgba(15, 23, 32, 0.18)",
      },
    ],
    [theme.bg.surface, theme.border.default, mode],
  );

  return (
    <View style={containerStyle} testID="mini-chat-modal">
      {/* Header */}
      <View
        style={[styles.header, { borderBottomColor: theme.border.default }]}
      >
        <View style={styles.headerLeft}>
          {view === "history" ? (
            <CustomButton
              onPress={() => setView("compose")}
              style={styles.headerIconBtn}
              accessibilityLabel={t("chat.backToNewChat")}
              testID="mini-chat-back"
            >
              <ArrowLeft size={18} color={theme.text.secondary} />
            </CustomButton>
          ) : (
            <CustomButton
              onPress={() => setView("history")}
              style={styles.headerIconBtn}
              accessibilityLabel={t("chat.viewChatHistory")}
              testID="mini-chat-history-btn"
            >
              <History size={18} color={theme.text.secondary} />
            </CustomButton>
          )}
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            {view === "compose" ? t("chat.newChat") : t("chat.chatHistory")}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <CustomButton
            onPress={handleExpandToFull}
            style={styles.headerIconBtn}
            accessibilityLabel={t("chat.openFullChat")}
            testID="mini-chat-expand"
          >
            <ExternalLink size={16} color={theme.text.tertiary} />
          </CustomButton>
          <CustomButton
            onPress={onClose}
            style={styles.headerIconBtn}
            accessibilityLabel={t("chat.closeChat")}
            testID="mini-chat-close"
          >
            <X size={18} color={theme.text.secondary} />
          </CustomButton>
        </View>
      </View>

      {/* Body */}
      {view === "compose" ? (
        <View style={styles.composeBody}>
          <ScrollView
            ref={scrollRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.length === 0 ? (
              <>
                <View
                  style={[
                    styles.welcomeBubble,
                    {
                      backgroundColor: theme.bg.subtle,
                      borderColor: theme.border.default,
                    },
                  ]}
                >
                  <View style={styles.welcomeRow}>
                    <Sparkles size={18} color={theme.text.brand} />
                    <Text
                      style={[
                        styles.welcomeTitle,
                        { color: theme.text.primary },
                      ]}
                    >
                      {getWelcomeTitle(t)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.welcomeBody,
                      { color: theme.text.secondary },
                    ]}
                  >
                    {getWelcomeSubtitle(tab, t)}
                  </Text>
                </View>

                <View style={styles.suggestionsWrap}>
                  <Text
                    style={[
                      styles.suggestionsLabel,
                      { color: theme.text.tertiary },
                    ]}
                  >
                    {t("chat.suggested")}
                  </Text>
                  <View style={styles.suggestionsGrid}>
                    {suggestedPrompts.map((prompt) => (
                      <CustomButton
                        key={prompt.label}
                        onPress={() => handleSuggestionPress(prompt.message)}
                        style={[
                          styles.suggestionChip,
                          {
                            borderColor: theme.border.default,
                            backgroundColor: theme.bg.canvas,
                          },
                        ]}
                        accessibilityLabel={prompt.label}
                        testID={`suggestion-${prompt.label}`}
                        disabled={sending}
                      >
                        <Text
                          style={[
                            styles.suggestionText,
                            { color: theme.text.primary },
                          ]}
                          numberOfLines={2}
                        >
                          {prompt.label}
                        </Text>
                      </CustomButton>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.miniMsgRow,
                        isUser
                          ? styles.miniMsgRowUser
                          : styles.miniMsgRowAssistant,
                      ]}
                    >
                      <View
                        style={[
                          styles.miniMsgBubble,
                          {
                            backgroundColor: isUser
                              ? theme.bg.brandSubtle
                              : theme.bg.subtle,
                            borderColor: theme.border.default,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.miniMsgText,
                            { color: theme.text.primary },
                          ]}
                        >
                          {msg.content}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {sending ? (
                  <View
                    style={[styles.miniMsgRow, styles.miniMsgRowAssistant]}
                  >
                    <View
                      style={[
                        styles.miniMsgBubble,
                        {
                          backgroundColor: theme.bg.subtle,
                          borderColor: theme.border.default,
                        },
                      ]}
                    >
                      <View style={styles.typingRow}>
                        <ActivityIndicator
                          size="small"
                          color={theme.text.brand}
                        />
                        <Text
                          style={[
                            styles.typingText,
                            { color: theme.text.secondary },
                          ]}
                        >
                          {t("chat.thinking")}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>

          {/* Composer */}
          <View
            style={[
              styles.composer,
              { borderTopColor: theme.border.default },
            ]}
          >
            <View style={styles.composerRow}>
              <CustomTextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={t("chat.typeMessage")}
                accessibilityLabel={t("chat.messageInput")}
                multiline
                containerStyle={styles.composerInputContainer}
                inputContainerStyle={styles.composerInputInner}
                style={styles.composerInputText}
              />
              <CustomButton
                onPress={handleSend}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor:
                      draft.trim().length > 0 && !sending
                        ? theme.border.brand
                        : theme.bg.subtle,
                  },
                ]}
                accessibilityLabel={t("chat.sendMessage")}
                testID="mini-chat-send"
                disabled={draft.trim().length === 0 || sending}
              >
                <Send
                  size={16}
                  color={
                    draft.trim().length > 0 && !sending
                      ? theme.text.onBrand
                      : theme.text.tertiary
                  }
                />
              </CustomButton>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.historyBody}>
          <View style={styles.filtersWrap}>
            <ChatHistoryFilters
              selectedTopics={selectedTopics}
              onToggleTopic={handleToggleTopic}
              onClearTopics={handleClearTopics}
            />
          </View>
        <ScrollView
          style={styles.historyScroll}
          contentContainerStyle={styles.historyContent}
        >
          {loading && !data ? (
            <View style={styles.loadingWrap}>
              <LoadingSkeleton variant="text" />
              <LoadingSkeleton variant="text" />
              <LoadingSkeleton variant="text" />
            </View>
          ) : null}

          {!loading && data && filteredItems.length === 0 ? (
            <Text
              style={[styles.emptyText, { color: theme.text.secondary }]}
            >
              {selectedTopics.length === 0
                ? t("chat.noConversationsYet")
                : t("chat.noConversationsMatchTopics")}
            </Text>
          ) : null}

          {filteredItems.map((item) => (
            <CustomButton
              key={item.id}
              onPress={() => handleOpenThread(item.id)}
              style={[
                styles.historyCard,
                {
                  borderColor: theme.border.default,
                  backgroundColor: theme.bg.canvas,
                },
              ]}
              accessibilityLabel={t("chat.openChat", { title: item.title })}
            >
              <Text
                style={[
                  styles.historyTitle,
                  { color: theme.text.primary },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.historyPreview,
                  { color: theme.text.secondary },
                ]}
                numberOfLines={1}
              >
                {item.preview}
              </Text>
              <View style={styles.historyMeta}>
                <Text
                  style={[
                    styles.historyMetaText,
                    { color: theme.text.tertiary },
                  ]}
                >
                  {formatRelativeTime(item.updatedAtIso)}
                </Text>
                {item.unreadCount > 0 ? (
                  <View
                    style={[
                      styles.unreadDot,
                      { backgroundColor: theme.border.brand },
                    ]}
                  />
                ) : null}
              </View>
            </CustomButton>
          ))}
        </ScrollView>
        </View>
      )}
    </View>
  );
});

const MODAL_WIDTH = 380;
const MODAL_HEIGHT = 480;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: spacing[24],
    bottom: spacing[24],
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    overflow: "hidden",
    zIndex: 300,
    elevation: 16,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[10],
    borderBottomWidth: borderWidth.hairline,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  composeBody: {
    flex: 1,
    flexDirection: "column",
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing[16],
    gap: spacing[12],
  },
  welcomeBubble: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    padding: spacing[16],
    gap: spacing[8],
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  welcomeTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  welcomeBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  suggestionsWrap: {
    gap: spacing[8],
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionsGrid: {
    gap: spacing[6],
  },
  suggestionChip: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[10],
    alignItems: "flex-start",
  },
  suggestionText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  composer: {
    borderTopWidth: borderWidth.hairline,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[8],
  },
  composerInputContainer: {
    gap: spacing[0],
    flex: 1,
  },
  composerInputInner: {
    minHeight: 38,
    paddingVertical: spacing[6],
  },
  composerInputText: {
    minHeight: 18,
    lineHeight: 18,
    fontSize: 13,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[2],
  },
  historyBody: {
    flex: 1,
    flexDirection: "column",
  },
  filtersWrap: {
    paddingHorizontal: spacing[12],
    paddingTop: spacing[10],
    paddingBottom: spacing[4],
  },
  historyScroll: {
    flex: 1,
  },
  historyContent: {
    padding: spacing[12],
    gap: spacing[8],
  },
  loadingWrap: {
    gap: spacing[12],
    paddingVertical: spacing[8],
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: spacing[24],
  },
  historyCard: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    padding: spacing[12],
    gap: spacing[4],
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  historyPreview: {
    fontSize: 12,
    lineHeight: 16,
  },
  historyMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing[4],
  },
  historyMetaText: {
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  miniMsgRow: {
    flexDirection: "row",
    marginBottom: spacing[4],
  },
  miniMsgRowUser: {
    justifyContent: "flex-end",
  },
  miniMsgRowAssistant: {
    justifyContent: "flex-start",
  },
  miniMsgBubble: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    maxWidth: "85%",
  },
  miniMsgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  typingText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
