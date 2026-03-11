import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { TABS } from "@/constants/routes";
import { isIos } from "@/constants";
import { ScreenWrapper } from "@/components/screen";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { CustomButton } from "@/components/buttons";
import { CustomTextInput } from "@/components/inputs";
import { useAppDependencies } from "@/core/di";
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

export function ChatThreadScreen({ tab, chatId }: ChatThreadScreenProps) {
  const insets = useSafeAreaInsets();
  const { chatService } = useAppDependencies();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const { data, loading, error, refetch } = useChatThread(tab, chatId);
  const [draft, setDraft] = useState<string>("");
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

  const handleSend = useCallback(() => {
    const value = draft.trim();
    if (value.length === 0 || sendingRef.current) return;

    setDraft("");
    sendingRef.current = true;
    setSending(true);

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: `local-user-${Date.now()}`,
      chatId,
      role: "user",
      authorName: "Admin",
      content: value,
      createdAtIso: new Date().toISOString(),
    };
    setExtraMessages((prev) => [...prev, userMsg]);

    chatService
      .sendMessage({ tab, chatId, content: value })
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
  }, [draft, chatId, tab, chatService]);

  if (error) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
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
          <View
            style={[
              styles.composerContainer,
              {
                borderTopColor: theme.border.default,
                backgroundColor: theme.bg.canvas,
                paddingBottom: Math.max(spacing[8], insets.bottom),
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
                disabled={draft.trim().length === 0}
              />
            </View>
          </View>
        )}
      >
        {loading && !data ? (
          <View style={styles.loadingWrap}>
            <LoadingSkeleton variant="text" />
          </View>
        ) : null}

        {allMessages.map((message) => {
          const bubbleType = getBubbleStyle(message.role);
          const isUser = bubbleType === "user";
          const isSystem = bubbleType === "system";

          return (
            <View
              key={message.id}
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
                <Text style={[styles.messageAuthor, { color: theme.text.secondary }]}>{message.authorName}</Text>
                <Text style={[styles.messageContent, { color: theme.text.primary }]}>{message.content}</Text>
                <Text style={[styles.messageTime, { color: theme.text.tertiary }]}>{formatTimestamp(message.createdAtIso)}</Text>
              </View>
            </View>
          );
        })}

        {sending ? (
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
        ) : null}
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
