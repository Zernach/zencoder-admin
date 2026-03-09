import { configureStore } from "@reduxjs/toolkit";
import { filtersSlice } from "./slices/filtersSlice";
import { sidebarSlice } from "./slices/sidebarSlice";
import { navigationHistorySlice } from "./slices/navigationHistorySlice";
import { modalSlice } from "./slices/modalSlice";
import { analyticsApi } from "./api/analyticsApi";

export const store = configureStore({
  reducer: {
    filters: filtersSlice.reducer,
    sidebar: sidebarSlice.reducer,
    navigationHistory: navigationHistorySlice.reducer,
    modal: modalSlice.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(analyticsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
