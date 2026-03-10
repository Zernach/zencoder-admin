import React from "react";
import { render } from "@testing-library/react-native";
import { BarChart, type BarChartDatum } from "../BarChart";

const sampleData: BarChartDatum[] = [
  {
    id: "alpha",
    label: "Alpha",
    value: 12,
    valueLabel: "12",
    color: "#f64a00",
    barTestID: "bar-alpha",
  },
  {
    id: "beta",
    label: "Beta",
    value: 8,
    valueLabel: "8",
    color: "#ff8c57",
    barTestID: "bar-beta",
  },
];

describe("BarChart", () => {
  it("renders horizontal bars with labels, values, and axis label", () => {
    const { getByText, getByTestId } = render(
      <BarChart
        data={sampleData}
        orientation="horizontal"
        showValues
        xLabel="axis label"
        horizontalOptions={{ labelNumberOfLines: 1 }}
      />,
    );

    expect(getByText("Alpha")).toBeTruthy();
    expect(getByText("Beta")).toBeTruthy();
    expect(getByText("12")).toBeTruthy();
    expect(getByText("8")).toBeTruthy();
    expect(getByText("axis label")).toBeTruthy();
    expect(getByTestId("bar-alpha")).toBeTruthy();
    expect(getByTestId("bar-beta")).toBeTruthy();
  });

  it("renders vertical bars", () => {
    const { getByText, getByTestId } = render(
      <BarChart
        data={sampleData}
        orientation="vertical"
        showValues
        verticalOptions={{ labelNumberOfLines: 1 }}
      />,
    );

    expect(getByText("Alpha")).toBeTruthy();
    expect(getByText("Beta")).toBeTruthy();
    expect(getByTestId("bar-alpha")).toBeTruthy();
    expect(getByTestId("bar-beta")).toBeTruthy();
  });
});
