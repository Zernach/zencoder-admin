import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { KpiCard } from "../KpiCard";

// Mock lucide icons
jest.mock("lucide-react-native", () => ({
  ArrowUp: () => "ArrowUp",
  ArrowDown: () => "ArrowDown",
}));

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: {
      View: View,
      createAnimatedComponent: (c: unknown) => c,
    },
    useSharedValue: (v: number) => ({ value: v }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    withTiming: (v: number) => v,
    withRepeat: (v: number) => v,
    withDelay: (_d: number, v: number) => v,
    Easing: { out: () => ({}), inOut: () => ({}), ease: {} },
  };
});

// Mock useReducedMotion
jest.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

describe("KpiCard", () => {
  it("renders title and value", () => {
    const { getByText } = render(
      <KpiCard title="Total Cost" value="$47,823" />
    );
    expect(getByText("Total Cost")).toBeDefined();
    expect(getByText("$47,823")).toBeDefined();
  });

  it("renders caption when provided", () => {
    const { getByText } = render(
      <KpiCard title="Budget" value="$60,000" caption="Monthly" />
    );
    expect(getByText(/Monthly/)).toBeDefined();
  });

  it("renders period when provided", () => {
    const { getByText } = render(
      <KpiCard title="Runs" value="1,234" period="Last 30d" />
    );
    expect(getByText(/Last 30d/)).toBeDefined();
  });

  it("renders delta indicator when delta is provided", () => {
    const { getByText } = render(
      <KpiCard title="Success Rate" value="94.2%" delta={5.3} />
    );
    expect(getByText("+5.3%")).toBeDefined();
  });

  it("fires onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <KpiCard title="Cost" value="$100" onPress={onPress} />
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not render Pressable when no onPress", () => {
    const { queryByRole } = render(
      <KpiCard title="Cost" value="$100" />
    );
    expect(queryByRole("button")).toBeNull();
  });

  it("renders accessibilityLabel with title and value", () => {
    const { getByLabelText } = render(
      <KpiCard title="Total Cost" value="$47,823" onPress={() => {}} />
    );
    expect(getByLabelText("Total Cost: $47,823")).toBeDefined();
  });
});
