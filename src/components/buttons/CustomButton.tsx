import React, { useMemo } from "react";
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
import { useThemeMode, type AppThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes, type SemanticTheme } from "@/theme/themes";
import { borderWidth, layout, radius, spacing } from "@/theme/tokens";

export type CustomButtonMode =
  | "unstyled"
  | "primary"
  | "secondary"
  | "surface"
  | "ghost";
export type CustomButtonSize =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "compact"
  | "iconSm"
  | "iconMd";

export interface CustomButtonProps extends Omit<PressableProps, "children"> {
  label?: string;
  children?: React.ReactNode;
  textStyle?: StyleProp<TextStyle>;
  pressedOpacity?: number;
  disablePressedStyle?: boolean;
  buttonMode?: CustomButtonMode;
  buttonSize?: CustomButtonSize;
}

function resolveButtonStyle(
  style: PressableProps["style"],
  baseStyle: StyleProp<ViewStyle>,
  disabledStyle: StyleProp<ViewStyle> | undefined,
  state: PressableStateCallbackType,
  pressedOpacity: number,
  disablePressedStyle: boolean,
  disabled?: boolean,
): StyleProp<ViewStyle> {
  const resolvedStyle =
    typeof style === "function" ? style(state) : style;

  if (disablePressedStyle || !state.pressed || disabled) {
    return [baseStyle, resolvedStyle, disabled && disabledStyle];
  }

  return [baseStyle, resolvedStyle, disabled && disabledStyle, { opacity: pressedOpacity }];
}

interface ButtonModeStyle {
  container?: ViewStyle;
  label?: TextStyle;
}

function resolveButtonModeStyle(
  buttonMode: CustomButtonMode,
  theme: Omit<SemanticTheme, "shadows">,
  mode: AppThemeMode,
): ButtonModeStyle {
  switch (buttonMode) {
    case "primary":
      return {
        container: {
          backgroundColor: theme.border.brand,
          borderRadius: radius.sm,
        },
        label: {
          color: theme.text.onBrand,
        },
      };
    case "secondary":
      return {
        container: {
          backgroundColor: "transparent",
          borderColor: theme.border.brand,
          borderWidth: borderWidth.strong,
          borderRadius: radius.full,
        },
        label: {
          color: mode === "dark" ? "#FFFFFF" : "#000000",
        },
      };
    case "surface":
      return {
        container: {
          backgroundColor: theme.bg.surface,
          borderColor: theme.border.default,
          borderWidth: borderWidth.hairline,
          borderRadius: radius.md,
        },
        label: {
          color: theme.text.secondary,
        },
      };
    case "ghost":
      return {
        container: {
          backgroundColor: "transparent",
          borderRadius: radius.md,
        },
        label: {
          color: theme.text.secondary,
        },
      };
    case "unstyled":
    default:
      return {};
  }
}

export function CustomButton({
  label,
  children,
  textStyle,
  pressedOpacity = 0.85,
  disablePressedStyle = false,
  buttonMode = "unstyled",
  buttonSize = "none",
  style,
  disabled,
  ...pressableProps
}: CustomButtonProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const isDisabled = Boolean(disabled);
  const modeStyle = useMemo(
    () => resolveButtonModeStyle(buttonMode, theme, mode),
    [buttonMode, theme, mode],
  );
  const baseStyle = useMemo(
    () => [modeStyle.container, sizeStyles[buttonSize]],
    [modeStyle.container, buttonSize],
  );
  const labelStyleResolved = useMemo(
    () => [styles.label, modeStyle.label, isDisabled && styles.disabledLabel, textStyle],
    [modeStyle.label, isDisabled, textStyle],
  );

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      style={(state) =>
        resolveButtonStyle(
          style,
          baseStyle,
          isDisabled ? styles.disabled : undefined,
          state,
          pressedOpacity,
          disablePressedStyle,
          isDisabled,
        )
      }
    >
      {label ? <Text style={labelStyleResolved}>{label}</Text> : children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.45,
  },
  disabledLabel: {
    opacity: 0.85,
  },
});

const sizeStyles = StyleSheet.create<Record<CustomButtonSize, ViewStyle>>({
  none: {},
  sm: {
    minHeight: 32,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[6],
    alignItems: "center",
    justifyContent: "center",
  },
  md: {
    minHeight: 40,
    paddingHorizontal: spacing[24],
    paddingVertical: spacing[8],
    alignItems: "center",
    justifyContent: "center",
  },
  lg: {
    minHeight: layout.touchTargetMin,
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[12],
    alignItems: "center",
    justifyContent: "center",
  },
  compact: {
    minHeight: 30,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    alignItems: "center",
    justifyContent: "center",
  },
  iconSm: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconMd: {
    width: layout.touchTargetMin,
    height: layout.touchTargetMin,
    alignItems: "center",
    justifyContent: "center",
  },
});
