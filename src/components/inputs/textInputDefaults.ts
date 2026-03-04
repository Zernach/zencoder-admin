import type { TextInputProps } from "react-native";
import type { AppThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme";

type ManagedGlobalTextInputProps = Pick<
  TextInputProps,
  | "keyboardType"
  | "keyboardAppearance"
  | "autoCorrect"
  | "autoCapitalize"
  | "spellCheck"
  | "returnKeyType"
  | "placeholderTextColor"
  | "selectionColor"
  | "cursorColor"
  | "selectionHandleColor"
>;

const GLOBAL_TEXT_INPUT_BASE_PROPS: Omit<
  ManagedGlobalTextInputProps,
  "keyboardAppearance" | "placeholderTextColor" | "selectionColor" | "cursorColor" | "selectionHandleColor"
> = Object.freeze({
  keyboardType: "default",
  autoCorrect: false,
  autoCapitalize: "none",
  spellCheck: false,
  returnKeyType: "done",
});

const GLOBAL_TEXT_INPUT_THEME_OVERRIDES: Readonly<
  Record<
    AppThemeMode,
    Pick<
      ManagedGlobalTextInputProps,
      "keyboardAppearance" | "placeholderTextColor" | "selectionColor" | "cursorColor" | "selectionHandleColor"
    >
  >
> = Object.freeze({
  dark: Object.freeze({
    keyboardAppearance: "dark",
    placeholderTextColor: semanticThemes.dark.text.tertiary,
    selectionColor: semanticThemes.dark.border.brand,
    cursorColor: semanticThemes.dark.border.brand,
    selectionHandleColor: semanticThemes.dark.border.brand,
  }),
  light: Object.freeze({
    keyboardAppearance: "light",
    placeholderTextColor: semanticThemes.light.text.tertiary,
    selectionColor: semanticThemes.light.border.brand,
    cursorColor: semanticThemes.light.border.brand,
    selectionHandleColor: semanticThemes.light.border.brand,
  }),
});

export const GLOBAL_TEXT_INPUT_PROPS_BY_THEME: Readonly<
  Record<AppThemeMode, Readonly<ManagedGlobalTextInputProps>>
> = Object.freeze({
  dark: Object.freeze({
    ...GLOBAL_TEXT_INPUT_BASE_PROPS,
    ...GLOBAL_TEXT_INPUT_THEME_OVERRIDES.dark,
  }),
  light: Object.freeze({
    ...GLOBAL_TEXT_INPUT_BASE_PROPS,
    ...GLOBAL_TEXT_INPUT_THEME_OVERRIDES.light,
  }),
});

