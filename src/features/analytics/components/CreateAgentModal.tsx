import React, { useCallback } from "react";
import { CustomModal } from "@/components/modals";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateAgent } from "@/features/analytics/hooks/useCreateAgent";
import { CreateAgentForm } from "./CreateAgentForm";

export const CreateAgentModal = React.memo(function CreateAgentModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateAgent));
  const dispatch = useAppDispatch();
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
    <CustomModal
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close create agent form"
    >
      <CreateAgentForm onSubmit={handleSubmit} loading={loading} error={error} />
    </CustomModal>
  );
});
