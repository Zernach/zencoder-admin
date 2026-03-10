import React from "react";
import { render, fireEvent, within } from "@testing-library/react-native";
import { LineChart } from "../LineChart";
import { ChartCardHeaderActionContext } from "../ChartCardHeaderActionContext";
import type { TimeSeriesPoint } from "@/features/analytics/types";
import { semanticThemes } from "@/theme/themes";

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

describe("LineChart", () => {
  it("renders without crashing with sample data", () => {
    const { toJSON } = render(
      <LineChart data={sampleData} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it("handles empty data by returning null", () => {
    const { toJSON } = render(
      <LineChart data={[]} />
    );
    expect(toJSON()).toBeNull();
  });

  it("renders without optional styling props", () => {
    const { toJSON } = render(
      <LineChart data={sampleData} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders area variant with filled area path", () => {
    const { toJSON } = render(
      <LineChart data={sampleData} variant="area" />
    );
    const rendered = JSON.stringify(toJSON());

    expect(rendered).toContain('"fillOpacity":0.16');
  });

  it("renders line mode with the shared green success stroke", () => {
    const { toJSON } = render(
      <LineChart data={sampleData} />
    );
    const rendered = JSON.stringify(toJSON());

    expect(rendered).toContain(`"stroke":"${semanticThemes.dark.state.success}"`);
  });

  it("renders normalized axis labels for zero-to-one metrics", () => {
    const normalizedData: TimeSeriesPoint[] = sampleData.map((point) => ({
      tsIso: point.tsIso,
      value: point.value / 200,
    }));
    const { toJSON } = render(
      <LineChart data={normalizedData} variant="percentages" />
    );
    const rendered = JSON.stringify(toJSON());

    expect(rendered).toContain('"children":["0%"]');
    expect(rendered).toContain('"children":["50%"]');
    expect(rendered).toContain('"children":["100%"]');
  });

  it("renders built-in chart mode toggle controls", () => {
    const { getByTestId, getByText } = render(
      <LineChart data={sampleData} />
    );

    expect(getByTestId("trend-chart-mode-line")).toBeTruthy();
    expect(getByTestId("trend-chart-mode-candlestick")).toBeTruthy();
    expect(getByText("Line")).toBeTruthy();
    expect(getByText("Diffs")).toBeTruthy();
  });

  it("switches to candlestick diffs mode when toggle is pressed", () => {
    const { getByTestId, queryByTestId } = render(
      <LineChart data={sampleData} />
    );

    expect(queryByTestId("trend-chart-candlestick-series")).toBeNull();

    fireEvent.press(getByTestId("trend-chart-mode-candlestick"));

    expect(getByTestId("trend-chart-candlestick-series")).toBeTruthy();
    expect(getByTestId("trend-chart-candle-0")).toBeTruthy();
  });

  it("shows detailed point info on touch and hides it when touch ends", () => {
    const { getByTestId, queryByTestId } = render(
      <LineChart data={sampleData} />
    );

    const interactionLayer = getByTestId("trend-chart-interaction-layer");
    expect(queryByTestId("trend-chart-hover-tooltip")).toBeNull();

    fireEvent(interactionLayer, "responderGrant", { nativeEvent: { locationX: 0 } });

    const tooltip = getByTestId("trend-chart-hover-tooltip");
    const scoped = within(tooltip);
    const expectedDateLabel = new Date(sampleData[0]!.tsIso).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" },
    );

    expect(tooltip).toBeTruthy();
    expect(getByTestId("trend-chart-active-guide")).toBeTruthy();
    expect(getByTestId("trend-chart-active-point")).toBeTruthy();
    expect(scoped.getByText("Value")).toBeTruthy();
    expect(scoped.getByText(expectedDateLabel)).toBeTruthy();
    expect(scoped.getByText("100")).toBeTruthy();

    fireEvent(interactionLayer, "responderRelease");

    expect(queryByTestId("trend-chart-hover-tooltip")).toBeNull();
    expect(queryByTestId("trend-chart-active-guide")).toBeNull();
    expect(queryByTestId("trend-chart-active-point")).toBeNull();
  });

  it("uses an area-specific detail label in tooltip for area variant", () => {
    const { getByTestId } = render(
      <LineChart data={sampleData} variant="area" />
    );

    fireEvent(getByTestId("trend-chart-interaction-layer"), "responderGrant", {
      nativeEvent: { locationX: 0 },
    });

    const tooltip = getByTestId("trend-chart-hover-tooltip");
    expect(within(tooltip).getByText("Area value")).toBeTruthy();
  });

  it("shows normalized detail values for zero-to-one variant", () => {
    const normalizedData: TimeSeriesPoint[] = sampleData.map((point) => ({
      tsIso: point.tsIso,
      value: point.value / 200,
    }));
    const { getByTestId } = render(
      <LineChart data={normalizedData} variant="percentages" />
    );

    fireEvent(getByTestId("trend-chart-interaction-layer"), "responderGrant", {
      nativeEvent: { locationX: 0 },
    });

    const tooltip = getByTestId("trend-chart-hover-tooltip");
    const scoped = within(tooltip);

    expect(scoped.getByText("Normalized value")).toBeTruthy();
    expect(scoped.getByText("0.500 (50.0%)")).toBeTruthy();
  });

  it("updates the active point while dragging across the line", () => {
    const { getByTestId } = render(
      <LineChart data={sampleData} />
    );

    const interactionLayer = getByTestId("trend-chart-interaction-layer");
    fireEvent(interactionLayer, "responderGrant", { nativeEvent: { locationX: 0 } });

    let tooltip = getByTestId("trend-chart-hover-tooltip");
    expect(within(tooltip).getByText("100")).toBeTruthy();

    fireEvent(interactionLayer, "responderMove", { nativeEvent: { locationX: 240 } });

    tooltip = getByTestId("trend-chart-hover-tooltip");
    expect(within(tooltip).getByText("180")).toBeTruthy();
  });

  it("registers mode toggle with ChartCard header action context", () => {
    const setHeaderAction = jest.fn((_: React.ReactNode) => undefined);
    const { queryByTestId } = render(
      <ChartCardHeaderActionContext.Provider value={{ setHeaderAction }}>
        <LineChart data={sampleData} />
      </ChartCardHeaderActionContext.Provider>,
    );

    expect(queryByTestId("trend-chart-inline-mode-toggle")).toBeNull();

    const headerToggleNode = setHeaderAction.mock.calls[setHeaderAction.mock.calls.length - 1]?.[0];
    expect(React.isValidElement(headerToggleNode)).toBe(true);
    if (React.isValidElement<{ testID?: string }>(headerToggleNode)) {
      expect(headerToggleNode.props.testID).toBe("trend-chart-header-mode-toggle");
    }
  });
});
