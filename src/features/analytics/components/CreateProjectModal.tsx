import React, { useCallback } from "react";
import { View, Modal, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { X } from "lucide-react-native";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateProject } from "@/features/analytics/hooks/useCreateProject";
import { CreateProjectForm } from "./CreateProjectForm";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

export const CreateProjectModal = React.memo(function CreateProjectModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateProject));
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const { create: createProject, loading, error } = useCreateProject();

  const handleClose = useCallback(() => {
    dispatch(closeModal(ModalName.CreateProject));
  }, [dispatch]);

  const handleSubmit = useCallback(
    async (values: { name: string; teamId: string }) => {
      await createProject(values);
      dispatch(closeModal(ModalName.CreateProject));
    },
    [createProject, dispatch],
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
          accessibilityLabel="Close create project form"
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
          <CreateProjectForm onSubmit={handleSubmit} loading={loading} error={error} />
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
