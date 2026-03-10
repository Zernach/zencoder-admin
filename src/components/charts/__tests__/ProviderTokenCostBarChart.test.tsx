import React from "react";
import { StyleSheet } from "react-native";
import { render } from "@testing-library/react-native";
import { ProviderTokenCostBarChart } from "../ProviderTokenCostBarChart";
import { getOrangeBarShade } from "../palette";
import type { ProviderCostRow } from "@/features/analytics/types";

jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));

const providerData: ProviderCostRow[] = [
  { provider: "codex", totalCostUsd: 6500, runCount: 300, totalTokens: 500_000_000, percentOfTotal: 0.52 },
  { provider: "claude", totalCostUsd: 4000, runCount: 200, totalTokens: 500_000_000, percentOfTotal: 0.32 },
  { provider: "other", totalCostUsd: 2000, runCount: 100, totalTokens: 500_000_000, percentOfTotal: 0.16 },
];

describe("ProviderTokenCostBarChart", () => {
  it("renders one bar per provider row", () => {
    const { getByText } = render(
      <ProviderTokenCostBarChart data={providerData} />
    );

    expect(getByText("Codex")).toBeTruthy();
    expect(getByText("Claude")).toBeTruthy();
    expect(getByText("Other")).toBeTruthy();
  });

  it("sorts rows by computed per-token cost descending", () => {
    const { getAllByText } = render(
      <ProviderTokenCostBarChart data={providerData} />
    );

    // All provider labels should render; Codex has highest per-token cost (13),
    // Claude second (8), Other third (4). Verify all are present.
    const labels = getAllByText(/Codex|Claude|Other/);
    expect(labels).toHaveLength(3);
    // First label should be Codex (highest per-token cost)
    expect(labels[0].props.children).toBe("Codex");
    // Second should be Claude
    expect(labels[1].props.children).toBe("Claude");
    // Third should be Other
    expect(labels[2].props.children).toBe("Other");
  });

  it("shows numeric values per bar and a shared axis label", () => {
    const { getAllByText, getByText } = render(
      <ProviderTokenCostBarChart data={providerData} />
    );

    // 6500 / 500_000_000 = 0.000013 → 13
    // The longest formatted value is also rendered as a hidden measure label,
    // so "13" may appear more than once.
    expect(getAllByText("13").length).toBeGreaterThanOrEqual(1);
    // 4000 / 500_000_000 = 0.000008 → 8
    expect(getAllByText("8").length).toBeGreaterThanOrEqual(1);
    // 2000 / 500_000_000 = 0.000004 → 4
    expect(getAllByText("4").length).toBeGreaterThanOrEqual(1);
    // Shared axis label appears once
    expect(getByText("ten-thousandths of a penny per token")).toBeTruthy();
  });

  it("handles totalTokens = 0 without invalid numeric output", () => {
    const zeroTokenData: ProviderCostRow[] = [
      { provider: "codex", totalCostUsd: 5000, runCount: 100, totalTokens: 0, percentOfTotal: 1.0 },
    ];

    const { getAllByText, getByText, queryByText } = render(
      <ProviderTokenCostBarChart data={zeroTokenData} />
    );

    expect(getAllByText("0").length).toBeGreaterThanOrEqual(1);
    expect(getByText("ten-thousandths of a penny per token")).toBeTruthy();
    expect(queryByText(/NaN/)).toBeNull();
    expect(queryByText(/Infinity/)).toBeNull();
  });

  it("uses orange intensity shading based on per-token cost values", () => {
    const { getByTestId } = render(
      <ProviderTokenCostBarChart data={providerData} />
    );

    // BreakdownChart sorts by value desc, assigns testIDs by index
    const firstFill = StyleSheet.flatten(getByTestId("breakdown-bar-fill-0").props.style);
    const secondFill = StyleSheet.flatten(getByTestId("breakdown-bar-fill-1").props.style);
    const thirdFill = StyleSheet.flatten(getByTestId("breakdown-bar-fill-2").props.style);

    // Per-token costs: codex=13e-6, claude=8e-6, other=4e-6
    const codexCpt = 6500 / 500_000_000;
    const claudeCpt = 4000 / 500_000_000;
    const otherCpt = 2000 / 500_000_000;

    expect(firstFill.backgroundColor).toBe(getOrangeBarShade(codexCpt, otherCpt, codexCpt));
    expect(secondFill.backgroundColor).toBe(getOrangeBarShade(claudeCpt, otherCpt, codexCpt));
    expect(thirdFill.backgroundColor).toBe(getOrangeBarShade(otherCpt, otherCpt, codexCpt));
  });
});
