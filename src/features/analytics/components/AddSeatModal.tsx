import React, { useCallback } from "react";
import { View, Modal, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { X } from "lucide-react-native";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateHuman } from "@/features/analytics/hooks/useCreateHuman";
import { CreateHumanForm } from "./CreateHumanForm";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

export const AddSeatModal = React.memo(function AddSeatModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateSeat));
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const { create: createHuman, loading, error } = useCreateHuman();

  const handleClose = useCallback(() => {
    dispatch(closeModal(ModalName.CreateSeat));
  }, [dispatch]);

  const handleSubmit = useCallback(
    async (values: { name: string; email: string; teamId: string }) => {
      await createHuman(values);
      dispatch(closeModal(ModalName.CreateSeat));
    },
    [createHuman, dispatch],
  );

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
          accessibilityLabel="Close add seat form"
        />
        <View style={[styles.modalPanel, { backgroundColor: theme.bg.subtle, borderColor: theme.border.default }]}>
          <View style={styles.modalHeader}>
            <CustomButton
              onPress={handleClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={16} color={theme.text.secondary} />
            </CustomButton>
          </View>
          <CreateHumanForm onSubmit={handleSubmit} loading={loading} error={error} />
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
  modalPanel: {
    width: 400,
    maxWidth: "100%",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing[16],
    gap: spacing[12],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
