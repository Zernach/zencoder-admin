import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { InputForm } from "../InputForm";

describe("InputForm", () => {
  it("renders title, subtitle, error, inputs, custom items, and footer", () => {
    const onChangeText = jest.fn();

    const { getByText, getByPlaceholderText } = render(
      <InputForm
        title="Create Team"
        subtitle="Add a new team to the organization"
        errorMessage="Team name is required"
        items={[
          {
            key: "name",
            type: "input",
            inputProps: {
              label: "Team Name",
              placeholder: "e.g. Platform",
              onChangeText,
            },
          },
          {
            key: "custom-note",
            type: "custom",
            element: <Text>Custom slot</Text>,
          },
        ]}
        footer={<Text>Footer actions</Text>}
      />,
    );

    expect(getByText("Create Team")).toBeTruthy();
    expect(getByText("Add a new team to the organization")).toBeTruthy();
    expect(getByText("Team name is required")).toBeTruthy();
    expect(getByText("Custom slot")).toBeTruthy();
    expect(getByText("Footer actions")).toBeTruthy();
    expect(getByText("Team Name")).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText("e.g. Platform"), "AI Platform");
    expect(onChangeText).toHaveBeenCalledWith("AI Platform");
  });
});

