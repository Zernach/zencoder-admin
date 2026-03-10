import React from "react";
import { StyleSheet } from "react-native";
import { render } from "@testing-library/react-native";
import { DistributionChart } from "../DistributionChart";
import { getOrangeBarShade } from "../palette";

describe("DistributionChart", () => {
  it("returns null when no data is provided", () => {
    const { toJSON } = render(<DistributionChart data={[]} />);

    expect(toJSON()).toBeNull();
  });

  it("uses darker orange for higher bin counts and lighter orange for lower bin counts", () => {
    const { getByTestId } = render(
      <DistributionChart data={[0, 0, 0, 0, 9]} bins={2} />
    );

    const firstBinBar = StyleSheet.flatten(getByTestId("distribution-bar-0").props.style);
    const secondBinBar = StyleSheet.flatten(getByTestId("distribution-bar-1").props.style);

    expect(firstBinBar.backgroundColor).toBe(getOrangeBarShade(4, 1, 4));
    expect(secondBinBar.backgroundColor).toBe(getOrangeBarShade(1, 1, 4));
  });
});
