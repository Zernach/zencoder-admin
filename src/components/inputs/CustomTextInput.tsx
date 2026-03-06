import { forwardRef, useCallback } from "react";
import type { MutableRefObject } from "react";
import { Text, TextInput as NativeTextInput, StyleSheet, View } from "react-native";
import type { StyleProp, TextInput as NativeTextInputHandle, TextInputProps, TextStyle, ViewStyle } from "react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme";
import { borderWidth, fontSizes, radius, spacing } from "@/theme/tokens";
import { GLOBAL_TEXT_INPUT_PROPS_BY_THEME } from "./textInputDefaults";
import { isWeb } from "@/constants";

export interface CustomTextInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  textValueRef?: MutableRefObject<string>;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
  showInputContainer?: boolean;
}

export const CustomTextInput = forwardRef<NativeTextInputHandle, CustomTextInputProps>(
  (
    {
      label,
      error,
      textValueRef,
      containerStyle,
      inputContainerStyle,
      style,
      onChangeText,
      placeholderTextColor,
      showInputContainer = true,
      ...props
    },
    forwardedRef,
  ) => {
    const { mode } = useThemeMode();
    const theme = semanticThemes[mode];
    const managedProps = GLOBAL_TEXT_INPUT_PROPS_BY_THEME[mode];
    const hasError = Boolean(error && error.trim().length > 0);
    const webFocusOutlineReset = isWeb ? styles.webFocusOutlineReset : undefined;

    const handleChangeText = useCallback(
      (nextValue: string) => {
        if (textValueRef) {
          textValueRef.current = nextValue;
        }
        onChangeText?.(nextValue);
      },
      [onChangeText, textValueRef],
    );

    const inputElement = (
      <NativeTextInput
        ref={forwardedRef}
        {...managedProps}
        {...props}
        onChangeText={handleChangeText}
        placeholderTextColor={placeholderTextColor ?? managedProps.placeholderTextColor}
        style={[styles.input, webFocusOutlineReset, { color: theme.text.primary }, style]}
      />
    );

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text> : null}
        {showInputContainer ? (
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.bg.surface,
                borderColor: hasError ? theme.state.error : theme.border.default,
              },
              inputContainerStyle,
            ]}
          >
            {inputElement}
          </View>
        ) : (
          inputElement
        )}
        {hasError ? <Text style={[styles.errorText, { color: theme.state.error }]}>{error}</Text> : null}
      </View>
    );
  },
);

CustomTextInput.displayName = "CustomTextInput";

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  inputContainer: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.sm,
    minHeight: 42,
    paddingHorizontal: spacing[3],
    justifyContent: "center",
  },
  input: {
    fontSize: fontSizes.md,
    lineHeight: 20,
    minHeight: 20,
    paddingVertical: 0,
  },
  webFocusOutlineReset: {
    outlineColor: "transparent",
    outlineStyle: "solid",
    outlineWidth: 0,
  },
  errorText: {
    fontSize: fontSizes.sm,
    lineHeight: 16,
  },
});
