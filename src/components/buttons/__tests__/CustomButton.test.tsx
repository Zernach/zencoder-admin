import React from "react";
import { StyleSheet, type PressableStateCallbackType } from "react-native";
import { render } from "@testing-library/react-native";
import { CustomButton } from "@/components/buttons";
import { semanticThemes } from "@/theme/themes";
import { radius } from "@/theme/tokens";

function resolvePressableStyle(styleProp: unknown) {
  if (typeof styleProp !== "function") {
    return StyleSheet.flatten(styleProp);
  }

  const state: PressableStateCallbackType = {
    pressed: false,
  };

  return StyleSheet.flatten(styleProp(state));
}

describe("CustomButton", () => {
  it("applies primary mode visual defaults", () => {
    const { getByTestId, getByText } = render(
      <CustomButton testID="primary-button" label="Primary CTA" buttonMode="primary" />,
    );

    const button = getByTestId("primary-button");
    const label = getByText("Primary CTA");
    const resolvedButtonStyle = resolvePressableStyle(button.props.style);
    const resolvedLabelStyle = StyleSheet.flatten(label.props.style);

    expect(resolvedButtonStyle.backgroundColor).toBe(semanticThemes.dark.border.brand);
    expect(resolvedButtonStyle.borderRadius).toBe(radius.sm);
    expect(resolvedLabelStyle.color).toBe(semanticThemes.dark.text.onBrand);
  });

  it("applies secondary mode circular outline defaults", () => {
    const { getByTestId, getByText } = render(
      <CustomButton testID="secondary-button" label="Secondary CTA" buttonMode="secondary" />,
    );

    const button = getByTestId("secondary-button");
    const label = getByText("Secondary CTA");
    const resolvedButtonStyle = resolvePressableStyle(button.props.style);
    const resolvedLabelStyle = StyleSheet.flatten(label.props.style);

    expect(resolvedButtonStyle.backgroundColor).toBe("transparent");
    expect(resolvedButtonStyle.borderColor).toBe(semanticThemes.dark.border.brand);
    expect(resolvedButtonStyle.borderRadius).toBe(radius.full);
    expect(resolvedLabelStyle.color).toBe("#FFFFFF");
  });

  it("applies disabled opacity", () => {
    const { getByTestId } = render(
      <CustomButton testID="disabled-button" label="Disabled" disabled buttonMode="primary" />,
    );

    const button = getByTestId("disabled-button");
    const resolvedButtonStyle = resolvePressableStyle(button.props.style);

    expect(resolvedButtonStyle.opacity).toBe(0.45);
  });
});
