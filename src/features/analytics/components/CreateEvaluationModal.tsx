import React, { useCallback } from "react";
import { CustomModal } from "@/components/modals";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateEvaluation } from "@/features/analytics/hooks/useCreateEvaluation";
import { CreateEvaluationForm } from "./CreateEvaluationForm";

export const CreateEvaluationModal = React.memo(function CreateEvaluationModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateEvaluation));
  const dispatch = useAppDispatch();
  const { create: createEvaluation, loading, error } = useCreateEvaluation();

  const handleClose = useCallback(() => {
    dispatch(closeModal(ModalName.CreateEvaluation));
  }, [dispatch]);

  const handleSubmit = useCallback(
    async (values: { projectId: string; criteriaIds: string[] }) => {
      await createEvaluation(values);
      dispatch(closeModal(ModalName.CreateEvaluation));
    },
    [createEvaluation, dispatch],
  );

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close create evaluation form"
    >
      <CreateEvaluationForm onSubmit={handleSubmit} onCancel={handleClose} loading={loading} error={error} />
    </CustomModal>
  );
});
