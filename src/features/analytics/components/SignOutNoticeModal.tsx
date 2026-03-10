import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { CustomModal } from "@/components/modals";
import { CustomButton } from "@/components/buttons";
import { AlertTriangle } from "lucide-react-native";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";
import { typography } from "@/theme/typography";

export const SignOutNoticeModal = React.memo(function SignOutNoticeModal() {
  const { t } = useTranslation();
  const visible = useAppSelector(selectModalVisible(ModalName.SignOutNotice));
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const handleClose = useCallback(() => {
    dispatch(closeModal(ModalName.SignOutNotice));
  }, [dispatch]);

  const panelStyle = useMemo(
    () => ({
      backgroundColor: theme.bg.surface,
      borderColor: theme.state.warning + "40",
      padding: spacing[20],
      alignItems: "center" as const,
    }),
    [theme.bg.surface, theme.state.warning],
  );

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close sign out notice"
      panelWidth={380}
      showCloseButton={false}
      panelStyle={panelStyle}
    >
      <View style={[styles.noticeIconCircle, { backgroundColor: theme.state.warning + "1A" }]}>
        <AlertTriangle size={20} color={theme.state.warning} />
      </View>
      <Text style={[styles.noticeTitle, { color: theme.text.primary }]}>{t("settings.signOut.demoMode")}</Text>
      <Text style={[styles.noticeText, { color: theme.text.secondary }]}>{t("settings.signOut.demoMessage")}</Text>
      <CustomButton
        onPress={handleClose}
        style={styles.dismissBtn}
        buttonMode="primary"
        buttonSize="md"
        label={t("settings.signOut.dismiss")}
        accessibilityRole="button"
        accessibilityLabel="Dismiss sign out notice"
      />
    </CustomModal>
  );
});

const styles = StyleSheet.create({
  noticeIconCircle: {
    width: 44,
    height: 44,
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
    marginTop: spacing[4],
    alignSelf: "stretch",
    paddingVertical: spacing[12],
  },
});
