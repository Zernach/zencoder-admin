import React from "react";
import { render } from "@testing-library/react-native";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Sidebar } from "../Sidebar";
import { ROUTES } from "@/constants/routes";
import { SUBSECTIONS } from "@/constants/navigation";
import { sidebarSlice, type SidebarState } from "@/store/slices/sidebarSlice";

const mockNavigate = jest.fn();
let mockPathname = ROUTES.DASHBOARD;

jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: mockNavigate }),
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
    expect(queryByText("Compliance Status")).toBeNull();
    expect(queryByText("Recent Violations")).toBeNull();
    // Agents subsections should not appear
    expect(queryByText("Agent Performance")).toBeNull();
  });

  it("does not show subsections when sidebar is collapsed", () => {
    mockPathname = ROUTES.GOVERNANCE;
    const { queryByText } = renderSidebar(false);

    expect(queryByText("Compliance Status")).toBeNull();
    expect(queryByText("Seat User Oversight")).toBeNull();
  });

  it("does not show subsections for dashboard or settings", () => {
    mockPathname = ROUTES.SETTINGS;
    const { queryByText } = renderSidebar(true);

    // No subsections should appear since Settings has no subsections
    expect(queryByText("Reliability")).toBeNull();
    expect(queryByText("Cost Summary")).toBeNull();
    expect(queryByText("Overview")).toBeNull();
  });

  it("governance subsections appear in exact required order", () => {
    mockPathname = ROUTES.GOVERNANCE;
    const { getByLabelText } = renderSidebar(true);

    const subsectionList = getByLabelText("Governance subsections");
    expect(subsectionList).toBeTruthy();

    const expectedLabels = [
      "Overview",
      "Compliance Status",
      "Seat User Oversight",
      "Recent Violations",
      "Security Events",
      "Policy Changes",
    ];
    for (const label of expectedLabels) {
      expect(getByLabelText(label)).toBeTruthy();
    }
  });
});
