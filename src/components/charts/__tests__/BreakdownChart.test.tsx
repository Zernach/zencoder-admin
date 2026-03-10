import React from "react";
import { StyleSheet } from "react-native";
import { fireEvent, render, within } from "@testing-library/react-native";
import { BreakdownChart, type BreakdownChartDatum } from "../BreakdownChart";
import { getOrangeBarShade, getOrangeBarShadesStepped } from "../palette";

const longNameData: BreakdownChartDatum[] = [
  { key: "Enterprise Cloud Migration Platform", value: 500 },
  { key: "Internal Developer Tools Dashboard", value: 350 },
  { key: "Customer Analytics and Reporting Suite", value: 200 },
];

const shortNameData: BreakdownChartDatum[] = [
  { key: "Alpha", value: 100 },
  { key: "Beta", value: 80 },
];

const hoverData: BreakdownChartDatum[] = [
  {
    key: "Alice Johnson",
    value: 150,
    hoverRows: [
      { label: "Full Name", value: "Alice Johnson" },
      { label: "Team", value: "Team Alpha" },
      { label: "Runs", value: "150" },
      { label: "Tokens", value: "50K" },
      { label: "Cost", value: "$45.00" },
    ],
  },
  {
    key: "Bob Smith",
    value: 120,
    hoverRows: [
      { label: "Full Name", value: "Bob Smith" },
      { label: "Team", value: "Team Beta" },
      { label: "Runs", value: "120" },
      { label: "Tokens", value: "40K" },
      { label: "Cost", value: "$36.00" },
    ],
  },
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
    const { getAllByText } = render(
      <BreakdownChart data={shortNameData} variant="horizontal-bar" />
    );

    expect(getAllByText("100").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("80").length).toBeGreaterThanOrEqual(1);
  });

  it("uses stepped shading by default (distinct colors per bar) in horizontal bars", () => {
    const { getByTestId } = render(
      <BreakdownChart data={shortNameData} variant="horizontal-bar" />
    );

    const shades = getOrangeBarShadesStepped(2);
    const firstFill = StyleSheet.flatten(getByTestId("breakdown-bar-fill-0").props.style);
    const secondFill = StyleSheet.flatten(getByTestId("breakdown-bar-fill-1").props.style);

    expect(firstFill.backgroundColor).toBe(shades[0]);
    expect(secondFill.backgroundColor).toBe(shades[1]);
  });

  it("uses stepped shading by default (distinct colors per bar) in vertical bars", () => {
    const { getByTestId } = render(
      <BreakdownChart data={shortNameData} variant="bar" />
    );

    const shades = getOrangeBarShadesStepped(2);
    const firstBar = StyleSheet.flatten(getByTestId("breakdown-vertical-bar-0").props.style);
    const secondBar = StyleSheet.flatten(getByTestId("breakdown-vertical-bar-1").props.style);

    expect(firstBar.backgroundColor).toBe(shades[0]);
    expect(secondBar.backgroundColor).toBe(shades[1]);
  });

  it("uses scaled shading (continuous by value) when colorScale='scaled'", () => {
    const { getByTestId } = render(
      <BreakdownChart data={shortNameData} variant="horizontal-bar" colorScale="scaled" />
    );

    const firstFill = StyleSheet.flatten(getByTestId("breakdown-bar-fill-0").props.style);
    const secondFill = StyleSheet.flatten(getByTestId("breakdown-bar-fill-1").props.style);

    expect(firstFill.backgroundColor).toBe(getOrangeBarShade(100, 80, 100));
    expect(secondFill.backgroundColor).toBe(getOrangeBarShade(80, 80, 100));
  });

  it("shows and hides hover details bubble on label interaction", () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <BreakdownChart data={hoverData} variant="horizontal-bar" truncateLabels={false} />
    );

    expect(queryByTestId("breakdown-hover-bubble-0")).toBeNull();

    fireEvent(getByTestId("breakdown-label-hover-target-0"), "pressIn");

    const bubble = getByTestId("breakdown-hover-bubble-0");
    const scoped = within(bubble);

    expect(bubble).toBeTruthy();
    expect(scoped.getByText("Full Name")).toBeTruthy();
    expect(scoped.getByText("Alice Johnson")).toBeTruthy();
    expect(scoped.getByText("Team Alpha")).toBeTruthy();
    expect(scoped.getByText("150")).toBeTruthy();
    expect(scoped.getByText("50K")).toBeTruthy();
    expect(scoped.getByText("$45.00")).toBeTruthy();

    fireEvent(getByTestId("breakdown-label-hover-target-0"), "pressOut");
    expect(queryByTestId("breakdown-hover-bubble-0")).toBeNull();
  });
});
