import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildChatThreadRoute } from "@/constants/routes";
import { isIos } from "@/constants";
import { ScreenWrapper } from "@/components/screen";
import { useAppDependencies } from "@/core/di";
import { useAppSelector } from "@/store/hooks";
import { selectMostRecentTab } from "@/store";
import { selectOrgId } from "@/store/slices/filtersSlice";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import {
  getAllSuggestedPrompts,
  getWelcomeTitle,
  getWelcomeSubtitle,
} from "@/features/chat/constants/suggestedPrompts";
import {
  InfiniteHorizontalScrollview,
  ChatComposerFooter,
} from "@/features/chat/components";

const SUGGESTION_CARD_WIDTH = 280;
const SUGGESTION_CARD_GAP = 10;
const BRICK_LANE_OFFSET = Math.round((SUGGESTION_CARD_WIDTH + SUGGESTION_CARD_GAP) / 2);

export function CreateChatScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { chatService } = useAppDependencies();
  const orgId = useAppSelector(selectOrgId);
  const tab = useAppSelector(selectMostRecentTab);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const bp = useBreakpoint();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const isMobileOrTablet = bp !== "desktop";

  const suggestedPrompts = useMemo(() => getAllSuggestedPrompts(t), [t]);
  const [primaryPromptLane, secondaryPromptLane] = useMemo(() => {
    const splitIndex = Math.ceil(suggestedPrompts.length / 2);
    return [
      suggestedPrompts.slice(0, splitIndex),
      suggestedPrompts.slice(splitIndex),
    ];
  }, [suggestedPrompts]);
  const canSubmit = message.trim().length > 0 && !submitting;

  const submitMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);

      const title =
        trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
      chatService
        .createChat({ orgId, tab, title, firstMessage: trimmed })
        .then((response) => {
          const destination = buildChatThreadRoute(response.chat.id) as never;
          // On Android, schedule route transition on the next frame so touch
          // feedback can paint without waiting for InteractionManager.
          if (Platform.OS === "android") {
            requestAnimationFrame(() => {
              router.replace(destination);
            });
          } else {
            router.replace(destination);
          }
        })
        .catch(() => {
          setMessage(trimmed);
          submittingRef.current = false;
          setSubmitting(false);
        });
    },
    [orgId, chatService, tab, router],
  );

  const handleCreate = useCallback(
    () => void submitMessage(message),
    [submitMessage, message],
  );

  const handleSuggestionPress = useCallback(
    (promptMessage: string) => {
      setMessage(promptMessage);
      void submitMessage(promptMessage);
    },
    [submitMessage],
  );

  return (
    <KeyboardAvoidingView
      behavior={isIos ? "padding" : "height"}
      keyboardVerticalOffset={0}
      style={styles.keyboardAvoiding}
    >
      <ScreenWrapper
        showTopBar={false}
        headerProps={{
          title: t("chat.newChat"),
          subtitle: t("chat.startConversation"),
          isLoading: submitting,
        }}
        showFilterBar={false}
        bottomAccessory={(
          <ChatComposerFooter
            value={message}
            onChangeText={setMessage}
            onSend={handleCreate}
            canSend={canSubmit}
            insetsBottom={insets.bottom}
            placeholder={t("chat.askAnything")}
            inputAccessibilityLabel={t("chat.messageInput")}
            sendAccessibilityLabel={t("chat.sendMessage")}
            containerTestID="create-chat-composer"
            attachmentButtonTestID="create-chat-attach-button"
            attachmentNoticeTestID="create-chat-attach-tooltip"
          />
        )}
      >
        <View style={styles.container}>
          {/* Welcome area */}
          <View
            style={[
              styles.welcomeCard,
              {
                backgroundColor: theme.bg.subtle,
                borderColor: theme.border.default,
              },
            ]}
          >
            <View style={styles.welcomeRow}>
              <View
                style={[
                  styles.sparkleCircle,
                  { backgroundColor: theme.bg.brandSubtle },
                ]}
              >
                <Sparkles size={20} color={theme.text.brand} />
              </View>
              <View style={styles.welcomeTextWrap}>
                <Text
                  style={[styles.welcomeTitle, { color: theme.text.primary }]}
                >
                  {getWelcomeTitle(t)}
                </Text>
                <Text
                  style={[styles.welcomeSubtitle, { color: theme.text.secondary }]}
                >
                  {getWelcomeSubtitle(tab, t)}
                </Text>
              </View>
            </View>
          </View>

          {/* Suggested prompts */}
          <View style={styles.suggestionsSection}>
            <Text
              style={[styles.suggestionsLabel, { color: theme.text.tertiary }]}
            >
              {t("chat.suggestedQuestions")}
            </Text>
            {isMobileOrTablet ? (
              <View style={styles.suggestionLanes}>
                <InfiniteHorizontalScrollview
                  prompts={primaryPromptLane}
                  onPressPrompt={handleSuggestionPress}
                  disabled={submitting}
                />
                <InfiniteHorizontalScrollview
                  prompts={secondaryPromptLane}
                  onPressPrompt={handleSuggestionPress}
                  disabled={submitting}
                  leadingOffsetPx={BRICK_LANE_OFFSET}
                  initialScrollOffsetPx={SUGGESTION_CARD_WIDTH}
                />
              </View>
            ) : (
              <InfiniteHorizontalScrollview
                prompts={suggestedPrompts}
                onPressPrompt={handleSuggestionPress}
                disabled={submitting}
              />
            )}
          </View>
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    gap: spacing[20],
  },
  welcomeCard: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.lg,
    padding: spacing[20],
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[16],
  },
  sparkleCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTextWrap: {
    flex: 1,
    gap: spacing[4],
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionsSection: {
    gap: spacing[10],
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionLanes: {
    gap: spacing[10],
  },
});
