import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { filtersSlice } from "@/store/slices/filtersSlice";
import { sidebarSlice } from "@/store/slices/sidebarSlice";
import { navigationHistorySlice } from "@/store/slices/navigationHistorySlice";
import { TopBar } from "../TopBar";

let mockBreakpoint: "mobile" | "tablet" | "desktop" = "desktop";

jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));

jest.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => mockBreakpoint,
}));

jest.mock("lucide-react-native", () => ({
  Menu: () => null,
  Search: () => null,
  Filter: () => null,
  Clock: () => null,
  X: () => null,
  CircleUserRound: () => null,
  User: () => null,
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

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function renderTopBar() {
  const store = configureStore({
    reducer: {
      filters: filtersSlice.reducer,
      sidebar: sidebarSlice.reducer,
      navigationHistory: navigationHistorySlice.reducer,
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

    fireEvent.press(getByLabelText("timeRange.openSelector"));

    expect(getByText("timeRange.short24h")).toBeTruthy();
    expect(getByText("timeRange.short7d")).toBeTruthy();
    expect(getByText("timeRange.short30d")).toBeTruthy();
    expect(getByText("timeRange.short90d")).toBeTruthy();
  });

  it("updates preset when selecting a time range in overlay", () => {
    const { getByLabelText, getByText, store } = renderTopBar();

    fireEvent.press(getByLabelText("timeRange.openSelector"));
    fireEvent.press(getByLabelText("timeRange.last7Days"));

    expect(store.getState().filters.preset).toBe("7d");
    expect(getByText("timeRange.last7Days")).toBeTruthy();
  });

  it("shows abbreviated preset label on mobile", () => {
    mockBreakpoint = "mobile";
    const { getByText } = renderTopBar();

    expect(getByText("timeRange.short30d")).toBeTruthy();
  });

  it("calls autocomplete setQuery when typing", () => {
    const { getByLabelText } = renderTopBar();
    const input = getByLabelText("search.searchLabel");

    fireEvent.changeText(input, "test query");

    expect(mockSetQuery).toHaveBeenCalledWith("test query");
  });

  it("calls autocomplete clear when clearing search", () => {
    const { getByLabelText } = renderTopBar();
    const input = getByLabelText("search.searchLabel");

    fireEvent.changeText(input, "something");
    fireEvent.press(getByLabelText("search.clearSearch"));

    expect(mockClear).toHaveBeenCalled();
  });

  it("navigates to settings when profile button is pressed", () => {
    const { getByLabelText } = renderTopBar();

    fireEvent.press(getByLabelText("Open settings"));

    expect(mockPush).toHaveBeenCalledWith("/settings");
  });

  it("does not dispatch setSearchQuery to Redux while typing", () => {
    const { getByLabelText, store } = renderTopBar();
    const input = getByLabelText("search.searchLabel");

    fireEvent.changeText(input, "test");

    expect(store.getState().filters.searchQuery).toBe("");
  });
});
