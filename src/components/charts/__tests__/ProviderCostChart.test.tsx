import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { ProviderCostChart } from "../ProviderCostChart";
import type { ProviderCostRow } from "@/features/analytics/types";

jest.mock("react-native-svg", () => {
  const React = require("react");
  const MockSvg = (props: Record<string, unknown>) =>
    React.createElement("Svg", props);
  MockSvg.displayName = "Svg";
  const createMock = (name: string) => {
    const component = (props: Record<string, unknown>) =>
      React.createElement(name, props);
    component.displayName = name;
    return component;
  };
  return {
    __esModule: true,
    default: MockSvg,
    Svg: MockSvg,
    Path: createMock("Path"),
  };
});

jest.mock("@/features/analytics/hooks/useCurrencyFormatter", () => ({
  useCurrencyFormatter: () => ({
    formatCurrency: (n: number) => `$${n.toFixed(2)}`,
    formatCostPerToken: (n: number) => `$${Math.round(n * 1000000)} micro-units/token`,
    formatCompactCurrency: (n: number) => `$${n.toFixed(2)}`,
    currencyCode: "USD",
    currencySymbol: "$",
  }),
}));

const providerData: ProviderCostRow[] = [
  { provider: "openai", totalCostUsd: 6500, runCount: 300, totalTokens: 500_000_000, percentOfTotal: 0.52 },
  { provider: "anthropic", totalCostUsd: 4000, runCount: 200, totalTokens: 500_000_000, percentOfTotal: 0.32 },
  { provider: "gemini", totalCostUsd: 2000, runCount: 100, totalTokens: 500_000_000, percentOfTotal: 0.16 },
];

describe("ProviderCostChart", () => {
  it("defaults to pie mode and supports switching to bar mode", () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ProviderCostChart data={providerData} totalCostUsd={12_500} />
    );

    expect(getByTestId("bar-pie-chart-current-mode-pie")).toBeTruthy();
    expect(getByText("$12500.00")).toBeTruthy();

    fireEvent.press(getByTestId("bar-pie-chart-mode-bar"));

    expect(getByTestId("bar-pie-chart-current-mode-bar")).toBeTruthy();
    expect(getAllByText("OpenAI").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("Anthropic").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("Gemini").length).toBeGreaterThanOrEqual(1);
  });
});
