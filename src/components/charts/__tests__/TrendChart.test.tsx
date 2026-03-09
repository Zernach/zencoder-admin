import React from "react";
import { render } from "@testing-library/react-native";
import { TrendChart } from "../TrendChart";
import type { TimeSeriesPoint } from "@/features/analytics/types";

// Mock react-native-svg
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
    G: createMock("G"),
    Path: createMock("Path"),
    Line: createMock("Line"),
    Rect: createMock("Rect"),
    Text: createMock("SvgText"),
    Circle: createMock("Circle"),
  };
});

const sampleData: TimeSeriesPoint[] = [
  { tsIso: "2025-01-01T00:00:00Z", value: 100 },
  { tsIso: "2025-01-02T00:00:00Z", value: 150 },
  { tsIso: "2025-01-03T00:00:00Z", value: 120 },
  { tsIso: "2025-01-04T00:00:00Z", value: 200 },
  { tsIso: "2025-01-05T00:00:00Z", value: 180 },
];

describe("TrendChart", () => {
  it("renders without crashing with sample data", () => {
    const { toJSON } = render(
      <TrendChart data={sampleData} variant="line" />
    );
    expect(toJSON()).toBeTruthy();
  });

  it("handles empty data by returning null", () => {
    const { toJSON } = render(
      <TrendChart data={[]} variant="line" />
    );
    expect(toJSON()).toBeNull();
  });

  it("accepts variant and color props", () => {
    const { toJSON } = render(
      <TrendChart data={sampleData} variant="area" color="#f64a00" />
    );
    expect(toJSON()).toBeTruthy();
  });
});
