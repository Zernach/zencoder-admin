import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { BarChart, type BarChartDatum } from "../BarChart";

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

  it("toggles between bar and pie modes", () => {
    const { getByTestId } = render(
      <BarChart
        data={sampleData}
        orientation="horizontal"
      />,
    );

    expect(getByTestId("bar-pie-chart-current-mode-bar")).toBeTruthy();

    fireEvent.press(getByTestId("bar-pie-chart-mode-pie"));
    expect(getByTestId("bar-pie-chart-current-mode-pie")).toBeTruthy();

    fireEvent.press(getByTestId("bar-pie-chart-mode-bar"));
    expect(getByTestId("bar-pie-chart-current-mode-bar")).toBeTruthy();
  });
});
