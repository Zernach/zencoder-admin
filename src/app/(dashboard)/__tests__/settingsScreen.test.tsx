import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { modalSlice, ModalName } from "@/store/slices/modalSlice";
import { settingsSlice } from "@/store/slices/settingsSlice";
import { spacing } from "@/theme/tokens";

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({
    reducer: { modal: modalSlice.reducer, settings: settingsSlice.reducer },
  });
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
}

jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const stub = (name: string) => () => <Text>{name}</Text>;
  return {
    X: stub("X"),
    Moon: stub("Moon"),
    Mail: stub("Mail"),
    MessageSquare: stub("MessageSquare"),
    RefreshCw: stub("RefreshCw"),
    Building2: stub("Building2"),
    ShieldAlert: stub("ShieldAlert"),
    SlidersHorizontal: stub("SlidersHorizontal"),
    LogOut: stub("LogOut"),
    Trash2: stub("Trash2"),
    AlertTriangle: stub("AlertTriangle"),
    User: stub("User"),
    Globe: stub("Globe"),
    DollarSign: stub("DollarSign"),
    ChevronRight: stub("ChevronRight"),
    Check: stub("Check"),
  };
});

jest.mock("@/features/analytics/hooks/useCreateTeam", () => ({
  useCreateTeam: () => ({
    create: jest.fn().mockResolvedValue({ team: { id: "t_1" } }),
    loading: false,
    error: undefined,
    lastResult: undefined,
  }),
}));

jest.mock("@/features/analytics/components/CreateTeamForm", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    CreateTeamForm: () => <Text>CreateTeamForm</Text>,
  };
});

jest.mock("@/components/screen", () => {
  const React = require("react");
  const { View } = require("react-native");
  const { StyleSheet } = require("react-native");
  const { spacing: tokenSpacing } = require("@/theme/tokens");
  return {
    ScreenWrapper: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    sectionStyles: StyleSheet.create({
      section: { gap: tokenSpacing[12] },
      chartRow: { flexDirection: "row", gap: tokenSpacing[16] },
    }),
  };
});

jest.mock("@/components/dashboard", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    SectionHeader: ({ title, action }: { title: string; action?: React.ReactNode }) => (
      <View>
        <Text>{title}</Text>
        {action}
      </View>
    ),
  };
});

jest.mock("@/components/buttons", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    CustomButton: ({ children, label, onPress, ...rest }: { children?: React.ReactNode; label?: string; onPress?: () => void; accessibilityRole?: string; accessibilityLabel?: string }) => (
      <Pressable onPress={onPress} accessibilityRole={rest.accessibilityRole} accessibilityLabel={rest.accessibilityLabel}>
        {label ? <Text>{label}</Text> : children}
      </Pressable>
    ),
  };
});

jest.mock("@/components/inputs", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return {
    CustomSwitch: ({ value, onValueChange, accessibilityLabel }: { value: boolean; onValueChange: () => void; accessibilityLabel?: string }) => {
      const { Pressable, Text } = require("react-native");
      return (
        <Pressable onPress={onValueChange} accessibilityLabel={accessibilityLabel}>
          <Text>{value ? "ON" : "OFF"}</Text>
        </Pressable>
      );
    },
    CustomTextInput: React.forwardRef(
      ({ value, onChangeText, placeholder, accessibilityLabel }: { value?: string; onChangeText?: (v: string) => void; placeholder?: string; accessibilityLabel?: string }, _ref: unknown) => (
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} accessibilityLabel={accessibilityLabel} />
      ),
    ),
  };
});

jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));

const SettingsScreen = require("../settings").default;

describe("SettingsScreen", () => {
  it("renders screen sections", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("settings.preferences")).toBeTruthy();
    expect(getByText("settings.internationalization")).toBeTruthy();
    expect(getByText("settings.organization")).toBeTruthy();
    expect(getByText("settings.dangerZone")).toBeTruthy();
  });

  it("renders profile hero card", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("settings.adminUser")).toBeTruthy();
    expect(getByText("settings.adminEmail")).toBeTruthy();
    expect(getByText("settings.ownerRole")).toBeTruthy();
  });

  it("renders Sign Out button", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("settings.signOutLabel")).toBeTruthy();
  });

  it("shows demo notice when Sign Out is pressed", () => {
    const { getByText, queryByText } = renderWithStore(<SettingsScreen />);

    expect(queryByText("settings.signOut.demoMessage")).toBeNull();

    fireEvent.press(getByText("settings.signOutLabel"));

    expect(getByText("settings.signOut.demoMessage")).toBeTruthy();
    expect(getByText("settings.signOut.demoMode")).toBeTruthy();
  });

  it("dismisses demo notice when Dismiss is pressed", () => {
    const { getByText, queryByText } = renderWithStore(<SettingsScreen />);

    fireEvent.press(getByText("settings.signOutLabel"));
    expect(getByText("settings.signOut.demoMessage")).toBeTruthy();

    fireEvent.press(getByText("settings.signOut.dismiss"));
    expect(queryByText("settings.signOut.demoMessage")).toBeNull();
  });

  it("renders theme toggle and other setting toggles", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText(/settings\.darkModeLabel/)).toBeTruthy();
    expect(getByText("settings.emailNotifications")).toBeTruthy();
    expect(getByText("settings.slackIntegration")).toBeTruthy();
  });

  it("does not render Create Team button in settings", () => {
    const { queryByText } = renderWithStore(<SettingsScreen />);

    expect(queryByText("governance.createTeam")).toBeNull();
  });

  it("renders Clear Cache button", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("common.clearCache")).toBeTruthy();
  });

  it("renders org info rows with seat progress", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("org_zencoder_001")).toBeTruthy();
    expect(getByText("settings.enterprise")).toBeTruthy();
    expect(getByText("73 / 100")).toBeTruthy();
    expect(getByText(/settings\.seatsUsed/)).toBeTruthy();
  });

  it("renders Language row with current language name", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("settings.language")).toBeTruthy();
    expect(getByText("English")).toBeTruthy();
  });

  it("dispatches openModal for LanguageSelection when Language row is pressed", () => {
    const { getByLabelText, store } = renderWithStore(<SettingsScreen />);

    fireEvent.press(getByLabelText("settings.selectLanguage"));

    expect(store.getState().modal.visible[ModalName.LanguageSelection]).toBe(true);
  });

  it("renders Currency row with current currency info", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("settings.currency")).toBeTruthy();
    // Default currency is EUR
    expect(getByText("€ EUR")).toBeTruthy();
  });

  it("dispatches openModal for CurrencySelection when Currency row is pressed", () => {
    const { getByLabelText, store } = renderWithStore(<SettingsScreen />);

    fireEvent.press(getByLabelText("settings.selectCurrency"));

    expect(store.getState().modal.visible[ModalName.CurrencySelection]).toBe(true);
  });
});
