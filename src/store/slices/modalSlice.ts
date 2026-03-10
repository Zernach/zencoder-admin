import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export enum ModalName {
  CreateProject = "createProject",
  CreateComplianceRule = "createComplianceRule",
  CreateSeat = "createSeat",
  CreateTeam = "createTeam",
  CreateAgent = "createAgent",
  SignOutNotice = "signOutNotice",
}

export interface ModalState {
  visible: Record<ModalName, boolean>;
}

const initialState: ModalState = {
  visible: {
    [ModalName.CreateProject]: false,
    [ModalName.CreateComplianceRule]: false,
    [ModalName.CreateSeat]: false,
    [ModalName.CreateTeam]: false,
    [ModalName.CreateAgent]: false,
    [ModalName.SignOutNotice]: false,
  },
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<ModalName>) {
      state.visible[action.payload] = true;
    },
    closeModal(state, action: PayloadAction<ModalName>) {
      state.visible[action.payload] = false;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;

const modalSelectorCache = new Map<ModalName, (state: { modal: ModalState }) => boolean>();

export const selectModalVisible = (name: ModalName) => {
  let selector = modalSelectorCache.get(name);
  if (!selector) {
    selector = (state: { modal: ModalState }): boolean =>
      state.modal.visible[name];
    modalSelectorCache.set(name, selector);
  }
  return selector;
};
