import { configureStore } from "@reduxjs/toolkit";
import { filtersSlice } from "./slices/filtersSlice";
import { sidebarSlice } from "./slices/sidebarSlice";
import { navigationHistorySlice } from "./slices/navigationHistorySlice";
import { modalSlice } from "./slices/modalSlice";
import { settingsSlice } from "./slices/settingsSlice";
import { chatHistorySlice } from "./slices/chatHistorySlice";
import { analyticsApi } from "./api/analyticsApi";

export const store = configureStore({
  reducer: {
    filters: filtersSlice.reducer,
    sidebar: sidebarSlice.reducer,
    navigationHistory: navigationHistorySlice.reducer,
    modal: modalSlice.reducer,
    settings: settingsSlice.reducer,
    chatHistory: chatHistorySlice.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(analyticsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
