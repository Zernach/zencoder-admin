import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { BottomTabs } from "../BottomTabs";
import { ROUTES, TAB_ORDER, TABS } from "@/constants/routes";
import { TabActions } from "@react-navigation/native";

const mockNavigate = jest.fn();
const mockPrefetch = jest.fn();
const mockDispatch = jest.fn();
const mockGetParent = jest.fn();
const mockGetState = jest.fn();
let mockPathname = ROUTES.DASHBOARD;

jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: mockNavigate, prefetch: mockPrefetch }),
  useNavigation: () => ({
    dispatch: mockDispatch,
    getParent: mockGetParent,
    getState: mockGetState,
  }),
  usePathname: () => mockPathname,
}));

jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));

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
    mockDispatch.mockReset();
    mockGetParent.mockReset();
    mockGetState.mockReset();
    mockGetParent.mockReturnValue(undefined);
    mockGetState.mockReturnValue({
      type: "tab",
      routeNames: [...TAB_ORDER],
    });
  });

  it("navigates when pressing an inactive tab", () => {
    mockPathname = ROUTES.DASHBOARD;
    const { getByLabelText } = render(<BottomTabs />);

    fireEvent.press(getByLabelText("navigation.agents"));

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(TabActions.jumpTo(TABS.AGENTS));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not navigate when pressing the active tab", () => {
    mockPathname = ROUTES.AGENTS;
    const { getByLabelText } = render(<BottomTabs />);

    fireEvent.press(getByLabelText("navigation.agents"));

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("falls back to router navigation when tab navigator is unavailable", () => {
    mockPathname = ROUTES.DASHBOARD;
    mockGetState.mockReturnValue({
      type: "stack",
      routeNames: ["(dashboard)"],
    });

    const { getByLabelText } = render(<BottomTabs />);

    fireEvent.press(getByLabelText("navigation.agents"));

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AGENTS);
  });
});
