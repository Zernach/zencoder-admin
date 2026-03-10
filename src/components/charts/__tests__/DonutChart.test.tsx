import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { DonutChart } from "../DonutChart";

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

describe("DonutChart", () => {
  it("defaults to pie mode and supports switching to bar mode", () => {
    const { getByTestId, getByText, getAllByText } = render(
      <DonutChart
        data={[
          { key: "Team Alpha", value: 60 },
          { key: "Team Beta", value: 40 },
        ]}
        centerLabel="Total"
        centerValue="$100"
      />,
    );

    expect(getByTestId("bar-pie-chart-current-mode-pie")).toBeTruthy();
    expect(getByText("Total")).toBeTruthy();
    expect(getByText("$100")).toBeTruthy();

    fireEvent.press(getByTestId("bar-pie-chart-mode-bar"));

    expect(getByTestId("bar-pie-chart-current-mode-bar")).toBeTruthy();
    expect(getAllByText("Team Alpha").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("Team Beta").length).toBeGreaterThanOrEqual(1);
  });
});
