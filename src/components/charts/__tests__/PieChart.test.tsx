import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { Path } from "react-native-svg";
import { PieChart } from "../PieChart";
import { getOrangePieColorsByValue } from "../palette";

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

describe("PieChart", () => {
  it("renders slices and exposes overlay context", () => {
    const { getByTestId } = render(
      <PieChart
        data={[
          { id: "codex", value: 60, color: "#f64a00" },
          { id: "claude", value: 40, color: "#ff8c57" },
        ]}
        size={160}
      >
        {({ slices, total }) => (
          <Text testID="pie-overlay">{`${slices.length}-${Math.round(total)}`}</Text>
        )}
      </PieChart>,
    );

    expect(getByTestId("pie-overlay").props.children).toBe("2-100");
  });

  it("handles zero-value slices without invalid percent output", () => {
    const { getByTestId } = render(
      <PieChart
        data={[
          { id: "a", value: 0, color: "#f64a00" },
          { id: "b", value: 0, color: "#ff8c57" },
        ]}
        size={160}
      >
        {({ slices }) => (
          <Text testID="pie-percents">
            {slices.map((slice) => slice.percent.toFixed(2)).join(",")}
          </Text>
        )}
      </PieChart>,
    );

    expect(getByTestId("pie-percents").props.children).toBe("0.00,0.00");
  });

  it("applies value-ranked orange shades regardless of input colors", () => {
    const values: [number, number, number] = [30, 90, 60];
    const { UNSAFE_getAllByType } = render(
      <PieChart
        data={[
          { id: "small", value: values[0], color: "#000000" },
          { id: "large", value: values[1], color: "#ffffff" },
          { id: "medium", value: values[2], color: "#00ff00" },
        ]}
        size={160}
      />,
    );

    const fills = UNSAFE_getAllByType(Path).map((node) => node.props.fill);
    expect(fills).toEqual(getOrangePieColorsByValue(values));
  });
});
