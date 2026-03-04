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
    const { getByText, getAllByText } = render(
      <BreakdownChart data={longNameData} variant="horizontal-bar" truncateLabels={false} />
    );

    expect(getByText("Enterprise Cloud Migration Platform")).toBeTruthy();
    expect(getByText("Internal Developer Tools Dashboard")).toBeTruthy();
    expect(getAllByText("Customer Analytics and Reporting Suite").length).toBeGreaterThan(0);
  });

  it("label text element has numberOfLines=undefined when truncateLabels is false", () => {
    const { getByText } = render(
      <BreakdownChart data={longNameData} variant="horizontal-bar" truncateLabels={false} />
    );

    const label = getByText("Enterprise Cloud Migration Platform");
    // When truncateLabels is false, numberOfLines should not be set (undefined)
    expect(label.props.numberOfLines).toBeUndefined();
  });

  it("does not hardcode a fixed label column width when truncateLabels is false", () => {
    const { getByText } = render(
      <BreakdownChart data={longNameData} variant="horizontal-bar" truncateLabels={false} />
    );

    const label = getByText("Enterprise Cloud Migration Platform");
    const flattenedStyles = Array.isArray(label.props.style) ? label.props.style : [label.props.style];
    const hasHardcodedWidth = flattenedStyles.some(
      (style: { width?: unknown } | null | undefined) => style?.width === 240
    );
    expect(hasHardcodedWidth).toBe(false);
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
