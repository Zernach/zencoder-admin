import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  type ListRenderItemInfo,
} from "react-native";
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ROUTES, type TABS } from "@/constants/routes";
import { isIos } from "@/constants";
import { ScreenWrapper } from "@/components/screen";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { CustomList } from "@/components/lists";
import { useAppDependencies } from "@/core/di";
import { useAppSelector } from "@/store/hooks";
import { selectOrgId } from "@/store/slices/filtersSlice";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";
import { useChatThread } from "@/features/chat/hooks";
import { ChatComposerFooter } from "@/features/chat/components/ChatComposerFooter";
import type { ChatMessage, ChatMessageRole } from "@/features/chat/types";

interface ChatThreadScreenProps {
  tab: TABS;
  chatId: string;
}

const THREAD_HEADER_TITLE = "Thread";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}

function getBubbleStyle(role: ChatMessageRole): "assistant" | "user" | "system" {
  if (role === "user") {
    return "user";
  }

  if (role === "system") {
    return "system";
  }

  return "assistant";
}

interface ChatThreadMessagesProps {
  data: ReturnType<typeof useChatThread>["data"];
  loading: boolean;
  messages: ChatMessage[];
  sending: boolean;
}

type ThemePalette = (typeof semanticThemes)["light"];

interface ChatThreadMessageRowProps {
  message: ChatMessage;
  theme: ThemePalette;
}

const ChatThreadMessageRow = React.memo(function ChatThreadMessageRow({
  message,
  theme,
}: ChatThreadMessageRowProps) {
  const bubbleType = getBubbleStyle(message.role);
  const isUser = bubbleType === "user";
  const isSystem = bubbleType === "system";

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.userRow : styles.assistantRow,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            borderColor: theme.border.default,
            backgroundColor: isUser
              ? theme.bg.brandSubtle
              : isSystem
                ? theme.bg.subtle
                : theme.bg.surface,
          },
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={[styles.messageAuthor, { color: theme.text.secondary }]}>
          {message.authorName}
        </Text>
        <Text style={[styles.messageContent, { color: theme.text.primary }]}>
          {message.content}
        </Text>
        <Text style={[styles.messageTime, { color: theme.text.tertiary }]}>
          {formatTimestamp(message.createdAtIso)}
        </Text>
      </View>
    </View>
  );
});

const ChatThreadMessages = React.memo(function ChatThreadMessages({
  data,
  loading,
  messages,
  sending,
}: ChatThreadMessagesProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => (
      <ChatThreadMessageRow
        message={item}
        theme={theme}
      />
    ),
    [theme],
  );

  const keyMessage = useCallback((item: ChatMessage) => item.id, []);

  const sendingIndicator = useMemo(() => {
    if (!sending) {
      return null;
    }

    return (
      <View style={[styles.messageRow, styles.assistantRow]}>
        <View
          style={[
            styles.messageBubble,
            styles.assistantBubble,
            {
              borderColor: theme.border.default,
              backgroundColor: theme.bg.surface,
            },
          ]}
        >
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color={theme.text.brand} />
            <Text
              style={[styles.typingText, { color: theme.text.secondary }]}
            >
              Zencoder is thinking...
            </Text>
          </View>
        </View>
      </View>
    );
  }, [sending, theme]);

  return (
    <>
      {loading && !data ? (
        <View style={styles.loadingWrap}>
          <LoadingSkeleton variant="text" />
        </View>
      ) : null}
      <CustomList
        flatListProps={{
          data: messages,
          renderItem: renderMessage,
          keyExtractor: keyMessage,
          scrollEnabled: false,
          contentContainerStyle: styles.messageList,
          ListFooterComponent: sendingIndicator,
        }}
      />
    </>
  );
});

interface ChatThreadMetaCardProps {
  data: ReturnType<typeof useChatThread>["data"];
}

