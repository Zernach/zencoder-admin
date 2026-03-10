import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { BarPieChart } from "../BarPieChart";
import { ChartCardHeaderActionContext } from "../ChartCardHeaderActionContext";

describe("BarPieChart", () => {
  it("renders bar mode by default and toggles to pie mode", () => {
    const { getByTestId, getByText, queryByText } = render(
      <BarPieChart
        renderBar={() => <Text>Bar content</Text>}
        renderPie={() => <Text>Pie content</Text>}
      />,
    );

    expect(getByTestId("bar-pie-chart-inline-mode-toggle")).toBeTruthy();
    expect(getByTestId("bar-pie-chart-current-mode-bar")).toBeTruthy();
    expect(getByText("Bar content")).toBeTruthy();
    expect(queryByText("Pie content")).toBeNull();

    fireEvent.press(getByTestId("bar-pie-chart-mode-pie"));

    expect(getByTestId("bar-pie-chart-current-mode-pie")).toBeTruthy();
    expect(getByText("Pie content")).toBeTruthy();
    expect(queryByText("Bar content")).toBeNull();
  });

  it("respects pie default mode", () => {
    const { getByTestId, getByText } = render(
      <BarPieChart
        defaultMode="pie"
        renderBar={() => <Text>Bar content</Text>}
        renderPie={() => <Text>Pie content</Text>}
      />,
    );

    expect(getByTestId("bar-pie-chart-current-mode-pie")).toBeTruthy();
    expect(getByText("Pie content")).toBeTruthy();
  });

  it("registers mode toggle with chart card header action context", () => {
    const setHeaderAction = jest.fn((_: React.ReactNode) => undefined);
    const { queryByTestId } = render(
      <ChartCardHeaderActionContext.Provider value={{ setHeaderAction }}>
        <BarPieChart
          renderBar={() => <Text>Bar content</Text>}
          renderPie={() => <Text>Pie content</Text>}
        />
      </ChartCardHeaderActionContext.Provider>,
    );

    expect(queryByTestId("bar-pie-chart-inline-mode-toggle")).toBeNull();

    const headerToggleNode = setHeaderAction.mock.calls[setHeaderAction.mock.calls.length - 1]?.[0];
    expect(React.isValidElement(headerToggleNode)).toBe(true);
    if (React.isValidElement<{ testID?: string }>(headerToggleNode)) {
      expect(headerToggleNode.props.testID).toBe("bar-pie-chart-header-mode-toggle");
    }
  });
});
