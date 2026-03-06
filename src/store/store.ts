import { configureStore } from "@reduxjs/toolkit";
import { filtersSlice } from "./slices/filtersSlice";
import { loadingSlice } from "./slices/loadingSlice";
import { sidebarSlice } from "./slices/sidebarSlice";

export const store = configureStore({
  reducer: {
    filters: filtersSlice.reducer,
    loading: loadingSlice.reducer,
    sidebar: sidebarSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
