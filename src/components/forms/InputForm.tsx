import React, { useCallback } from "react";
import { View, Text, StyleSheet, type ListRenderItemInfo } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { CustomList } from "@/components/lists";
import { CustomTextInput } from "@/components/inputs";
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
  },
  errorBanner: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  errorText: {
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
  itemSeparator: {
    height: spacing[3],
  },
});
