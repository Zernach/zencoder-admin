import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@/components/buttons";
import { AlertTriangle } from "lucide-react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing } from "@/theme/tokens";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState = React.memo(function ErrorState({
  message,
  onRetry,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const displayMessage = message ?? t("errors.somethingWentWrong");

  return (
    <View style={styles.container}>
      <AlertTriangle size={32} color={theme.state.error} />
      <Text style={[styles.message, { color: theme.text.secondary }]}>{displayMessage}</Text>
      <CustomButton
        onPress={onRetry}
        style={styles.button}
        buttonMode="primary"
        buttonSize="md"
        label={t("common.retry")}
        accessibilityRole="button"
        accessibilityLabel={t("common.retry")}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[32],
    gap: spacing[12],
    minHeight: 200,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    marginTop: spacing[16],
  },
});
