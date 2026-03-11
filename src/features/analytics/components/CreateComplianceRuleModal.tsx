import React, { useCallback } from "react";
import { CustomModal } from "@/components/modals";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateComplianceViolationRule } from "@/features/analytics/hooks/useCreateComplianceViolationRule";
import { CreateComplianceRuleForm } from "./CreateComplianceRuleForm";
import type { Severity } from "@/features/analytics/types";

export const CreateComplianceRuleModal = React.memo(function CreateComplianceRuleModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateComplianceRule));
  const dispatch = useAppDispatch();
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
    <CustomModal
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close create rule form"
    >
      <CreateComplianceRuleForm onSubmit={handleSubmit} onCancel={handleClose} loading={loading} />
    </CustomModal>
  );
});
