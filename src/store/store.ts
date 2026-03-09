import { configureStore } from "@reduxjs/toolkit";
import { filtersSlice } from "./slices/filtersSlice";
import { loadingSlice } from "./slices/loadingSlice";
import { sidebarSlice } from "./slices/sidebarSlice";
import { navigationHistorySlice } from "./slices/navigationHistorySlice";
import { analyticsApi } from "./api/analyticsApi";

export const store = configureStore({
  reducer: {
    filters: filtersSlice.reducer,
    loading: loadingSlice.reducer,
    sidebar: sidebarSlice.reducer,
    navigationHistory: navigationHistorySlice.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(analyticsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
