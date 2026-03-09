import React, { useCallback } from "react";
import { View, Modal, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { X } from "lucide-react-native";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateTeam } from "@/features/analytics/hooks/useCreateTeam";
import { CreateTeamForm } from "./CreateTeamForm";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

export const CreateTeamModal = React.memo(function CreateTeamModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateTeam));
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const { create: createTeam, loading, error } = useCreateTeam();

  const handleClose = useCallback(() => {
    dispatch(closeModal(ModalName.CreateTeam));
  }, [dispatch]);

  const handleSubmit = useCallback(
    async (values: { name: string }) => {
      await createTeam(values);
      dispatch(closeModal(ModalName.CreateTeam));
    },
    [createTeam, dispatch],
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
          accessibilityLabel="Close create team form"
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
          <CreateTeamForm onSubmit={handleSubmit} loading={loading} error={error} />
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
    paddingHorizontal: 20,
  },
  modalPanel: {
    width: 400,
    maxWidth: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
