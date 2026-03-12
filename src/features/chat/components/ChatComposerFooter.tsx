import React, { useCallback, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Paperclip } from "lucide-react-native";
import { CustomButton } from "@/components/buttons";
import { CustomTextInput } from "@/components/inputs";
import { NoticeModal } from "@/components/modals";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";

const ATTACHMENT_NOTICE_TITLE = "Unavailable in demo";
const ATTACHMENT_NOTICE_TEXT = "Images and files are not available in this demo.";
const ATTACHMENT_NOTICE_DISMISS_LABEL = "Dismiss";
const ATTACHMENT_BUTTON_ACCESSIBILITY_LABEL = "Attach image or file";
const ATTACHMENT_BUTTON_ACCESSIBILITY_HINT = "Upload support is coming soon";
const CLOSE_ATTACHMENT_NOTICE_ACCESSIBILITY_LABEL = "Close attachment notice";
const DISMISS_ATTACHMENT_NOTICE_ACCESSIBILITY_LABEL = "Dismiss attachment notice";

interface ChatComposerFooterProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  canSend: boolean;
  insetsBottom: number;
  placeholder: string;
  inputAccessibilityLabel: string;
  sendAccessibilityLabel: string;
  sendLabel?: string;
  containerTestID?: string;
  attachmentButtonTestID?: string;
  attachmentNoticeTestID?: string;
}

export function ChatComposerFooter({
  value,
  onChangeText,
  onSend,
  canSend,
  insetsBottom,
  placeholder,
  inputAccessibilityLabel,
  sendAccessibilityLabel,
  sendLabel = "Send",
  containerTestID,
  attachmentButtonTestID,
  attachmentNoticeTestID,
}: ChatComposerFooterProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const [isAttachmentNoticeVisible, setAttachmentNoticeVisible] = useState(false);

  const handleAttachmentPress = useCallback(() => {
    setAttachmentNoticeVisible(true);
  }, []);

  const handleCloseAttachmentNotice = useCallback(() => {
    setAttachmentNoticeVisible(false);
  }, []);

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
      testID={containerTestID}
    >
      <View style={styles.composerRow}>
        <View style={styles.attachmentButtonWrap}>
          <NoticeModal
            visible={isAttachmentNoticeVisible}
            onClose={handleCloseAttachmentNotice}
            title={ATTACHMENT_NOTICE_TITLE}
            message={ATTACHMENT_NOTICE_TEXT}
            dismissLabel={ATTACHMENT_NOTICE_DISMISS_LABEL}
            accessibilityLabel={CLOSE_ATTACHMENT_NOTICE_ACCESSIBILITY_LABEL}
            dismissAccessibilityLabel={DISMISS_ATTACHMENT_NOTICE_ACCESSIBILITY_LABEL}
            testID={attachmentNoticeTestID}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ATTACHMENT_BUTTON_ACCESSIBILITY_LABEL}
            accessibilityHint={ATTACHMENT_BUTTON_ACCESSIBILITY_HINT}
            onPress={handleAttachmentPress}
            onLongPress={handleAttachmentPress}
            style={({ pressed }) => [
              styles.attachmentButton,
              {
                borderColor: theme.border.default,
                backgroundColor: pressed ? theme.bg.surfaceHover : theme.bg.surface,
              },
            ]}
            testID={attachmentButtonTestID}
          >
            <Paperclip size={16} color={theme.icon.secondary} />
          </Pressable>
        </View>
        <CustomTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          accessibilityLabel={inputAccessibilityLabel}
          multiline
          containerStyle={styles.composerInputContainer}
          inputContainerStyle={styles.composerInputInner}
          style={styles.composerInputText}
        />
        <CustomButton
          onPress={onSend}
          label={sendLabel}
          buttonMode="primary"
          buttonSize="compact"
          accessibilityRole="button"
          accessibilityLabel={sendAccessibilityLabel}
          style={styles.sendButton}
          disabled={!canSend}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  attachmentButtonWrap: {
    justifyContent: "flex-end",
  },
  attachmentButton: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[2],
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
});
