import React, { useCallback } from "react";
import { CustomModal } from "@/components/modals";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateHuman } from "@/features/analytics/hooks/useCreateHuman";
import { CreateHumanForm } from "./CreateHumanForm";

export const AddSeatModal = React.memo(function AddSeatModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateSeat));
  const dispatch = useAppDispatch();
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
    <CustomModal
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close add seat form"
    >
      <CreateHumanForm onSubmit={handleSubmit} onCancel={handleClose} loading={loading} error={error} />
    </CustomModal>
  );
});
