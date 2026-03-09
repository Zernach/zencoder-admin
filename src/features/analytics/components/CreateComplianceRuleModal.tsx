import React, { useCallback } from "react";
import { View, Modal, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { X } from "lucide-react-native";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateComplianceViolationRule } from "@/features/analytics/hooks/useCreateComplianceViolationRule";
import { CreateComplianceRuleForm } from "./CreateComplianceRuleForm";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import type { Severity } from "@/features/analytics/types";

export function CreateComplianceRuleModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateComplianceRule));
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const { create: createRule, loading } = useCreateComplianceViolationRule();

  const handleClose = useCallback(() => {
    dispatch(closeModal(ModalName.CreateComplianceRule));
  }, [dispatch]);

  const handleSubmit = useCallback(
    async (values: { name: string; description: string; severity: Severity }) => {
      await createRule(values);
      dispatch(closeModal(ModalName.CreateComplianceRule));
    },
    [createRule, dispatch],
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
          accessibilityLabel="Close create rule form"
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
          <CreateComplianceRuleForm onSubmit={handleSubmit} loading={loading} />
        </View>
      </View>
    </Modal>
  );
}

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
