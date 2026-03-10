import React, { useCallback } from "react";
import { CustomModal } from "@/components/modals";
import {
  useAppSelector,
  useAppDispatch,
  selectModalVisible,
  closeModal,
  ModalName,
  selectSelectedCurrency,
  setCurrency,
} from "@/store";
import { CurrencySelectionForm } from "./CurrencySelectionForm";
import type { CurrencyCode } from "@/types/settings";

export const CurrencySelectionModal = React.memo(
  function CurrencySelectionModal() {
    const visible = useAppSelector(
      selectModalVisible(ModalName.CurrencySelection),
    );
    const selectedCurrency = useAppSelector(selectSelectedCurrency);
    const dispatch = useAppDispatch();

    const handleClose = useCallback(() => {
      dispatch(closeModal(ModalName.CurrencySelection));
    }, [dispatch]);

    const handleSelect = useCallback(
      (code: CurrencyCode) => {
        dispatch(setCurrency(code));
        dispatch(closeModal(ModalName.CurrencySelection));
      },
      [dispatch],
    );

    return (
      <CustomModal
        visible={visible}
        onClose={handleClose}
        accessibilityLabel="Close currency selection"
        panelWidth={440}
      >
        <CurrencySelectionForm
          selectedCurrency={selectedCurrency}
          onSelect={handleSelect}
        />
      </CustomModal>
    );
  },
);
