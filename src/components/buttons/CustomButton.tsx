import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export interface CustomButtonProps extends Omit<PressableProps, "children"> {
  label?: string;
  children?: React.ReactNode;
  textStyle?: StyleProp<TextStyle>;
  pressedOpacity?: number;
  disablePressedStyle?: boolean;
}

function resolveButtonStyle(
  style: PressableProps["style"],
  state: PressableStateCallbackType,
  pressedOpacity: number,
  disablePressedStyle: boolean,
  disabled?: boolean,
): StyleProp<ViewStyle> {
  const resolvedStyle =
    typeof style === "function" ? style(state) : style;

  if (disablePressedStyle || !state.pressed || disabled) {
    return resolvedStyle;
  }

  return [resolvedStyle, { opacity: pressedOpacity }];
}

export function CustomButton({
  label,
  children,
  textStyle,
  pressedOpacity = 0.85,
  disablePressedStyle = false,
  style,
  disabled,
  ...pressableProps
}: CustomButtonProps) {
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      style={(state) =>
        resolveButtonStyle(
          style,
          state,
          pressedOpacity,
          disablePressedStyle,
          isDisabled,
        )
      }
    >
      {label ? <Text style={[styles.label, textStyle]}>{label}</Text> : children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
