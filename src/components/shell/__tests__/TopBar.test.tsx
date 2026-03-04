import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { filtersSlice } from "@/store/slices/filtersSlice";
import { sidebarSlice } from "@/store/slices/sidebarSlice";
import { TopBar } from "../TopBar";

let mockBreakpoint: "mobile" | "tablet" | "desktop" = "desktop";

jest.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => mockBreakpoint,
}));

jest.mock("lucide-react-native", () => ({
  Menu: () => null,
  Search: () => null,
  Filter: () => null,
  Clock: () => null,
  X: () => null,
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useThemeMode: () => ({
    mode: "dark",
    setMode: jest.fn(),
    toggleMode: jest.fn(),
  }),
}));

function renderTopBar() {
  const store = configureStore({
    reducer: {
      filters: filtersSlice.reducer,
      sidebar: sidebarSlice.reducer,
    },
  });

  const result = render(
    <Provider store={store}>
      <TopBar />
    </Provider>
  );

  return { ...result, store };
}

describe("TopBar", () => {
  beforeEach(() => {
    mockBreakpoint = "desktop";
  });

  it("opens time range overlay when clock button is pressed", () => {
    const { getByLabelText, getByText } = renderTopBar();

    fireEvent.press(getByLabelText("Open time range selector"));

    expect(getByText("24h")).toBeTruthy();
    expect(getByText("7d")).toBeTruthy();
    expect(getByText("30d")).toBeTruthy();
    expect(getByText("90d")).toBeTruthy();
  });

  it("updates preset when selecting a time range in overlay", () => {
    const { getByLabelText, getByText, store } = renderTopBar();

    fireEvent.press(getByLabelText("Open time range selector"));
    fireEvent.press(getByLabelText("Set time range to Last 7 days"));

    expect(store.getState().filters.preset).toBe("7d");
    expect(getByText("Last 7 days")).toBeTruthy();
  });

  it("shows abbreviated preset label on mobile", () => {
    mockBreakpoint = "mobile";
    const { getByText } = renderTopBar();

    expect(getByText("30d")).toBeTruthy();
  });
});
