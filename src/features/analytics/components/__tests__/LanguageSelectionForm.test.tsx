import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { LanguageSelectionForm } from "../LanguageSelectionForm";
import { LANGUAGE_OPTIONS } from "@/types/settings";

jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Check: () => <Text>Check</Text>,
  };
});

jest.mock("@/components/buttons", () => {
  const React = require("react");
  const { Pressable } = require("react-native");
  return {
    CustomButton: ({
      children,
      onPress,
      ...rest
    }: {
      children?: React.ReactNode;
      onPress?: () => void;
      accessibilityRole?: string;
      accessibilityLabel?: string;
      accessibilityState?: Record<string, unknown>;
    }) => (
      <Pressable
        onPress={onPress}
        accessibilityRole={rest.accessibilityRole}
        accessibilityLabel={rest.accessibilityLabel}
        accessibilityState={rest.accessibilityState}
      >
        {children}
      </Pressable>
    ),
  };
});

describe("LanguageSelectionForm", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("renders all language options with native labels", () => {
    const { getByLabelText } = render(
      <LanguageSelectionForm selectedLanguage="en" onSelect={mockOnSelect} />,
    );

    for (const option of LANGUAGE_OPTIONS) {
      expect(getByLabelText(`${option.label} (${option.nativeLabel})`)).toBeTruthy();
    }
  });

  it("shows check mark for selected language", () => {
    const { getAllByText } = render(
      <LanguageSelectionForm selectedLanguage="de" onSelect={mockOnSelect} />,
    );

    // Only 1 Check icon should render (for the selected language)
    expect(getAllByText("Check")).toHaveLength(1);
  });

  it("fires selection callback when a language is pressed", () => {
    const { getByLabelText } = render(
      <LanguageSelectionForm selectedLanguage="en" onSelect={mockOnSelect} />,
    );

    fireEvent.press(getByLabelText("German (Deutsch)"));

    expect(mockOnSelect).toHaveBeenCalledWith("de");
  });

  it("marks selected language radio as selected in accessibility state", () => {
    const { getByLabelText } = render(
      <LanguageSelectionForm selectedLanguage="fr" onSelect={mockOnSelect} />,
    );

    const frenchOption = getByLabelText("French (Français)");
    expect(frenchOption.props.accessibilityState).toEqual({ selected: true });

    const englishOption = getByLabelText("English (English)");
    expect(englishOption.props.accessibilityState).toEqual({ selected: false });
  });
});
