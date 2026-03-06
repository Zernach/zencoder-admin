import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface LoadingState {
  [key: string]: boolean;
}

const initialState: LoadingState = {};

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading(
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) {
      state[action.payload.key] = action.payload.loading;
    },
  },
});

export const { setLoading } = loadingSlice.actions;

export const selectIsLoading =
  (key: string) =>
  (state: { loading: LoadingState }): boolean =>
    state.loading[key] ?? false;
