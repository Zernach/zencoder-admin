import React from "react";
import { render, fireEvent, within } from "@testing-library/react-native";
import { Text } from "react-native";
import { DataTable, type ColumnDef } from "../DataTable";

// Mock dependencies
jest.mock("lucide-react-native", () => ({
  ChevronUp: () => "ChevronUp",
  ChevronDown: () => "ChevronDown",
  ChevronLeft: () => "ChevronLeft",
  ChevronRight: () => "ChevronRight",
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

const paginatedData: TestRow[] = Array.from({ length: 30 }, (_, idx) => ({
  id: String(idx + 1),
  name: `User ${idx + 1}`,
  value: idx + 1,
}));

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

  it("initialSortBy shows sort indicator on mount", () => {
    const { getByLabelText } = render(
      <DataTable
        columns={columns}
        data={unsortedData}
        keyExtractor={(r) => r.id}
        initialSortBy="value"
        initialSortDirection="desc"
      />
    );
    // Active column should have direction in accessibility label
    expect(getByLabelText("Sort by Value, descending")).toBeDefined();
    // Other columns should NOT have direction
    expect(getByLabelText("Sort by ID")).toBeDefined();
    expect(getByLabelText("Sort by Name")).toBeDefined();
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

  it("keeps wrapped text right-aligned in the final column", () => {
    const longValue = "This is a long value that wraps to multiple lines in narrow columns";
    const longTextColumns: ColumnDef<{ id: string; notes: string }>[] = [
      { key: "id", header: "ID", width: 80 },
      { key: "notes", header: "Notes" },
    ];
    const longTextData = [{ id: "1", notes: longValue }];

    const { getByText } = render(
      <DataTable
        columns={longTextColumns}
        data={longTextData}
        keyExtractor={(r) => r.id}
      />
    );

    expect(getByText(longValue)).toHaveStyle({ textAlign: "right" });
  });

  it("keeps rendered text right-aligned in the final column", () => {
    const longValue = "Rendered long text should stay right aligned";
    const longTextColumns: ColumnDef<{ id: string; notes: string }>[] = [
      { key: "id", header: "ID", width: 80 },
      {
        key: "notes",
        header: "Notes",
        render: (row) => <Text>{row.notes}</Text>,
      },
    ];
    const longTextData = [{ id: "1", notes: longValue }];

    const { getByText } = render(
      <DataTable
        columns={longTextColumns}
        data={longTextData}
        keyExtractor={(r) => r.id}
      />
    );

    expect(getByText(longValue)).toHaveStyle({ textAlign: "right" });
  });

  it("does not paginate by default", () => {
    const { queryByLabelText, getByText } = render(
      <DataTable
        columns={columns}
        data={paginatedData}
        keyExtractor={(r) => r.id}
      />
    );

    expect(queryByLabelText("Next page")).toBeNull();
    expect(getByText("User 30")).toBeDefined();
  });

  it("paginates rows when paginate is enabled", () => {
    const { getByLabelText, getByText, queryByText } = render(
      <DataTable
        columns={columns}
        data={paginatedData}
        keyExtractor={(r) => r.id}
        paginate
      />
    );

    expect(getByText("User 1")).toBeDefined();
    expect(getByText("User 25")).toBeDefined();
    expect(queryByText("User 26")).toBeNull();
    expect(getByText(/Showing 1.?25 of 30/)).toBeDefined();

    fireEvent.press(getByLabelText("Next page"));

    expect(getByText("User 26")).toBeDefined();
    expect(getByText("User 30")).toBeDefined();
    expect(queryByText("User 1")).toBeNull();
    expect(getByText(/Showing 26.?30 of 30/)).toBeDefined();
  });
});
