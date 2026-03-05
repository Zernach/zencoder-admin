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

const mockSetQuery = jest.fn();
const mockClear = jest.fn();
const mockSelectSuggestion = jest.fn();

jest.mock("@/features/analytics/hooks/useSearchAutocomplete", () => ({
  useSearchAutocomplete: () => ({
    suggestions: null,
    loading: false,
    error: undefined,
    query: "",
    setQuery: mockSetQuery,
    clear: mockClear,
    selectSuggestion: mockSelectSuggestion,
    selectedSuggestion: null,
  }),
}));

jest.mock("@/components/search", () => ({
  SearchAutocompletePanel: () => null,
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
    jest.clearAllMocks();
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

  it("calls autocomplete setQuery when typing", () => {
    const { getByLabelText } = renderTopBar();
    const input = getByLabelText("Search");

    fireEvent.changeText(input, "test query");

    expect(mockSetQuery).toHaveBeenCalledWith("test query");
  });

  it("calls autocomplete clear when clearing search", () => {
    const { getByLabelText } = renderTopBar();
    const input = getByLabelText("Search");

    fireEvent.changeText(input, "something");
    fireEvent.press(getByLabelText("Clear search"));

    expect(mockClear).toHaveBeenCalled();
  });

  it("does not dispatch setSearchQuery to Redux while typing", () => {
    const { getByLabelText, store } = renderTopBar();
    const input = getByLabelText("Search");

    fireEvent.changeText(input, "test");

    expect(store.getState().filters.searchQuery).toBe("");
  });
});
