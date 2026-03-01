import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { filtersSlice } from "./slices/filtersSlice";
import { loadingSlice } from "./slices/loadingSlice";
import { sidebarSlice } from "./slices/sidebarSlice";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    filters: filtersSlice.reducer,
    loading: loadingSlice.reducer,
    sidebar: sidebarSlice.reducer,
  },
  middleware: (getDefault) =>
    getDefault({ thunk: false }).concat(sagaMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
