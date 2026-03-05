import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { CustomTextInput } from "@/components/inputs";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, fontSizes, radius, spacing } from "@/theme/tokens";

export type InputFormTextInputItem = {
  key: string;
  type: "input";
  inputProps: React.ComponentProps<typeof CustomTextInput>;
};

export type InputFormCustomItem = {
  key: string;
  type: "custom";
  element: ReactNode;
};

export type InputFormItem = InputFormTextInputItem | InputFormCustomItem;

export interface InputFormProps {
  title?: string;
  subtitle?: string;
  errorMessage?: string | null;
  icon?: ReactNode;
  items: InputFormItem[];
  footer?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export function InputForm({
  title,
  subtitle,
  errorMessage,
  icon,
  items,
  footer,
  containerStyle,
}: InputFormProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <View
      style={[
        styles.formContainer,
        {
          backgroundColor: theme.bg.surface,
          borderColor: theme.border.default,
        },
        containerStyle,
      ]}
    >
      {icon}
      {title ? <Text style={[styles.formTitle, { color: theme.text.primary }]}>{title}</Text> : null}
      {subtitle ? <Text style={[styles.formSubtitle, { color: theme.text.secondary }]}>{subtitle}</Text> : null}
      {errorMessage ? (
        <View style={[styles.errorBanner, { borderColor: theme.state.error, backgroundColor: theme.bg.surfaceElevated }]}>
          <Text style={[styles.errorText, { color: theme.state.error }]}>{errorMessage}</Text>
        </View>
      ) : null}
      {items.map((item) => {
        if (item.type === "custom") {
          return <React.Fragment key={item.key}>{item.element}</React.Fragment>;
        }

        return <CustomTextInput key={item.key} {...item.inputProps} />;
      })}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    padding: spacing[4],
    gap: spacing[3],
    width: "100%",
  },
  formTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
  },
  formSubtitle: {
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  errorBanner: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  errorText: {
    fontSize: fontSizes.sm,
    lineHeight: 18,
    textAlign: "center",
  },
});
