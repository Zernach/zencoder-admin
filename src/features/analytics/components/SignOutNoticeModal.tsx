import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { NoticeModal } from "@/components/modals";
import { useAppSelector, useAppDispatch, selectModalVisible, closeModal, ModalName } from "@/store";

export const SignOutNoticeModal = React.memo(function SignOutNoticeModal() {
  const { t } = useTranslation();
  const visible = useAppSelector(selectModalVisible(ModalName.SignOutNotice));
  const dispatch = useAppDispatch();

  const handleClose = useCallback(() => {
    dispatch(closeModal(ModalName.SignOutNotice));
  }, [dispatch]);

  return (
    <NoticeModal
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close sign out notice"
      dismissAccessibilityLabel="Dismiss sign out notice"
      title={t("settings.signOut.demoMode")}
      message={t("settings.signOut.demoMessage")}
      dismissLabel={t("settings.signOut.dismiss")}
    />
  );
});
