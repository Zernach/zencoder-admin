import React, { useCallback } from "react";
import { CustomModal } from "@/components/modals";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";
import { useCreateProject } from "@/features/analytics/hooks/useCreateProject";
import { CreateProjectForm } from "./CreateProjectForm";

export const CreateProjectModal = React.memo(function CreateProjectModal() {
  const visible = useAppSelector(selectModalVisible(ModalName.CreateProject));
  const dispatch = useAppDispatch();
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
    <CustomModal
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close create project form"
    >
      <CreateProjectForm onSubmit={handleSubmit} loading={loading} error={error} />
    </CustomModal>
  );
});
