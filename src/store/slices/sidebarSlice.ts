import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SidebarState {
  expanded: boolean;
}

const initialState: SidebarState = {
  expanded: true,
};

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.expanded = !state.expanded;
    },
    setSidebarExpanded(state, action: PayloadAction<boolean>) {
      state.expanded = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarExpanded } = sidebarSlice.actions;

export const selectSidebarExpanded = (state: {
  sidebar: SidebarState;
}): boolean => state.sidebar.expanded;
