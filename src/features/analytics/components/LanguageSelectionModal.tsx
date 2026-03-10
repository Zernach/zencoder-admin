import React, { useCallback } from "react";
import { CustomModal } from "@/components/modals";
import {
  useAppSelector,
  useAppDispatch,
  selectModalVisible,
  closeModal,
  ModalName,
  selectSelectedLanguage,
  setLanguage,
} from "@/store";
import { LanguageSelectionForm } from "./LanguageSelectionForm";
import type { LanguageCode } from "@/types/settings";
import i18n from "@/i18n/config";

export const LanguageSelectionModal = React.memo(
  function LanguageSelectionModal() {
    const visible = useAppSelector(
      selectModalVisible(ModalName.LanguageSelection),
    );
    const selectedLanguage = useAppSelector(selectSelectedLanguage);
    const dispatch = useAppDispatch();

    const handleClose = useCallback(() => {
      dispatch(closeModal(ModalName.LanguageSelection));
    }, [dispatch]);

    const handleSelect = useCallback(
      (code: LanguageCode) => {
        dispatch(setLanguage(code));
        i18n.changeLanguage(code);
        dispatch(closeModal(ModalName.LanguageSelection));
      },
      [dispatch],
    );

    return (
      <CustomModal
        visible={visible}
        onClose={handleClose}
        accessibilityLabel="Close language selection"
        panelWidth={360}
      >
        <LanguageSelectionForm
          selectedLanguage={selectedLanguage}
          onSelect={handleSelect}
        />
      </CustomModal>
    );
  },
);
