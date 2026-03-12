import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { CustomModal } from "./CustomModal";
import { CustomButton } from "@/components/buttons";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";
import { typography } from "@/theme/typography";

interface NoticeModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  dismissLabel: string;
  accessibilityLabel?: string;
  dismissAccessibilityLabel?: string;
  panelWidth?: number;
  testID?: string;
}

export const NoticeModal = React.memo(function NoticeModal({
  visible,
  onClose,
  title,
  message,
  dismissLabel,
  accessibilityLabel = "Close notice",
  dismissAccessibilityLabel = "Dismiss notice",
  panelWidth = 380,
  testID,
}: NoticeModalProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const panelStyle = useMemo(
    () => ({
      backgroundColor: theme.bg.surface,
      borderColor: theme.state.warning + "40",
      padding: spacing[20],
    }),
    [theme.bg.surface, theme.state.warning],
  );

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      accessibilityLabel={accessibilityLabel}
      panelWidth={panelWidth}
      showCloseButton={false}
      panelStyle={panelStyle}
    >
      <View style={styles.content} testID={testID}>
        <View style={[styles.iconRow, { backgroundColor: theme.state.warning + "1A" }]}>
          <AlertTriangle size={20} color={theme.state.warning} />
        </View>
        <Text style={[styles.noticeTitle, { color: theme.text.primary }]}>{title}</Text>
        <Text style={[styles.noticeText, { color: theme.text.secondary }]}>{message}</Text>
        <CustomButton
          onPress={onClose}
          style={styles.dismissBtn}
          buttonMode="primary"
          buttonSize="md"
          label={dismissLabel}
          accessibilityRole="button"
          accessibilityLabel={dismissAccessibilityLabel}
        />
      </View>
    </CustomModal>
  );
});

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    gap: spacing[12],
  },
  iconRow: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTitle: {
    fontFamily: typography.sectionTitle.fontFamily,
    fontSize: 16,
    fontWeight: "600",
  },
  noticeText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  dismissBtn: {
    alignSelf: "stretch",
    paddingVertical: spacing[12],
  },
});
