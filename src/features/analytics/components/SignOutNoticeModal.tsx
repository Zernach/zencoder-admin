import React, { useCallback } from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { AlertTriangle } from "lucide-react-native";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";
import { typography } from "@/theme/typography";

const DEMO_SIGN_OUT_MESSAGE = "This is a dashboard demo, so you are unable to sign out.";

export const SignOutNoticeModal = React.memo(function SignOutNoticeModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.SignOutNotice));
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const handleClose = useCallback(() => {
    dispatch(closeModal(ModalName.SignOutNotice));
  }, [dispatch]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.bg.overlay }]}>
        <CustomButton
          style={StyleSheet.absoluteFillObject}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close sign out notice"
        />
        <View
          style={[
            styles.signOutNoticePanel,
            { backgroundColor: theme.bg.surface, borderColor: theme.state.warning + "40" },
          ]}
        >
          <View style={[styles.noticeIconCircle, { backgroundColor: theme.state.warning + "1A" }]}>
            <AlertTriangle size={20} color={theme.state.warning} />
          </View>
          <Text style={[styles.noticeTitle, { color: theme.text.primary }]}>Demo Mode</Text>
          <Text style={[styles.noticeText, { color: theme.text.secondary }]}>{DEMO_SIGN_OUT_MESSAGE}</Text>
          <CustomButton
            onPress={handleClose}
            style={styles.dismissBtn}
            buttonMode="primary"
            buttonSize="md"
            label="Dismiss"
            accessibilityRole="button"
            accessibilityLabel="Dismiss sign out notice"
          />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[20],
  },
  signOutNoticePanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing[20],
    gap: spacing[12],
    width: 380,
    maxWidth: "100%",
    alignItems: "center",
  },
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
