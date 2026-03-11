import React, { useCallback } from "react";
import { View, Text, StyleSheet, type ListRenderItemInfo } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { CustomList } from "@/components/lists";
import { CustomTextInput } from "@/components/inputs";
import { CustomButton } from "@/components/buttons";
import { keyExtractors } from "@/constants";
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
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function InputForm({
  title,
  subtitle,
  errorMessage,
  icon,
  items,
  footer,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  submitDisabled,
  containerStyle,
}: InputFormProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<InputFormItem>) => {
      if (item.type === "custom") {
        return <>{item.element}</>;
      }

      return <CustomTextInput {...item.inputProps} />;
    },
    [],
  );
  const renderItemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [],
  );

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
      <CustomList
        flatListProps={{
          data: items,
          renderItem,
          keyExtractor: keyExtractors.byKey,
          scrollEnabled: false,
          showsVerticalScrollIndicator: false,
          ItemSeparatorComponent: renderItemSeparator,
        }}
      />
      {footer}
      {onSubmit ? (
        <View style={styles.buttonRow}>
          {onCancel ? (
            <CustomButton
              onPress={onCancel}
              buttonMode="unstyled"
              buttonSize="md"
              label={cancelLabel}
              disablePressedStyle
              textStyle={{ color: theme.text.secondary }}
              style={({ pressed }) => [
                styles.cancelButton,
                { backgroundColor: pressed ? theme.bg.subtle : "transparent" },
              ]}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            />
          ) : null}
          <CustomButton
            onPress={onSubmit}
            buttonMode="primary"
            buttonSize="md"
            label={submitLabel}
            accessibilityRole="button"
            accessibilityLabel={submitLabel}
            disabled={submitDisabled}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    padding: spacing[16],
    gap: spacing[12],
    width: "100%",
  },
  formTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
  },
  formSubtitle: {
    fontSize: fontSizes.sm,
  },
  errorBanner: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
  },
  errorText: {
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
  itemSeparator: {
    height: spacing[8],
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing[12],
    marginTop: spacing[8],
  },
  cancelButton: {
    borderRadius: radius.sm,
  },
});
