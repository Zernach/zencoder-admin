import React from "react";
import { StyleSheet } from "react-native";
import { render } from "@testing-library/react-native";
import { DistributionChart } from "../DistributionChart";
import { getOrangeBarShade, getOrangeBarShadesStepped } from "../palette";

describe("DistributionChart", () => {
  it("returns null when no data is provided", () => {
    const { toJSON } = render(<DistributionChart data={[]} />);

    expect(toJSON()).toBeNull();
  });

  it("uses stepped shading by default (distinct colors per bin)", () => {
    const { getByTestId } = render(
      <DistributionChart data={[0, 0, 0, 0, 9]} bins={2} />
    );

    // bin 0 has 4 items (highest), bin 1 has 1 item (lowest)
    // stepped shades are assigned by rank: darkest to highest, lightest to lowest
    const shades = getOrangeBarShadesStepped(2);
    const firstBinBar = StyleSheet.flatten(getByTestId("distribution-bar-0").props.style);
    const secondBinBar = StyleSheet.flatten(getByTestId("distribution-bar-1").props.style);

    expect(firstBinBar.backgroundColor).toBe(shades[0]); // highest count → darkest
    expect(secondBinBar.backgroundColor).toBe(shades[1]); // lowest count → lightest
  });

  it("uses scaled shading when colorScale='scaled'", () => {
    const { getByTestId } = render(
      <DistributionChart data={[0, 0, 0, 0, 9]} bins={2} colorScale="scaled" />
    );

    const firstBinBar = StyleSheet.flatten(getByTestId("distribution-bar-0").props.style);
    const secondBinBar = StyleSheet.flatten(getByTestId("distribution-bar-1").props.style);

    expect(firstBinBar.backgroundColor).toBe(getOrangeBarShade(4, 1, 4));
    expect(secondBinBar.backgroundColor).toBe(getOrangeBarShade(1, 1, 4));
  });
});
