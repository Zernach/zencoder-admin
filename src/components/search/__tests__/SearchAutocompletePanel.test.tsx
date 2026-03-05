import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SearchAutocompletePanel } from "../SearchAutocompletePanel";
import type { SearchSuggestionsResponse } from "@/features/analytics/types";

jest.mock("@/providers/ThemeProvider", () => ({
  useThemeMode: () => ({
    mode: "dark",
    setMode: jest.fn(),
    toggleMode: jest.fn(),
  }),
}));

const mockSuggestions: SearchSuggestionsResponse = {
  groups: [
    {
      entityType: "agent",
      label: "Agents",
      suggestions: [
        { id: "a1", entityType: "agent", title: "Code Review Bot", subtitle: "Project Alpha" },
        { id: "a2", entityType: "agent", title: "Deploy Agent", subtitle: "Project Beta" },
      ],
    },
    {
      entityType: "project",
      label: "Projects",
      suggestions: [
        { id: "p1", entityType: "project", title: "Project Alpha", subtitle: "Team Engineering" },
      ],
    },
  ],
  totalCount: 3,
};

describe("SearchAutocompletePanel", () => {
  const onSelect = jest.fn();
  const onDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when not visible", () => {
    const { toJSON } = render(
      <SearchAutocompletePanel
        suggestions={mockSuggestions}
        loading={false}
        error={undefined}
        onSelect={onSelect}
        onDismiss={onDismiss}
        visible={false}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it("renders group labels when visible with suggestions", () => {
    const { getByText } = render(
      <SearchAutocompletePanel
        suggestions={mockSuggestions}
        loading={false}
        error={undefined}
        onSelect={onSelect}
        onDismiss={onDismiss}
        visible={true}
      />
    );
    expect(getByText("Agents")).toBeTruthy();
    expect(getByText("Projects")).toBeTruthy();
  });

  it("renders suggestion titles and subtitles", () => {
    const { getByText } = render(
      <SearchAutocompletePanel
        suggestions={mockSuggestions}
        loading={false}
        error={undefined}
        onSelect={onSelect}
        onDismiss={onDismiss}
        visible={true}
      />
    );
    expect(getByText("Code Review Bot")).toBeTruthy();
    expect(getByText("Deploy Agent")).toBeTruthy();
    expect(getByText("Team Engineering")).toBeTruthy();
  });

  it("shows loading state", () => {
    const { getByText } = render(
      <SearchAutocompletePanel
        suggestions={null}
        loading={true}
        error={undefined}
        onSelect={onSelect}
        onDismiss={onDismiss}
        visible={true}
      />
    );
    expect(getByText("Searching...")).toBeTruthy();
  });

  it("shows empty state", () => {
    const { getByText } = render(
      <SearchAutocompletePanel
        suggestions={{ groups: [], totalCount: 0 }}
        loading={false}
        error={undefined}
        onSelect={onSelect}
        onDismiss={onDismiss}
        visible={true}
      />
    );
    expect(getByText("No results found")).toBeTruthy();
  });

  it("shows error state", () => {
    const { getByText } = render(
      <SearchAutocompletePanel
        suggestions={null}
        loading={false}
        error="Network error"
        onSelect={onSelect}
        onDismiss={onDismiss}
        visible={true}
      />
    );
    expect(getByText("Network error")).toBeTruthy();
  });

  it("calls onDismiss when backdrop is pressed", () => {
    const { getByLabelText } = render(
      <SearchAutocompletePanel
        suggestions={mockSuggestions}
        loading={false}
        error={undefined}
        onSelect={onSelect}
        onDismiss={onDismiss}
        visible={true}
      />
    );
    fireEvent.press(getByLabelText("Dismiss search suggestions"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onSelect when a suggestion is pressed", () => {
    const { getByLabelText } = render(
      <SearchAutocompletePanel
        suggestions={mockSuggestions}
        loading={false}
        error={undefined}
        onSelect={onSelect}
        onDismiss={onDismiss}
        visible={true}
      />
    );
    fireEvent.press(getByLabelText("Code Review Bot, Project Alpha"));
    expect(onSelect).toHaveBeenCalledWith(mockSuggestions.groups[0]!.suggestions[0]);
  });
});
