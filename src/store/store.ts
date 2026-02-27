import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { filtersSlice } from "./slices/filtersSlice";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    filters: filtersSlice.reducer,
  },
  middleware: (getDefault) =>
    getDefault({ thunk: false }).concat(sagaMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
