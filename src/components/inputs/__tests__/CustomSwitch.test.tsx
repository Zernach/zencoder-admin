import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { CustomSwitch } from "../CustomSwitch";

describe("CustomSwitch", () => {
  it("renders as a switch and forwards value changes", () => {
    const onValueChange = jest.fn();
    const { getByLabelText, getByRole } = render(
      <CustomSwitch
        value={false}
        onValueChange={onValueChange}
        accessibilityLabel="Email Notifications"
      />,
    );

    expect(getByRole("switch")).toBeTruthy();

    fireEvent(getByLabelText("Email Notifications"), "valueChange", true);

    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});
