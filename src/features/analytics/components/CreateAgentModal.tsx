import React, { useCallback } from "react";
import { View, Modal, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { X } from "lucide-react-native";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateAgent } from "@/features/analytics/hooks/useCreateAgent";
import { CreateAgentForm } from "./CreateAgentForm";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

export const CreateAgentModal = React.memo(function CreateAgentModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateAgent));
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const { create: createAgent, loading, error } = useCreateAgent();

  const handleClose = useCallback(() => {
    dispatch(closeModal(ModalName.CreateAgent));
  }, [dispatch]);

  const handleSubmit = useCallback(
    async (values: { name: string; projectId: string }) => {
      await createAgent(values);
      dispatch(closeModal(ModalName.CreateAgent));
    },
    [createAgent, dispatch],
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
          accessibilityLabel="Close create agent form"
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
          <CreateAgentForm onSubmit={handleSubmit} loading={loading} error={error} />
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
