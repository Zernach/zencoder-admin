import React from "react";
import { render } from "@testing-library/react-native";
import { BreakdownChart } from "../BreakdownChart";
import type { KeyValueMetric } from "@/features/analytics/types";

const longNameData: KeyValueMetric[] = [
  { key: "Enterprise Cloud Migration Platform", value: 500 },
  { key: "Internal Developer Tools Dashboard", value: 350 },
  { key: "Customer Analytics and Reporting Suite", value: 200 },
];

const shortNameData: KeyValueMetric[] = [
  { key: "Alpha", value: 100 },
  { key: "Beta", value: 80 },
];

describe("BreakdownChart", () => {
  it("renders all labels in horizontal-bar mode", () => {
    const { getByText } = render(
      <BreakdownChart data={shortNameData} variant="horizontal-bar" />
    );

    expect(getByText("Alpha")).toBeTruthy();
    expect(getByText("Beta")).toBeTruthy();
  });

  it("renders long labels fully when truncateLabels is false", () => {
    const { getByText } = render(
      <BreakdownChart data={longNameData} variant="horizontal-bar" truncateLabels={false} />
    );

    expect(getByText("Enterprise Cloud Migration Platform")).toBeTruthy();
    expect(getByText("Internal Developer Tools Dashboard")).toBeTruthy();
    expect(getByText("Customer Analytics and Reporting Suite")).toBeTruthy();
  });

  it("label text element has numberOfLines=undefined when truncateLabels is false", () => {
    const { getByText } = render(
      <BreakdownChart data={longNameData} variant="horizontal-bar" truncateLabels={false} />
    );

    const label = getByText("Enterprise Cloud Migration Platform");
    // When truncateLabels is false, numberOfLines should not be set (undefined)
    expect(label.props.numberOfLines).toBeUndefined();
  });

  it("label text element has numberOfLines=1 when truncateLabels is true (default)", () => {
    const { getByText } = render(
      <BreakdownChart data={shortNameData} variant="horizontal-bar" />
    );

    const label = getByText("Alpha");
    expect(label.props.numberOfLines).toBe(1);
  });

  it("renders formatted values by default", () => {
    const { getByText } = render(
      <BreakdownChart data={shortNameData} variant="horizontal-bar" />
    );

    expect(getByText("100")).toBeTruthy();
    expect(getByText("80")).toBeTruthy();
  });
});
