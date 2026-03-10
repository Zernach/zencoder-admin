import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { modalSlice, ModalName, openModal } from "@/store/slices/modalSlice";
import { settingsSlice } from "@/store/slices/settingsSlice";
import { LanguageSelectionModal } from "../LanguageSelectionModal";
import { LANGUAGE_OPTIONS } from "@/types/settings";

jest.mock("lucide-react-native", () => {
  const React = require("react");
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

jest.mock("@/i18n/config", () => ({
  __esModule: true,
  default: { changeLanguage: jest.fn() },
}));

function createStore() {
  return configureStore({
    reducer: {
      modal: modalSlice.reducer,
      settings: settingsSlice.reducer,
    },
  });
}

describe("LanguageSelectionModal", () => {
  it("does not render content when modal is not visible", () => {
    const store = createStore();
    const { queryByText } = render(
      <Provider store={store}>
        <LanguageSelectionModal />
      </Provider>,
    );

    expect(queryByText("Language")).toBeNull();
  });

  it("renders all language options when modal is visible", () => {
    const store = createStore();
    store.dispatch(openModal(ModalName.LanguageSelection));

    const { getByLabelText } = render(
      <Provider store={store}>
        <LanguageSelectionModal />
      </Provider>,
    );

    for (const option of LANGUAGE_OPTIONS) {
      expect(getByLabelText(`${option.label} (${option.nativeLabel})`)).toBeTruthy();
    }
  });

  it("highlights the currently selected language", () => {
    const store = createStore();
    store.dispatch(openModal(ModalName.LanguageSelection));

    const { getAllByText } = render(
      <Provider store={store}>
        <LanguageSelectionModal />
      </Provider>,
    );

    // Default language is "en", so one Check should show
    expect(getAllByText("Check")).toHaveLength(1);
  });

  it("dispatches setLanguage and closes modal on selection", () => {
    const store = createStore();
    store.dispatch(openModal(ModalName.LanguageSelection));

    const { getByLabelText } = render(
      <Provider store={store}>
        <LanguageSelectionModal />
      </Provider>,
    );

    fireEvent.press(getByLabelText("German (Deutsch)"));

    expect(store.getState().settings.selectedLanguage).toBe("de");
    expect(store.getState().modal.visible[ModalName.LanguageSelection]).toBe(false);
  });

  it("closes modal when overlay is pressed", () => {
    const store = createStore();
    store.dispatch(openModal(ModalName.LanguageSelection));

    const { getByLabelText } = render(
      <Provider store={store}>
        <LanguageSelectionModal />
      </Provider>,
    );

    fireEvent.press(getByLabelText("Close language selection"));

    expect(store.getState().modal.visible[ModalName.LanguageSelection]).toBe(false);
  });
});
