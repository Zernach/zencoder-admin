import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { modalSlice } from "@/store/slices/modalSlice";

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({
    reducer: { modal: modalSlice.reducer },
  });
  return render(<Provider store={store}>{ui}</Provider>);
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
  return {
    ScreenWrapper: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    sectionStyles: StyleSheet.create({ section: { gap: 12 }, chartRow: { flexDirection: "row", gap: 16 } }),
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
  const { Pressable } = require("react-native");
  return {
    CustomButton: ({ children, onPress, ...rest }: { children: React.ReactNode; onPress?: () => void; accessibilityRole?: string; accessibilityLabel?: string }) => (
      <Pressable onPress={onPress} accessibilityRole={rest.accessibilityRole} accessibilityLabel={rest.accessibilityLabel}>
        {children}
      </Pressable>
    ),
  };
});

const SettingsScreen = require("../settings").default;

describe("SettingsScreen", () => {
  it("renders screen sections", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("Preferences")).toBeTruthy();
    expect(getByText("Organization")).toBeTruthy();
    expect(getByText("Danger Zone")).toBeTruthy();
  });

  it("renders profile hero card", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("Admin User")).toBeTruthy();
    expect(getByText("admin@zencoder.io")).toBeTruthy();
    expect(getByText("Owner")).toBeTruthy();
  });

  it("renders Sign Out button", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("Sign Out")).toBeTruthy();
  });

  it("shows demo notice when Sign Out is pressed", () => {
    const { getByText, queryByText } = renderWithStore(<SettingsScreen />);

    expect(queryByText("This is a dashboard demo, so you are unable to sign out.")).toBeNull();

    fireEvent.press(getByText("Sign Out"));

    expect(getByText("This is a dashboard demo, so you are unable to sign out.")).toBeTruthy();
    expect(getByText("Demo Mode")).toBeTruthy();
  });

  it("dismisses demo notice when Dismiss is pressed", () => {
    const { getByText, queryByText } = renderWithStore(<SettingsScreen />);

    fireEvent.press(getByText("Sign Out"));
    expect(getByText("This is a dashboard demo, so you are unable to sign out.")).toBeTruthy();

    fireEvent.press(getByText("Dismiss"));
    expect(queryByText("This is a dashboard demo, so you are unable to sign out.")).toBeNull();
  });

  it("renders theme toggle and other setting toggles", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText(/Dark Mode/)).toBeTruthy();
    expect(getByText("Email Notifications")).toBeTruthy();
    expect(getByText("Slack Integration")).toBeTruthy();
    expect(getByText("Auto-refresh")).toBeTruthy();
  });

  it("renders Create Team button", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("+ Create Team")).toBeTruthy();
  });

  it("renders Clear Cache button", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("Clear Cache")).toBeTruthy();
  });

  it("renders org info rows with seat progress", () => {
    const { getByText } = renderWithStore(<SettingsScreen />);

    expect(getByText("org_zencoder_001")).toBeTruthy();
    expect(getByText("ENTERPRISE")).toBeTruthy();
    expect(getByText("73 / 100")).toBeTruthy();
    expect(getByText("73% of seats used")).toBeTruthy();
  });
});