const ChatThreadMetaCard = React.memo(function ChatThreadMetaCard({
  data,
}: ChatThreadMetaCardProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  if (!data) {
    return null;
  }

  return (
    <View
      style={[
        styles.metaCard,
        {
          borderColor: theme.border.default,
          backgroundColor: theme.bg.surfaceElevated,
        },
      ]}
      testID="chat-thread-meta-card"
    >
      <View style={styles.metaHeaderRow}>
        <View style={[styles.metaIconWrap, { backgroundColor: theme.bg.brandSubtle }]}>
          <Sparkles size={14} color={theme.text.brand} />
        </View>
        <View style={styles.metaTitleWrap}>
          <Text style={[styles.metaLabel, { color: theme.text.tertiary }]}>
            Conversation
          </Text>
          <Text
            style={[styles.metaTitle, { color: theme.text.primary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {data.chat.shortSummary ?? "Conversation summary"}
          </Text>
        </View>
      </View>
      <View style={styles.metaFooterRow}>
        <Text style={[styles.metaTimestamp, { color: theme.text.secondary }]}>
          Updated {formatTimestamp(data.chat.updatedAtIso)}
        </Text>
        <Text style={[styles.metaStats, { color: theme.text.tertiary }]}>
          {data.chat.messageCount} msgs
        </Text>
      </View>
      <View style={styles.metaTopicsRow}>
        {data.chat.topics.map((topic) => (
          <View
            key={topic}
            style={[
              styles.metaTopicChip,
              {
                borderColor: theme.border.subtle,
                backgroundColor: theme.bg.surface,
              },
            ]}
          >
            <Text style={[styles.metaTopicText, { color: theme.text.secondary }]}>
              {topic}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

export function ChatThreadScreen({ tab, chatId }: ChatThreadScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { chatService } = useAppDependencies();
  const orgId = useAppSelector(selectOrgId);
  const { data, loading, error, refetch } = useChatThread(tab, chatId);
  const [extraMessages, setExtraMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const sendingRef = useRef(false);

  const allMessages = useMemo(() => {
    const base = data?.messages ?? [];
    return [...base, ...extraMessages];
  }, [data?.messages, extraMessages]);

  const headerProps = useMemo(() => ({
    title: THREAD_HEADER_TITLE,
    isLoading: loading,
  }), [loading]);

  const handleSend = useCallback((content: string) => {
    if (sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: `local-user-${Date.now()}`,
      chatId,
      role: "user",
      authorName: "Admin",
      content,
      createdAtIso: new Date().toISOString(),
    };
    setExtraMessages((prev) => [...prev, userMsg]);

    chatService
      .sendMessage({ orgId, tab, chatId, content })
      .then((response) => {
        // Replace optimistic user message with server version, add AI response
        setExtraMessages((prev) => [
          ...prev.filter((m) => m.id !== userMsg.id),
          response.userMessage,
          response.assistantMessage,
        ]);
      })
      .catch(() => {
        // Keep the optimistic message on error
      })
      .finally(() => {
        sendingRef.current = false;
        setSending(false);
      });
  }, [chatId, orgId, tab, chatService]);

  const handleComposerSend = useCallback(() => {
    const content = draft.trim();
    if (content.length === 0 || sending) return;

    setDraft("");
    handleSend(content);
  }, [draft, handleSend, sending]);

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
    <KeyboardAvoidingView
      behavior={isIos ? "padding" : "height"}
      keyboardVerticalOffset={0}
      style={styles.keyboardAvoiding}
    >
      <ScreenWrapper
        showTopBar={false}
        headerProps={headerProps}
        showFilterBar={false}
        bottomAccessory={(
          <ChatComposerFooter
            value={draft}
            onChangeText={setDraft}
            onSend={handleComposerSend}
            canSend={draft.trim().length > 0 && !sending}
            insetsBottom={insets.bottom}
            placeholder="Ask a follow-up..."
            inputAccessibilityLabel="Chat message input"
            sendAccessibilityLabel="Send chat message"
            containerTestID="chat-thread-composer"
            attachmentButtonTestID="chat-thread-attach-button"
            attachmentNoticeTestID="chat-thread-attach-tooltip"
          />
        )}
      >
        <ChatThreadMetaCard data={data} />
        <ChatThreadMessages
          data={data}
          loading={loading}
          messages={allMessages}
          sending={sending}
        />
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  loadingWrap: {
    paddingVertical: spacing[12],
  },
  messageRow: {
    flexDirection: "row",
  },
  messageList: {
    gap: spacing[8],
    paddingTop: spacing[4],
  },
  assistantRow: {
    justifyContent: "flex-start",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.lg,
    padding: spacing[12],
    gap: spacing[8],
    maxWidth: "88%",
  },
  assistantBubble: {
    borderTopLeftRadius: spacing[6],
  },
  userBubble: {
    borderTopRightRadius: spacing[6],
  },
  messageAuthor: {
    fontSize: 11,
    fontWeight: "600",
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
    paddingVertical: spacing[2],
  },
  typingText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  metaCard: {
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    padding: spacing[12],
    gap: spacing[10],
  },
  metaHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[10],
  },
  metaIconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing[2],
  },
  metaTitleWrap: {
    flex: 1,
    minWidth: 0,
    gap: spacing[4],
  },
  metaLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  metaTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
  },
  metaFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing[8],
  },
  metaTimestamp: {
    fontSize: 12,
    flexShrink: 1,
  },
  metaStats: {
    fontSize: 11,
    fontWeight: "600",
  },
  metaTopicsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[8],
  },
  metaTopicChip: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.full,
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
  },
  metaTopicText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
