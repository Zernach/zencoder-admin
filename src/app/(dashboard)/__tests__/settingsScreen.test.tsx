import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    X: () => <Text>X</Text>,
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
  const { Text } = require("react-native");
  return {
    SectionHeader: ({ title }: { title: string }) => <Text>{title}</Text>,
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
    const { getByText } = render(<SettingsScreen />);

    expect(getByText("Preferences")).toBeTruthy();
    expect(getByText("Organization")).toBeTruthy();
    expect(getByText("Danger Zone")).toBeTruthy();
  });

  it("renders Sign Out button", () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText("Sign Out")).toBeTruthy();
  });

  it("shows demo notice when Sign Out is pressed", () => {
    const { getByText, queryByText } = render(<SettingsScreen />);

    expect(queryByText("This is a dashboard demo, so you are unable to sign out.")).toBeNull();

    fireEvent.press(getByText("Sign Out"));

    expect(getByText("This is a dashboard demo, so you are unable to sign out.")).toBeTruthy();
  });

  it("dismisses demo notice when Dismiss is pressed", () => {
    const { getByText, queryByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("Sign Out"));
    expect(getByText("This is a dashboard demo, so you are unable to sign out.")).toBeTruthy();

    fireEvent.press(getByText("Dismiss"));
    expect(queryByText("This is a dashboard demo, so you are unable to sign out.")).toBeNull();
  });

  it("renders theme toggle and other setting toggles", () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText(/Dark Mode/)).toBeTruthy();
    expect(getByText("Email Notifications")).toBeTruthy();
    expect(getByText("Slack Integration")).toBeTruthy();
    expect(getByText("Auto-refresh")).toBeTruthy();
  });

  it("renders Create Team button", () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText("+ Create Team")).toBeTruthy();
  });

  it("renders Clear Cache button", () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText("Clear Cache")).toBeTruthy();
  });

  it("renders org info rows", () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText("org_zencoder_001")).toBeTruthy();
    expect(getByText("Enterprise")).toBeTruthy();
    expect(getByText("100 purchased")).toBeTruthy();
  });
});
