import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { modalSlice, ModalName } from "@/store/slices/modalSlice";
import { settingsSlice, setCurrency, setLanguage } from "@/store/slices/settingsSlice";
import { spacing } from "@/theme/tokens";

function renderWithStore(ui: React.ReactElement, preloadedState?: {
  settings?: Partial<{ selectedLanguage: string; selectedCurrency: string; deviceDefaultLanguage: string }>;
}) {
  const store = configureStore({
    reducer: { modal: modalSlice.reducer, settings: settingsSlice.reducer },
    preloadedState: preloadedState
      ? {
          settings: {
            deviceDefaultLanguage: "en",
            selectedLanguage: "en",
            selectedCurrency: "EUR",
            ...preloadedState.settings,
          } as ReturnType<typeof settingsSlice.reducer>,
        }
      : undefined,
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

describe("Settings Preferences Integration", () => {
  describe("initial render shows correct current values", () => {
    it("shows Language row with English as default", () => {
      const { getByText } = renderWithStore(<SettingsScreen />);
      expect(getByText("settings.language")).toBeTruthy();
      expect(getByText("English")).toBeTruthy();
    });

    it("shows Currency row with EUR as default", () => {
      const { getByText } = renderWithStore(<SettingsScreen />);
      expect(getByText("settings.currency")).toBeTruthy();
      expect(getByText("€ EUR")).toBeTruthy();
    });
  });

  describe("Language row modal flow", () => {
    it("tapping Language row opens LanguageSelection modal", () => {
      const { getByLabelText, store } = renderWithStore(<SettingsScreen />);

      expect(store.getState().modal.visible[ModalName.LanguageSelection]).toBeFalsy();
      fireEvent.press(getByLabelText("settings.selectLanguage"));
      expect(store.getState().modal.visible[ModalName.LanguageSelection]).toBe(true);
    });

    it("Language row updates when language changes in store", () => {
      const { getByText, queryByText, store } = renderWithStore(<SettingsScreen />);

      expect(getByText("English")).toBeTruthy();

      // Simulate language change via Redux
      const { act } = require("@testing-library/react-native");
      act(() => {
        store.dispatch(setLanguage("fr"));
      });

      expect(getByText("Français")).toBeTruthy();
      expect(queryByText("English")).toBeNull();
    });

    it("can switch to all supported languages and display correct native label", () => {
      const { getByText, store } = renderWithStore(<SettingsScreen />);
      const { act } = require("@testing-library/react-native");

      const expectedLabels: Record<string, string> = {
        en: "English",
        ru: "Русский",
        de: "Deutsch",
        fr: "Français",
        it: "Italiano",
      };

      for (const [code, label] of Object.entries(expectedLabels)) {
        act(() => {
          store.dispatch(setLanguage(code as "en" | "ru" | "de" | "fr" | "it"));
        });
        expect(getByText(label)).toBeTruthy();
      }
    });
  });

  describe("Currency row modal flow", () => {
    it("tapping Currency row opens CurrencySelection modal", () => {
      const { getByLabelText, store } = renderWithStore(<SettingsScreen />);

      expect(store.getState().modal.visible[ModalName.CurrencySelection]).toBeFalsy();
      fireEvent.press(getByLabelText("settings.selectCurrency"));
      expect(store.getState().modal.visible[ModalName.CurrencySelection]).toBe(true);
    });

    it("Currency row updates when currency changes in store", () => {
      const { getByText, queryByText, store } = renderWithStore(<SettingsScreen />);

      expect(getByText("€ EUR")).toBeTruthy();

      const { act } = require("@testing-library/react-native");
      act(() => {
        store.dispatch(setCurrency("USD"));
      });

      expect(getByText("$ USD")).toBeTruthy();
      expect(queryByText("€ EUR")).toBeNull();
    });

    it("can switch to various currencies and display correct symbol + code", () => {
      const { getByText, store } = renderWithStore(<SettingsScreen />);
      const { act } = require("@testing-library/react-native");

      const checks: [string, string][] = [
        ["GBP", "£ GBP"],
        ["JPY", "¥ JPY"],
        ["KRW", "₩ KRW"],
        ["BRL", "R$ BRL"],
        ["CHF", "CHF CHF"],
      ];

      for (const [code, label] of checks) {
        act(() => {
          store.dispatch(setCurrency(code as "GBP" | "JPY" | "KRW" | "BRL" | "CHF"));
        });
        expect(getByText(label)).toBeTruthy();
      }
    });
  });

  describe("existing settings still work after language/currency additions", () => {
    it("theme toggle still renders", () => {
      const { getByText } = renderWithStore(<SettingsScreen />);
      expect(getByText(/settings\.darkModeLabel/)).toBeTruthy();
    });

    it("sign-out notice flow still works", () => {
      const { getByText, queryByText } = renderWithStore(<SettingsScreen />);

      expect(queryByText("settings.signOut.demoMessage")).toBeNull();
      fireEvent.press(getByText("settings.signOutLabel"));
      expect(getByText("settings.signOut.demoMessage")).toBeTruthy();

      fireEvent.press(getByText("settings.signOut.dismiss"));
      expect(queryByText("settings.signOut.demoMessage")).toBeNull();
    });

    it("email and slack toggles still render", () => {
      const { getByText } = renderWithStore(<SettingsScreen />);
      expect(getByText("settings.emailNotifications")).toBeTruthy();
      expect(getByText("settings.slackIntegration")).toBeTruthy();
    });

    it("organization section still renders", () => {
      const { getByText } = renderWithStore(<SettingsScreen />);
      expect(getByText("settings.organization")).toBeTruthy();
      expect(getByText("org_zencoder_001")).toBeTruthy();
      expect(getByText("settings.enterprise")).toBeTruthy();
      expect(getByText("73 / 100")).toBeTruthy();
    });

    it("Clear Cache button still renders", () => {
      const { getByText } = renderWithStore(<SettingsScreen />);
      expect(getByText("common.clearCache")).toBeTruthy();
    });
  });

  describe("preloaded state", () => {
    it("renders with pre-selected language", () => {
      const { getByText } = renderWithStore(<SettingsScreen />, {
        settings: { selectedLanguage: "de" },
      });
      expect(getByText("Deutsch")).toBeTruthy();
    });

    it("renders with pre-selected currency", () => {
      const { getByText } = renderWithStore(<SettingsScreen />, {
        settings: { selectedCurrency: "JPY" },
      });
      expect(getByText("¥ JPY")).toBeTruthy();
    });
  });
});
