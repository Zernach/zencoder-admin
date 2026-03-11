import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Sidebar } from "../Sidebar";
import { ROUTES } from "@/constants/routes";
import { SUBSECTIONS } from "@/constants/navigation";
import { sidebarSlice, type SidebarState } from "@/store/slices/sidebarSlice";

const mockNavigate = jest.fn();
let mockPathname = ROUTES.DASHBOARD;

jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));

jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: mockNavigate }),
  usePathname: () => mockPathname,
  useNavigation: () => ({
    setOptions: jest.fn(),
    getState: () => ({ type: "stack", routeNames: [] }),
    getParent: () => undefined,
  }),
}));

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native");
  const Icon = () => <View />;
  return {
    Home: Icon,
    Bot: Icon,
    DollarSign: Icon,
    Shield: Icon,
    MessageSquare: Icon,
    PanelLeftClose: Icon,
    PanelLeftOpen: Icon,
  };
});

jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  return {
    __esModule: true,
    default: {
      View: RN.View,
    },
    useSharedValue: (v: number) => ({ value: v }),
    useAnimatedStyle: (fn: () => object) => fn(),
    withTiming: (v: number) => v,
    Easing: { out: (e: unknown) => e, ease: "ease" },
  };
});

describe("Sidebar — subsection rendering", () => {
  function renderSidebar(expanded = true) {
    const store = configureStore({
      reducer: {
        sidebar: sidebarSlice.reducer,
      },
      preloadedState: {
        sidebar: { expanded } satisfies SidebarState,
      },
    });

    return render(
      <Provider store={store}>
        <Sidebar />
      </Provider>,
    );
  }

  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("shows governance subsections when governance is active and expanded", () => {
    mockPathname = ROUTES.GOVERNANCE;
    const { getByText } = renderSidebar(true);

    for (const sub of SUBSECTIONS[ROUTES.GOVERNANCE]) {
      expect(getByText(sub.label)).toBeTruthy();
    }
  });

  it("navigates to root when pressing home from an inactive route", () => {
    mockPathname = ROUTES.AGENTS;
    const { getByLabelText } = renderSidebar(true);

    fireEvent.press(getByLabelText("navigation.home"));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ROOT);
  });

  it("does not navigate when pressing home while already on /dashboard (at root)", () => {
    mockPathname = ROUTES.DASHBOARD;
    const { getByLabelText } = renderSidebar(true);

    fireEvent.press(getByLabelText("navigation.home"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates directly to chat history when pressing chat tab", () => {
    mockPathname = ROUTES.AGENTS;
    const { getByLabelText } = renderSidebar(true);

    fireEvent.press(getByLabelText("navigation.settings"));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/chat");
  });

  it("shows agents subsections when agents is active and expanded", () => {
    mockPathname = ROUTES.AGENTS;
    const { getByText } = renderSidebar(true);

    for (const sub of SUBSECTIONS[ROUTES.AGENTS]) {
      expect(getByText(sub.label)).toBeTruthy();
    }
  });

  it("shows costs subsections when costs is active and expanded", () => {
    mockPathname = ROUTES.COSTS;
    const { getByText } = renderSidebar(true);

    for (const sub of SUBSECTIONS[ROUTES.COSTS]) {
      expect(getByText(sub.label)).toBeTruthy();
    }
  });

  it("does not show subsections for inactive tabs", () => {
    mockPathname = ROUTES.DASHBOARD;
    const { queryByText } = renderSidebar(true);

    // Governance subsections should not appear
    expect(queryByText("navigation.subsections.seatUserOversight")).toBeNull();
    expect(queryByText("navigation.subsections.recentViolations")).toBeNull();
    // Agents subsections should not appear
    expect(queryByText("navigation.subsections.agentPerformance")).toBeNull();
  });

  it("does not show subsections when sidebar is collapsed", () => {
    mockPathname = ROUTES.GOVERNANCE;
    const { queryByText } = renderSidebar(false);

    expect(queryByText("navigation.subsections.seatUserOversight")).toBeNull();
    expect(queryByText("navigation.subsections.recentViolations")).toBeNull();
  });

  it("shows dashboard subsections when dashboard is active and expanded", () => {
    mockPathname = ROUTES.DASHBOARD;
    const { getByText } = renderSidebar(true);

    for (const sub of SUBSECTIONS[ROUTES.ROOT]) {
      expect(getByText(sub.label)).toBeTruthy();
    }
  });

  it("does not show other tabs subsections when settings is active", () => {
    mockPathname = ROUTES.SETTINGS;
    const { queryByText } = renderSidebar(true);

    expect(queryByText("navigation.subsections.reliability")).toBeNull();
    expect(queryByText("navigation.subsections.costSummary")).toBeNull();
    expect(queryByText("navigation.subsections.liveAssistants")).toBeNull();
  });

  it("governance subsections appear in exact required order", () => {
    mockPathname = ROUTES.GOVERNANCE;
    const { getByLabelText } = renderSidebar(true);

    const subsectionList = getByLabelText("navigation.subsectionsLabel");
    expect(subsectionList).toBeTruthy();

    const expectedLabels = SUBSECTIONS[ROUTES.GOVERNANCE].map((subsection) => subsection.label);
    for (const label of expectedLabels) {
      expect(getByLabelText(label)).toBeTruthy();
    }
  });
});
