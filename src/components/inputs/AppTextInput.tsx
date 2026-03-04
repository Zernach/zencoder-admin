import React from "react";
import { TextInput as NativeTextInput, StyleSheet } from "react-native";
import type { TextInput as NativeTextInputHandle, TextInputProps } from "react-native";
import { semanticThemes } from "@/theme";
import { useThemeMode } from "@/providers/ThemeProvider";
import { GLOBAL_TEXT_INPUT_PROPS_BY_THEME } from "./textInputDefaults";

export interface AppTextInputProps extends TextInputProps {
  textValueRef?: React.MutableRefObject<string>;
}

export const AppTextInput = React.forwardRef<NativeTextInputHandle, AppTextInputProps>(
  ({ style, onChangeText, textValueRef, ...props }, forwardedRef) => {
    const { mode } = useThemeMode();
    const theme = semanticThemes[mode];
    const managedProps = GLOBAL_TEXT_INPUT_PROPS_BY_THEME[mode];

    const handleChangeText = React.useCallback(
      (nextValue: string) => {
        if (textValueRef) {
          textValueRef.current = nextValue;
        }
        onChangeText?.(nextValue);
      },
      [onChangeText, textValueRef]
    );

    return (
      <NativeTextInput
        ref={forwardedRef}
        {...managedProps}
        {...props}
        onChangeText={handleChangeText}
        style={[styles.input, { color: theme.text.primary }, style]}
      />
    );
  }
);

AppTextInput.displayName = "AppTextInput";

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 0,
  },
});
