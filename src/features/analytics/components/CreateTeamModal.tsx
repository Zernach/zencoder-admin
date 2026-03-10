import React, { useCallback } from "react";
import { CustomModal } from "@/components/modals";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateTeam } from "@/features/analytics/hooks/useCreateTeam";
import { CreateTeamForm } from "./CreateTeamForm";

export const CreateTeamModal = React.memo(function CreateTeamModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateTeam));
  const dispatch = useAppDispatch();
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
    <CustomModal
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close create team form"
    >
      <CreateTeamForm onSubmit={handleSubmit} loading={loading} error={error} />
    </CustomModal>
  );
});
