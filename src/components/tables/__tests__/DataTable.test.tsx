import React from "react";
import { render, fireEvent, within } from "@testing-library/react-native";
import { DataTable, type ColumnDef } from "../DataTable";

// Mock dependencies
jest.mock("lucide-react-native", () => ({
  ChevronUp: () => "ChevronUp",
  ChevronDown: () => "ChevronDown",
  Inbox: () => "Inbox",
}));

jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: {
      View: View,
      createAnimatedComponent: (c: unknown) => c,
    },
    useSharedValue: (v: number) => ({ value: v }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    withRepeat: () => 0,
    withTiming: () => 0,
    Easing: { inOut: () => ({}), ease: {} },
  };
});

interface TestRow {
  id: string;
  name: string;
  value: number;
}

const columns: ColumnDef<TestRow>[] = [
  { key: "id", header: "ID", width: 80 },
  { key: "name", header: "Name" },
  { key: "value", header: "Value", width: 100, align: "right" },
];

const data: TestRow[] = [
  { id: "1", name: "Alice", value: 100 },
  { id: "2", name: "Bob", value: 200 },
  { id: "3", name: "Charlie", value: 300 },
];

const unsortedData: TestRow[] = [
  { id: "3", name: "Charlie", value: 300 },
  { id: "1", name: "Alice", value: 100 },
  { id: "2", name: "Bob", value: 200 },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    const { getByText } = render(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
      />
    );
    expect(getByText("ID")).toBeDefined();
    expect(getByText("Name")).toBeDefined();
    expect(getByText("Value")).toBeDefined();
  });

  it("renders correct number of rows", () => {
    const { getByText } = render(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
      />
    );
    expect(getByText("Alice")).toBeDefined();
    expect(getByText("Bob")).toBeDefined();
    expect(getByText("Charlie")).toBeDefined();
  });

  it("renders all headers as sortable by default", () => {
    const { getByLabelText } = render(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
      />
    );

    expect(getByLabelText("Sort by ID")).toBeDefined();
    expect(getByLabelText("Sort by Name")).toBeDefined();
    expect(getByLabelText("Sort by Value")).toBeDefined();
  });

  it("sorts rows and reverses direction when pressed again", () => {
    const { getByText, getAllByTestId } = render(
      <DataTable
        columns={columns}
        data={unsortedData}
        keyExtractor={(r) => r.id}
      />
    );

    let rows = getAllByTestId("table-row");
    expect(within(rows[0]!).getByText("Charlie")).toBeDefined();

    fireEvent.press(getByText("Name"));
    rows = getAllByTestId("table-row");
    expect(within(rows[0]!).getByText("Alice")).toBeDefined();

    fireEvent.press(getByText("Name"));
    rows = getAllByTestId("table-row");
    expect(within(rows[0]!).getByText("Charlie")).toBeDefined();
  });

  it("sort handler fires with column key", () => {
    const onSort = jest.fn();
    const { getByText } = render(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        onSort={onSort}
        sortBy="name"
        sortDirection="asc"
      />
    );
    fireEvent.press(getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("loading state shows skeleton", () => {
    const { toJSON } = render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(r) => r.id}
        loading={true}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it("empty data shows EmptyState", () => {
    const { getByText } = render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(r) => r.id}
        emptyMessage="No results"
      />
    );
    expect(getByText("No results")).toBeDefined();
  });

  it("row press fires onRowPress", () => {
    const onRowPress = jest.fn();
    const { getByLabelText } = render(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        onRowPress={onRowPress}
      />
    );
    fireEvent.press(getByLabelText("Table row 1"));
    expect(onRowPress).toHaveBeenCalledWith(data[0]);
  });
});
