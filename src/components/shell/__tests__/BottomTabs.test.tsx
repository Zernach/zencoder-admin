import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { BottomTabs } from "../BottomTabs";
import { ROUTES } from "@/constants/routes";

const mockNavigate = jest.fn();
const mockPrefetch = jest.fn();
let mockPathname = ROUTES.DASHBOARD;

jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: mockNavigate, prefetch: mockPrefetch }),
  usePathname: () => mockPathname,
}));

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native");
  const Icon = () => <View />;

  return {
    Home: Icon,
    Bot: Icon,
    DollarSign: Icon,
    Shield: Icon,
    Settings: Icon,
  };
});

describe("BottomTabs", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockPrefetch.mockReset();
  });

  it("navigates when pressing an inactive tab", () => {
    mockPathname = ROUTES.DASHBOARD;
    const { getByLabelText } = render(<BottomTabs />);

    fireEvent.press(getByLabelText("Agents"));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AGENTS);
  });

  it("does not navigate when pressing the active tab", () => {
    mockPathname = ROUTES.AGENTS;
    const { getByLabelText } = render(<BottomTabs />);

    fireEvent.press(getByLabelText("Agents"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
