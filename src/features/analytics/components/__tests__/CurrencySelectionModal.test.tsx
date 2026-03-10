import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { modalSlice, ModalName, openModal } from "@/store/slices/modalSlice";
import { settingsSlice } from "@/store/slices/settingsSlice";
import { CurrencySelectionModal } from "../CurrencySelectionModal";
import { CURRENCY_OPTIONS } from "@/types/settings";

jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return {
    X: () => <Text>X</Text>,
    Check: () => <Text>Check</Text>,
  };
});

jest.mock("@/components/buttons", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    CustomButton: ({
      children,
      label,
      onPress,
      ...rest
    }: {
      children?: React.ReactNode;
      label?: string;
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
        {label ? <Text>{label}</Text> : children}
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

function createStore() {
  return configureStore({
    reducer: {
      modal: modalSlice.reducer,
      settings: settingsSlice.reducer,
    },
  });
}

describe("CurrencySelectionModal", () => {
  it("does not render content when modal is not visible", () => {
    const store = createStore();
    const { queryByText } = render(
      <Provider store={store}>
        <CurrencySelectionModal />
      </Provider>,
    );

    expect(queryByText("USD")).toBeNull();
  });

  it("renders all 20 currency options when modal is visible", () => {
    const store = createStore();
    store.dispatch(openModal(ModalName.CurrencySelection));

    const { getByLabelText } = render(
      <Provider store={store}>
        <CurrencySelectionModal />
      </Provider>,
    );

    for (const option of CURRENCY_OPTIONS) {
      expect(getByLabelText(`${option.code} — ${option.name}`)).toBeTruthy();
    }
  });

  it("highlights the currently selected currency", () => {
    const store = createStore();
    store.dispatch(openModal(ModalName.CurrencySelection));

    const { getAllByText } = render(
      <Provider store={store}>
        <CurrencySelectionModal />
      </Provider>,
    );

    // Default currency is EUR, so one Check should show
    expect(getAllByText("Check")).toHaveLength(1);
  });

  it("dispatches setCurrency and closes modal on selection", () => {
    const store = createStore();
    store.dispatch(openModal(ModalName.CurrencySelection));

    const { getByLabelText } = render(
      <Provider store={store}>
        <CurrencySelectionModal />
      </Provider>,
    );

    fireEvent.press(getByLabelText("JPY — Japanese Yen"));

    expect(store.getState().settings.selectedCurrency).toBe("JPY");
    expect(store.getState().modal.visible[ModalName.CurrencySelection]).toBe(false);
  });

  it("closes modal when overlay is pressed", () => {
    const store = createStore();
    store.dispatch(openModal(ModalName.CurrencySelection));

    const { getByLabelText } = render(
      <Provider store={store}>
        <CurrencySelectionModal />
      </Provider>,
    );

    fireEvent.press(getByLabelText("Close currency selection"));

    expect(store.getState().modal.visible[ModalName.CurrencySelection]).toBe(false);
  });
});
