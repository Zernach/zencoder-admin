import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CurrencySelectionForm } from "../CurrencySelectionForm";
import { CURRENCY_OPTIONS } from "@/types/settings";

jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));

jest.mock("lucide-react-native", () => {
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

jest.mock("@/components/inputs", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return {
    CustomTextInput: React.forwardRef(
      (
        { value, onChangeText, placeholder, accessibilityLabel, ...rest }: {
          value?: string;
          onChangeText?: (v: string) => void;
          placeholder?: string;
          accessibilityLabel?: string;
        },
        _ref: unknown,
      ) => (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          accessibilityLabel={accessibilityLabel}
        />
      ),
    ),
  };
});

describe("CurrencySelectionForm", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("renders all 20 currency options", () => {
    const { getByLabelText } = render(
      <CurrencySelectionForm selectedCurrency="EUR" onSelect={mockOnSelect} />,
    );

    for (const option of CURRENCY_OPTIONS) {
      expect(getByLabelText(`${option.code} — ${option.name}`)).toBeTruthy();
    }
  });

  it("shows check mark for selected currency", () => {
    const { getAllByText } = render(
      <CurrencySelectionForm selectedCurrency="USD" onSelect={mockOnSelect} />,
    );

    expect(getAllByText("Check")).toHaveLength(1);
  });

  it("fires selection callback when a currency is pressed", () => {
    const { getByLabelText } = render(
      <CurrencySelectionForm selectedCurrency="EUR" onSelect={mockOnSelect} />,
    );

    fireEvent.press(getByLabelText("JPY — Japanese Yen"));

    expect(mockOnSelect).toHaveBeenCalledWith("JPY");
  });

  it("marks selected currency as selected in accessibility state", () => {
    const { getByLabelText } = render(
      <CurrencySelectionForm selectedCurrency="GBP" onSelect={mockOnSelect} />,
    );

    const gbp = getByLabelText("GBP — British Pound");
    expect(gbp.props.accessibilityState).toEqual({ selected: true });

    const eur = getByLabelText("EUR — Euro");
    expect(eur.props.accessibilityState).toEqual({ selected: false });
  });

  it("filters currencies by code", () => {
    const { getByLabelText, queryByLabelText } = render(
      <CurrencySelectionForm selectedCurrency="EUR" onSelect={mockOnSelect} />,
    );

    const searchInput = getByLabelText("settings.searchCurrency");
    fireEvent.changeText(searchInput, "JPY");

    expect(queryByLabelText("JPY — Japanese Yen")).toBeTruthy();
    expect(queryByLabelText("USD — US Dollar")).toBeNull();
  });

  it("filters currencies by name", () => {
    const { getByLabelText, queryByLabelText } = render(
      <CurrencySelectionForm selectedCurrency="EUR" onSelect={mockOnSelect} />,
    );

    const searchInput = getByLabelText("settings.searchCurrency");
    fireEvent.changeText(searchInput, "yen");

    expect(queryByLabelText("JPY — Japanese Yen")).toBeTruthy();
    expect(queryByLabelText("USD — US Dollar")).toBeNull();
  });
});
