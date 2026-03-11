import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Sparkles, Send } from "lucide-react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { TABS } from "@/constants/routes";
import { buildChatThreadRoute } from "@/constants/routes";
import { ScreenWrapper } from "@/components/screen";
import { CustomButton } from "@/components/buttons";
import { CustomTextInput } from "@/components/inputs";
import { useAppDependencies } from "@/core/di";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";
import {
  getSuggestedPrompts,
  getWelcomeTitle,
  getWelcomeSubtitle,
} from "@/features/chat/constants/suggestedPrompts";

interface CreateChatScreenProps {
  tab: TABS;
}

export function CreateChatScreen({ tab }: CreateChatScreenProps) {
  const router = useRouter();
  const { chatService } = useAppDependencies();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const suggestedPrompts = useMemo(() => getSuggestedPrompts(tab), [tab]);
  const canSubmit = message.trim().length > 0 && !submitting;

  const submitMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || submitting) return;

      setSubmitting(true);
      try {
        const title =
          trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
        const response = await chatService.createChat({
          tab,
          title,
          firstMessage: trimmed,
        });
        router.replace(buildChatThreadRoute(tab, response.chat.id) as never);
      } catch {
        setSubmitting(false);
      }
    },
    [submitting, chatService, tab, router],
  );

  const handleCreate = useCallback(
    () => void submitMessage(message),
    [submitMessage, message],
  );

  const handleSuggestionPress = useCallback(
    (promptMessage: string) => {
      void submitMessage(promptMessage);
    },
    [submitMessage],
  );

  const keyboard = useAnimatedKeyboard();
  const restingBottom = insets.bottom > 0 ? insets.bottom : spacing[8];

  const composerAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom:
      keyboard.height.value > 0 ? keyboard.height.value : restingBottom,
  }));

  const composerAccessory = (
    <Animated.View
      style={[
        styles.composerBar,
        {
          borderTopColor: theme.border.default,
          backgroundColor: theme.bg.surface,
        },
        Platform.OS !== "web" ? composerAnimatedStyle : { paddingBottom: restingBottom },
      ]}
    >
      <View style={styles.composerRow}>
        <CustomTextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask anything..."
          accessibilityLabel="Chat message input"
          multiline
          containerStyle={styles.composerInputContainer}
          inputContainerStyle={styles.composerInputInner}
          style={styles.composerInputText}
        />
        <CustomButton
          onPress={handleCreate}
          style={[
            styles.sendBtn,
            {
              backgroundColor: canSubmit
                ? theme.border.brand
                : theme.bg.subtle,
            },
          ]}
          accessibilityLabel="Send message"
          disabled={!canSubmit}
        >
          <Send
            size={18}
            color={canSubmit ? theme.text.onBrand : theme.text.tertiary}
          />
        </CustomButton>
      </View>
    </Animated.View>
  );

  return (
    <ScreenWrapper
      showTopBar={false}
      headerProps={{
        title: "New Chat",
        subtitle: "Start a conversation",
        isLoading: submitting,
      }}
      showFilterBar={false}
      bottomAccessory={composerAccessory}
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
                {getWelcomeTitle()}
              </Text>
              <Text
                style={[styles.welcomeSubtitle, { color: theme.text.secondary }]}
              >
                {getWelcomeSubtitle(tab)}
              </Text>
            </View>
          </View>
        </View>

        {/* Suggested prompts */}
        <View style={styles.suggestionsSection}>
          <Text
            style={[styles.suggestionsLabel, { color: theme.text.tertiary }]}
          >
            Suggested questions
          </Text>
          <View style={styles.suggestionsGrid}>
            {suggestedPrompts.map((prompt) => (
              <CustomButton
                key={prompt.label}
                onPress={() => handleSuggestionPress(prompt.message)}
                style={[
                  styles.suggestionCard,
                  {
                    borderColor: theme.border.default,
                    backgroundColor: theme.bg.surface,
                  },
                ]}
                disabled={submitting}
                accessibilityLabel={prompt.label}
                testID={`suggestion-${prompt.label}`}
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
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[20],
    maxWidth: 640,
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
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[10],
  },
  suggestionCard: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 200,
    alignItems: "flex-start",
  },
  suggestionText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  composerBar: {
    borderTopWidth: borderWidth.hairline,
    paddingTop: spacing[10],
    paddingHorizontal: spacing[12],
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[10],
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
    minHeight: 24,
    lineHeight: 20,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[2],
  },
});
