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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ROUTES, type TABS } from "@/constants/routes";
import { isIos } from "@/constants";
import { ScreenWrapper } from "@/components/screen";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { CustomButton } from "@/components/buttons";
import { CustomTextInput } from "@/components/inputs";
import { CustomList } from "@/components/lists";
import { useAppDependencies } from "@/core/di";
import { useAppSelector } from "@/store/hooks";
import { selectOrgId } from "@/store/slices/filtersSlice";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";
import { useChatThread } from "@/features/chat/hooks";
import type { ChatMessage, ChatMessageRole } from "@/features/chat/types";

interface ChatThreadScreenProps {
  tab: TABS;
  chatId: string;
}

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

interface ChatThreadComposerProps {
  insetsBottom: number;
  sending: boolean;
  onSend: (content: string) => void;
}

const ChatThreadComposer = React.memo(function ChatThreadComposer({
  insetsBottom,
  sending,
  onSend,
}: ChatThreadComposerProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const [draft, setDraft] = useState("");

  const handleSend = useCallback(() => {
    const content = draft.trim();
    if (content.length === 0 || sending) return;

    setDraft("");
    onSend(content);
  }, [draft, onSend, sending]);

  const canSend = draft.trim().length > 0 && !sending;

  return (
    <View
      style={[
        styles.composerContainer,
        {
          borderTopColor: theme.border.default,
          backgroundColor: theme.bg.canvas,
          paddingBottom: Math.max(spacing[8], insetsBottom),
        },
      ]}
      testID="chat-thread-composer"
    >
      <View style={styles.composerRow}>
        <CustomTextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask a follow-up..."
          accessibilityLabel="Chat message input"
          multiline
          containerStyle={styles.composerInputContainer}
          inputContainerStyle={styles.composerInputInner}
          style={styles.composerInputText}
        />
        <CustomButton
          onPress={handleSend}
          label="Send"
          buttonMode="primary"
          buttonSize="compact"
          accessibilityRole="button"
          accessibilityLabel="Send chat message"
          style={styles.sendButton}
          disabled={!canSend}
        />
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
  const sendingRef = useRef(false);

  const allMessages = useMemo(() => {
    const base = data?.messages ?? [];
    return [...base, ...extraMessages];
  }, [data?.messages, extraMessages]);

  const headerProps = useMemo(() => {
    if (!data) {
      return {
        title: "Chat",
        subtitle: loading ? "Loading conversation" : "Conversation",
        isLoading: loading,
      };
    }

    return {
      title: data.chat.title,
      subtitle: `Updated ${formatTimestamp(data.chat.updatedAtIso)}`,
      isLoading: loading,
    };
  }, [data, loading]);

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
          <ChatThreadComposer
            insetsBottom={insets.bottom}
            sending={sending}
            onSend={handleSend}
          />
        )}
      >
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
    gap: spacing[4],
  },
  assistantRow: {
    justifyContent: "flex-start",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    padding: spacing[12],
    gap: spacing[6],
    maxWidth: "86%",
  },
  assistantBubble: {
    borderTopLeftRadius: spacing[4],
  },
  userBubble: {
    borderTopRightRadius: spacing[4],
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
  composerContainer: {
    borderTopWidth: borderWidth.hairline,
    paddingHorizontal: spacing[12],
    paddingTop: spacing[8],
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
    minHeight: 44,
    paddingVertical: spacing[8],
  },
  composerInputText: {
    minHeight: 20,
    lineHeight: 20,
  },
  sendButton: {
    marginBottom: spacing[2],
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
});
